import { CircleDollarSign, Lock } from "lucide-react";
import { DonationForm } from "@/components/billing/donation-form";
import { Card, CardContent } from "@/components/ui/card";
import { PricingCard } from "@/components/find-support/pricing-card";
import { tiers } from "@/components/find-support/tiers";

function SectionTitle({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="mx-auto mb-10 max-w-3xl min-w-0 text-center">
      <div className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-stone-500 sm:tracking-[0.25em]">{eyebrow}</div>
      <h2 className="break-words text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl md:text-5xl">{title}</h2>
      {children && <p className="mt-5 break-words text-base leading-7 text-stone-600 sm:text-lg sm:leading-8">{children}</p>}
    </div>
  );
}

export function FindSupportContent() {
  return (
    <>
      <section id="find-support" className="px-4 py-20 sm:px-5 md:py-24">
        <SectionTitle eyebrow="Donate Or Gift" title="Recovery is hard. Finding support should not be.">
          Recovery can feel lonely, confusing, and exhausting. Monthly donations keep GWP building community-rated resources, moderated stories, reflection tools, and daily support. You can contribute for yourself or gift support to someone else.
        </SectionTitle>
        <div className="mx-auto grid max-w-7xl min-w-0 gap-5 lg:grid-cols-4">
          {tiers.map((tier) => (
            <PricingCard key={tier.name} tier={tier} />
          ))}
        </div>
        <DonationForm />
      </section>

      <section className="px-4 pb-24 sm:px-5">
        <div className="mx-auto grid max-w-7xl min-w-0 gap-6 lg:grid-cols-[1fr_1fr]">
          <Card className="rounded-[2rem] border-stone-200 bg-white shadow-sm">
            <CardContent className="p-7">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-900">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-semibold">Privacy promise</h3>
              <p className="mt-4 leading-7 text-stone-600">
                GWP is designed to avoid names, public profiles, body metrics, medical records, and unnecessary personal identifiers. Users control what they save, export, share, and delete.
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-[2rem] border-stone-200 bg-white shadow-sm">
            <CardContent className="p-7">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-900">
                <CircleDollarSign className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-semibold">Clear boundary</h3>
              <p className="mt-4 leading-7 text-stone-600">
                GWP provides organization, reflection, storytelling, and support tools. It does not diagnose, treat, monitor emergencies, or replace medical, nutritional, psychiatric, or crisis care.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
