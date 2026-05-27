import { beforeEach, describe, expect, it, vi } from "vitest";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getStripe } from "@/lib/billing/stripe";

vi.mock("@/lib/billing/stripe", () => ({
  getStripe: vi.fn(),
}));

function createWebhookRequest({
  body = "{}",
  signature = "sig_test",
}: {
  body?: string;
  signature?: string | null;
} = {}) {
  return {
    headers: new Headers(signature ? { "stripe-signature": signature } : undefined),
    text: vi.fn(async () => body),
  } as any;
}

function createUpdateQuery() {
  const query: any = {
    update: vi.fn(() => query),
    eq: vi.fn(() => query),
    upsert: vi.fn(async () => ({ error: null })),
  };

  return query;
}

describe("billing webhook route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_test");
  });

  it("rejects requests without a Stripe signature", async () => {
    const { POST } = await import("@/app/api/billing/webhook/route");

    const response = await POST(createWebhookRequest({ signature: null }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Missing Stripe webhook signature or secret." });
  });

  it("rejects invalid signatures", async () => {
    vi.mocked(getStripe).mockReturnValue({
      webhooks: {
        constructEvent: vi.fn(() => {
          throw new Error("Invalid signature");
        }),
      },
    } as any);
    const { POST } = await import("@/app/api/billing/webhook/route");

    const response = await POST(createWebhookRequest());

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Invalid signature" });
  });

  it("syncs checkout customer IDs to profiles", async () => {
    const query = createUpdateQuery();
    vi.mocked(supabaseAdmin.from).mockReturnValue(query);
    vi.mocked(getStripe).mockReturnValue({
      webhooks: {
        constructEvent: vi.fn(() => ({
          type: "checkout.session.completed",
          data: {
            object: {
              customer: "cus_test",
              metadata: { supabase_user_id: "user_1" },
            },
          },
        })),
      },
    } as any);
    const { POST } = await import("@/app/api/billing/webhook/route");

    const response = await POST(createWebhookRequest());

    expect(response.status).toBe(200);
    expect(supabaseAdmin.from).toHaveBeenCalledWith("profiles");
    expect(query.update).toHaveBeenCalledWith(expect.objectContaining({ stripe_customer_id: "cus_test" }));
    expect(query.eq).toHaveBeenCalledWith("id", "user_1");
  });

  it("upserts subscription changes", async () => {
    const query = createUpdateQuery();
    vi.mocked(supabaseAdmin.from).mockReturnValue(query);
    vi.mocked(getStripe).mockReturnValue({
      webhooks: {
        constructEvent: vi.fn(() => ({
          type: "customer.subscription.updated",
          data: {
            object: {
              id: "sub_test",
              customer: "cus_test",
              metadata: { supabase_user_id: "user_1", plan_id: "light" },
              status: "active",
              current_period_end: 1800000000,
              cancel_at_period_end: false,
            },
          },
        })),
      },
    } as any);
    const { POST } = await import("@/app/api/billing/webhook/route");

    const response = await POST(createWebhookRequest());

    expect(response.status).toBe(200);
    expect(supabaseAdmin.from).toHaveBeenCalledWith("subscriptions");
    expect(query.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "sub_test",
        user_id: "user_1",
        stripe_customer_id: "cus_test",
        plan_id: "light",
        status: "active",
      }),
      { onConflict: "id" }
    );
  });

  it("returns a clean error when webhook sync fails", async () => {
    const query = createUpdateQuery();
    query.upsert.mockRejectedValueOnce(new Error("database unavailable"));
    vi.mocked(supabaseAdmin.from).mockReturnValue(query);
    vi.mocked(getStripe).mockReturnValue({
      webhooks: {
        constructEvent: vi.fn(() => ({
          type: "customer.subscription.deleted",
          data: {
            object: {
              id: "sub_test",
              customer: "cus_test",
              metadata: { supabase_user_id: "user_1", plan_id: "light" },
              status: "canceled",
              cancel_at_period_end: false,
            },
          },
        })),
      },
    } as any);
    const { POST } = await import("@/app/api/billing/webhook/route");

    const response = await POST(createWebhookRequest());

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: "database unavailable" });
  });
});
