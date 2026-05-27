import { afterEach, describe, expect, it, vi } from "vitest";
import { billingPlans, getBillingPlan, getPlanPriceId } from "@/lib/billing/plans";

describe("billing plans", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns known billing plans", () => {
    expect(getBillingPlan("light")).toEqual(billingPlans.light);
    expect(getBillingPlan("plus")).toEqual(billingPlans.plus);
    expect(getBillingPlan("family")).toEqual(billingPlans.family);
  });

  it("rejects unknown billing plans", () => {
    expect(getBillingPlan("free")).toBeNull();
    expect(getBillingPlan("enterprise")).toBeNull();
    expect(getBillingPlan("")).toBeNull();
  });

  it("reads the configured Stripe price ID for a plan", () => {
    vi.stubEnv("STRIPE_LIGHT_PRICE_ID", "price_light_test");
    vi.stubEnv("STRIPE_PLUS_PRICE_ID", "price_plus_test");
    vi.stubEnv("STRIPE_FAMILY_PRICE_ID", "price_family_test");

    expect(getPlanPriceId("light")).toBe("price_light_test");
    expect(getPlanPriceId("plus")).toBe("price_plus_test");
    expect(getPlanPriceId("family")).toBe("price_family_test");
  });

  it("returns undefined when a Stripe price env var is missing", () => {
    vi.stubEnv("STRIPE_LIGHT_PRICE_ID", "");

    expect(getPlanPriceId("light")).toBe("");
  });
});
