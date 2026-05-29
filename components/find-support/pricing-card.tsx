import { Check, Eye, Gift, Sparkles } from "lucide-react";
import { CheckoutButton } from "@/components/billing/checkout-button";
import { Card, CardContent } from "@/components/ui/card";
import { cn, designSystem } from "@/lib/design-system";
import type { BillingPlanId } from "@/lib/billing/plans";

type PricingCardProps = {
  tier: {
    cta: string;
    featured?: boolean;
    features: string[];
    name: string;
    note: string;
    planId?: BillingPlanId;
    preview?: boolean;
    price: string;
  };
};

export function PricingCard({ tier }: PricingCardProps) {
  return (
    <Card
      className={cn(
        designSystem.components.card.pricing,
        "min-w-0 overflow-hidden",
        tier.featured ? "border-stone-950 bg-stone-950 text-white" : "border-stone-200 bg-white"
      )}
    >
      <CardContent className="flex h-full min-w-0 flex-col p-5 sm:p-7">
        <div className="mb-5 flex min-w-0 items-center justify-between gap-3">
          <h3 className="min-w-0 break-words text-2xl font-semibold">{tier.name}</h3>
          {tier.featured && <Sparkles className="h-6 w-6" />}
          {tier.preview && <Eye className="h-6 w-6 text-stone-700" />}
        </div>
        <div className="text-4xl font-semibold tracking-tight">{tier.price}</div>
        <p className={`mt-2 text-sm ${tier.featured ? "text-stone-300" : "text-stone-500"}`}>{tier.note}</p>
        <div className="my-7 space-y-3">
          {tier.features.map((feature) => (
            <div key={feature} className="flex min-w-0 gap-3 text-sm leading-6">
              <Check className={`mt-0.5 h-5 w-5 flex-none ${tier.featured ? "text-white" : "text-stone-900"}`} />
              <span className={`min-w-0 break-words ${tier.featured ? "text-stone-100" : "text-stone-650"}`}>{feature}</span>
            </div>
          ))}
        </div>
        <div className="mt-auto space-y-3">
          <CheckoutButton planId={tier.planId} variant={tier.featured ? "inverse" : "default"} className="h-11 rounded-full">
            {tier.cta}
          </CheckoutButton>
          {tier.planId && (
            <div className={`min-w-0 rounded-2xl border p-3 ${tier.featured ? "border-white/15 bg-white/5" : "border-stone-200 bg-stone-50"}`}>
              <div className={`mb-2 text-xs font-semibold uppercase tracking-[0.18em] ${tier.featured ? "text-stone-300" : "text-stone-500"}`}>
                Gift access
              </div>
              <CheckoutButton
                gift
                planId={tier.planId}
                className={`h-10 rounded-full border ${
                  tier.featured
                    ? "border-white/25 bg-stone-900 text-white hover:bg-stone-800"
                    : "border-stone-200 bg-white text-stone-950 hover:bg-stone-50"
                }`}
              >
                <span className="inline-flex min-w-0 flex-wrap items-center justify-center gap-2">
                  <Gift className="h-4 w-4" />
                  Gift subscription
                </span>
              </CheckoutButton>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
