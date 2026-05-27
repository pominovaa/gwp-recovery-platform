type StripeProductClient = {
  products: {
    retrieve: (productId: string) => Promise<{
      default_price?: string | { id: string } | null;
    }>;
  };
};

export async function resolveCheckoutPriceId(stripe: StripeProductClient, configuredId: string) {
  if (configuredId.startsWith("price_")) {
    return configuredId;
  }

  if (!configuredId.startsWith("prod_")) {
    throw new Error("Stripe plan IDs must be price_ IDs, or prod_ IDs with a default price.");
  }

  const product = await stripe.products.retrieve(configuredId);
  const defaultPrice = product.default_price;

  if (!defaultPrice) {
    throw new Error("This Stripe product does not have a default price. Add a recurring price in Stripe or use a price_ ID.");
  }

  return typeof defaultPrice === "string" ? defaultPrice : defaultPrice.id;
}
