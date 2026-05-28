import { Check, Eye, Sparkles } from "lucide-react";
import { CheckoutButton } from "@/components/billing/checkout-button";
import { Card, CardContent } from "@/components/ui/card";
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
    <Card className={`rounded-[2rem] border shadow-sm ${tier.featured ? "border-stone-950 bg-stone-950 text-white" : "border-stone-200 bg-white"}`}>
      <CardContent className="flex h-full flex-col p-7">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-2xl font-semibold">{tier.name}</h3>
          {tier.featured && <Sparkles className="h-6 w-6" />}
          {tier.preview && <Eye className="h-6 w-6 text-stone-700" />}
        </div>
        <div className="text-4xl font-semibold tracking-tight">{tier.price}</div>
        <p className={`mt-2 text-sm ${tier.featured ? "text-stone-300" : "text-stone-500"}`}>{tier.note}</p>
        <div className="my-7 space-y-3">
          {tier.features.map((feature) => (
            <div key={feature} className="flex gap-3 text-sm leading-6">
              <Check className={`mt-0.5 h-5 w-5 flex-none ${tier.featured ? "text-white" : "text-stone-900"}`} />
              <span className={tier.featured ? "text-stone-100" : "text-stone-650"}>{feature}</span>
            </div>
          ))}
        </div>
        <CheckoutButton planId={tier.planId} variant={tier.featured ? "inverse" : "default"} className="mt-auto h-11 rounded-full">
          {tier.cta}
        </CheckoutButton>
      </CardContent>
    </Card>
  );
}
