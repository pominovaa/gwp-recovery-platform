import { beforeEach, describe, expect, it, vi } from "vitest";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getStripe } from "@/lib/billing/stripe";
import { CHECKOUT_UNAVAILABLE_MESSAGE } from "@/lib/billing/errors";

vi.mock("@/lib/billing/stripe", () => ({
  getStripe: vi.fn(),
}));

function createRequest(body: unknown, authorization = "Bearer token") {
  return {
    headers: new Headers(authorization ? { authorization } : undefined),
    json: vi.fn(async () => body),
    nextUrl: new URL("http://localhost:3000/api/billing/checkout"),
  } as any;
}

function createSupabaseQuery(profile: Record<string, unknown> | null = null) {
  const query: any = {
    select: vi.fn(() => query),
    eq: vi.fn(() => query),
    maybeSingle: vi.fn(async () => ({ data: profile, error: null })),
    update: vi.fn(() => query),
  };

  return query;
}

describe("billing API routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("STRIPE_LIGHT_PRICE_ID", "price_light_test");
  });

  it("checkout returns 401 without a valid user", async () => {
    vi.mocked(supabaseAdmin.auth.getUser).mockResolvedValueOnce({ data: { user: null }, error: null });
    const { POST } = await import("@/app/api/billing/checkout/route");

    const response = await POST(createRequest({ planId: "light" }));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Please sign up or log in first." });
  });

  it("checkout rejects unknown plans", async () => {
    vi.mocked(supabaseAdmin.auth.getUser).mockResolvedValueOnce({
      data: { user: { id: "user_1", email: "alex@example.com" } },
      error: null,
    });
    const { POST } = await import("@/app/api/billing/checkout/route");

    const response = await POST(createRequest({ planId: "unknown" }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Unknown billing plan." });
  });

  it("checkout creates a Stripe session for an existing customer", async () => {
    vi.mocked(supabaseAdmin.auth.getUser).mockResolvedValueOnce({
      data: { user: { id: "user_1", email: "alex@example.com" } },
      error: null,
    });
    vi.mocked(supabaseAdmin.from).mockReturnValue(createSupabaseQuery({ stripe_customer_id: "cus_existing" }));
    vi.mocked(getStripe).mockReturnValue({
      checkout: {
        sessions: {
          create: vi.fn(async () => ({ url: "https://checkout.stripe.test/session" })),
        },
      },
    } as any);
    const { POST } = await import("@/app/api/billing/checkout/route");

    const response = await POST(createRequest({ planId: "light" }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ url: "https://checkout.stripe.test/session" });
  });

  it("checkout creates and stores a Stripe customer when missing", async () => {
    vi.mocked(supabaseAdmin.auth.getUser).mockResolvedValueOnce({
      data: { user: { id: "user_1", email: "alex@example.com" } },
      error: null,
    });
    const query = createSupabaseQuery(null);
    vi.mocked(supabaseAdmin.from).mockReturnValue(query);
    vi.mocked(getStripe).mockReturnValue({
      customers: {
        create: vi.fn(async () => ({ id: "cus_new" })),
      },
      checkout: {
        sessions: {
          create: vi.fn(async () => ({ url: "https://checkout.stripe.test/session" })),
        },
      },
    } as any);
    const { POST } = await import("@/app/api/billing/checkout/route");

    const response = await POST(createRequest({ planId: "light" }));

    expect(response.status).toBe(200);
    expect(query.update).toHaveBeenCalledWith(expect.objectContaining({ stripe_customer_id: "cus_new" }));
  });

  it("checkout resolves product IDs before creating a Stripe session", async () => {
    vi.stubEnv("STRIPE_LIGHT_PRICE_ID", "prod_light_test");
    vi.mocked(supabaseAdmin.auth.getUser).mockResolvedValueOnce({
      data: { user: { id: "user_1", email: "alex@example.com" } },
      error: null,
    });
    vi.mocked(supabaseAdmin.from).mockReturnValue(createSupabaseQuery({ stripe_customer_id: "cus_existing" }));
    const createSession = vi.fn(async () => ({ url: "https://checkout.stripe.test/session" }));
    vi.mocked(getStripe).mockReturnValue({
      products: {
        retrieve: vi.fn(async () => ({ default_price: "price_from_product" })),
      },
      checkout: {
        sessions: {
          create: createSession,
        },
      },
    } as any);
    const { POST } = await import("@/app/api/billing/checkout/route");

    const response = await POST(createRequest({ planId: "light" }));

    expect(response.status).toBe(200);
    expect(createSession).toHaveBeenCalledWith(expect.objectContaining({
      line_items: [{ price: "price_from_product", quantity: 1 }],
    }));
  });

  it("checkout returns a user-safe error when a plan price is not configured", async () => {
    vi.stubEnv("STRIPE_LIGHT_PRICE_ID", "");
    vi.mocked(supabaseAdmin.auth.getUser).mockResolvedValueOnce({
      data: { user: { id: "user_1", email: "alex@example.com" } },
      error: null,
    });
    const { POST } = await import("@/app/api/billing/checkout/route");

    const response = await POST(createRequest({ planId: "light" }));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ error: CHECKOUT_UNAVAILABLE_MESSAGE });
  });

  it("checkout returns a user-safe error when Stripe fails", async () => {
    vi.mocked(supabaseAdmin.auth.getUser).mockResolvedValueOnce({
      data: { user: { id: "user_1", email: "alex@example.com" } },
      error: null,
    });
    vi.mocked(supabaseAdmin.from).mockReturnValue(createSupabaseQuery({ stripe_customer_id: "cus_existing" }));
    vi.mocked(getStripe).mockReturnValue({
      checkout: {
        sessions: {
          create: vi.fn(async () => {
            throw new Error("Stripe unavailable");
          }),
        },
      },
    } as any);
    const { POST } = await import("@/app/api/billing/checkout/route");

    const response = await POST(createRequest({ planId: "light" }));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ error: CHECKOUT_UNAVAILABLE_MESSAGE });
  });

  it("portal returns 401 without a bearer token", async () => {
    const { POST } = await import("@/app/api/billing/portal/route");

    const response = await POST(createRequest({}, ""));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Please sign up or log in first." });
  });

  it("portal returns 401 when the token is invalid", async () => {
    vi.mocked(supabaseAdmin.auth.getUser).mockResolvedValueOnce({ data: { user: null }, error: null });
    const { POST } = await import("@/app/api/billing/portal/route");

    const response = await POST(createRequest({}));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Please sign up or log in first." });
  });

  it("portal returns 404 when no Stripe customer exists", async () => {
    vi.mocked(supabaseAdmin.auth.getUser).mockResolvedValueOnce({
      data: { user: { id: "user_1", email: "alex@example.com" } },
      error: null,
    });
    vi.mocked(supabaseAdmin.from).mockReturnValue(createSupabaseQuery(null));
    const { POST } = await import("@/app/api/billing/portal/route");

    const response = await POST(createRequest({}));

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: "No billing account found yet." });
  });

  it("portal creates a Stripe portal session", async () => {
    vi.mocked(supabaseAdmin.auth.getUser).mockResolvedValueOnce({
      data: { user: { id: "user_1", email: "alex@example.com" } },
      error: null,
    });
    vi.mocked(supabaseAdmin.from).mockReturnValue(createSupabaseQuery({ stripe_customer_id: "cus_existing" }));
    vi.mocked(getStripe).mockReturnValue({
      billingPortal: {
        sessions: {
          create: vi.fn(async () => ({ url: "https://billing.stripe.test/session" })),
        },
      },
    } as any);
    const { POST } = await import("@/app/api/billing/portal/route");

    const response = await POST(createRequest({}));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ url: "https://billing.stripe.test/session" });
  });

  it("portal returns a clean error when Stripe fails", async () => {
    vi.mocked(supabaseAdmin.auth.getUser).mockResolvedValueOnce({
      data: { user: { id: "user_1", email: "alex@example.com" } },
      error: null,
    });
    vi.mocked(supabaseAdmin.from).mockReturnValue(createSupabaseQuery({ stripe_customer_id: "cus_existing" }));
    vi.mocked(getStripe).mockReturnValue({
      billingPortal: {
        sessions: {
          create: vi.fn(async () => {
            throw new Error("Portal unavailable");
          }),
        },
      },
    } as any);
    const { POST } = await import("@/app/api/billing/portal/route");

    const response = await POST(createRequest({}));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: "Portal unavailable" });
  });
});
