import type { BillingPlanId } from "@/lib/billing/plans";

type PricingTier = {
  cta: string;
  featured?: boolean;
  features: string[];
  name: string;
  note: string;
  planId?: BillingPlanId;
  preview?: boolean;
  price: string;
};

export const tiers: PricingTier[] = [
  {
    name: "Free",
    price: "$0",
    note: "Immediate support resources",
    cta: "Get help now",
    features: [
      "Urgent help and crisis resources",
      "Warning signs and treatment navigation",
      "Eating disorder facts and statistics",
      "Caregiver scripts and printable checklists",
    ],
  },
  {
    name: "Light",
    planId: "light",
    price: "$1/month",
    note: "Monthly contribution",
    cta: "Start light plan",
    featured: true,
    features: [
      "Funds platform development",
      "Anonymous private journal",
      "Coping cards and reflection prompts",
      "Appointment notes and provider questions",
      "Printable recovery binder pages",
    ],
  },
  {
    name: "Plus",
    planId: "plus",
    price: "$5/month",
    note: "Monthly contribution",
    cta: "Start plus preview",
    preview: true,
    features: [
      "Funds platform development",
      "Meal support reflection, not calorie tracking",
      "Distress and coping pattern view",
      "Custom reminders and treatment timeline",
      "Exportable summaries for trusted support",
    ],
  },
  {
    name: "Family",
    planId: "family",
    price: "$19/month",
    note: "Monthly contribution",
    cta: "Start family preview",
    preview: true,
    features: [
      "Funds platform development",
      "Family Circle with caregiver coordination",
      "Shared appointments and school notes",
      "Insurance and provider question tracker",
      "User-controlled sharing and privacy settings",
    ],
  },
];
