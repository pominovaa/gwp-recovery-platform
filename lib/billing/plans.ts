export type BillingPlanId = "light" | "plus" | "family";

export const billingPlans: Record<
  BillingPlanId,
  {
    envKey: string;
    name: string;
  }
> = {
  light: {
    envKey: "STRIPE_LIGHT_PRICE_ID",
    name: "Light",
  },
  plus: {
    envKey: "STRIPE_PLUS_PRICE_ID",
    name: "Plus preview",
  },
  family: {
    envKey: "STRIPE_FAMILY_PRICE_ID",
    name: "Family preview",
  },
};

export function getBillingPlan(planId: string) {
  if (planId in billingPlans) {
    return billingPlans[planId as BillingPlanId];
  }

  return null;
}

export function getPlanPriceId(planId: BillingPlanId) {
  return process.env[billingPlans[planId].envKey];
}
