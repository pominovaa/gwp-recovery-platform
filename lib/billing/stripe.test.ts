import { afterEach, describe, expect, it, vi } from "vitest";

describe("getStripe", () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.doUnmock("stripe");
  });

  it("throws when Stripe secret key is missing", async () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "");
    const { getStripe } = await import("@/lib/billing/stripe");

    expect(() => getStripe()).toThrow("Missing STRIPE_SECRET_KEY");
  });

  it("creates and caches the Stripe client", async () => {
    const stripeConstructor = vi.fn(function Stripe(this: { key: string }, key: string) {
      this.key = key;
    });
    vi.doMock("stripe", () => ({ default: stripeConstructor }));
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_cache");

    const { getStripe } = await import("@/lib/billing/stripe");
    const first = getStripe();
    const second = getStripe();

    expect(first).toBe(second);
    expect(stripeConstructor).toHaveBeenCalledTimes(1);
    expect(stripeConstructor).toHaveBeenCalledWith("sk_test_cache");
  });
});
