import { describe, expect, it, vi } from "vitest";
import { resolveCheckoutPriceId } from "@/lib/billing/checkout";

function createStripeMock(defaultPrice?: string | { id: string } | null) {
  return {
    products: {
      retrieve: vi.fn().mockResolvedValue({ default_price: defaultPrice }),
    },
  };
}

describe("resolveCheckoutPriceId", () => {
  it("uses price IDs directly without retrieving a product", async () => {
    const stripe = createStripeMock("price_unused");

    await expect(resolveCheckoutPriceId(stripe, "price_light_test")).resolves.toBe("price_light_test");
    expect(stripe.products.retrieve).not.toHaveBeenCalled();
  });

  it("resolves a product ID with string default price", async () => {
    const stripe = createStripeMock("price_from_product");

    await expect(resolveCheckoutPriceId(stripe, "prod_light_test")).resolves.toBe("price_from_product");
    expect(stripe.products.retrieve).toHaveBeenCalledWith("prod_light_test");
  });

  it("resolves a product ID with expanded default price", async () => {
    const stripe = createStripeMock({ id: "price_expanded_default" });

    await expect(resolveCheckoutPriceId(stripe, "prod_plus_test")).resolves.toBe("price_expanded_default");
  });

  it("rejects product IDs without a default price", async () => {
    const stripe = createStripeMock(null);

    await expect(resolveCheckoutPriceId(stripe, "prod_without_price")).rejects.toThrow("default price");
  });

  it("rejects unsupported Stripe IDs", async () => {
    const stripe = createStripeMock("price_unused");

    await expect(resolveCheckoutPriceId(stripe, "cus_123")).rejects.toThrow("Stripe plan IDs");
    expect(stripe.products.retrieve).not.toHaveBeenCalled();
  });
});
