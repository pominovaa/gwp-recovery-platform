"use client";

import { Button } from "@/components/ui/button";
import { BillingPortalButton } from "@/components/billing/billing-portal-button";
import { Card, CardContent } from "@/components/ui/card";

type AccountPanelProps = {
  authError: string;
  authLoading: boolean;
  email?: string;
  onSignOut: () => void;
};

export function AccountPanel({ authError, authLoading, email, onSignOut }: AccountPanelProps) {
  return (
    <>
      <div className="mb-6 flex flex-col gap-3 rounded-[2rem] border border-stone-200 bg-stone-50 p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm font-semibold text-stone-950">{email}</div>
          <div className="mt-1 text-sm text-stone-600">Signed in to your private profile.</div>
        </div>
        <Button
          type="button"
          onClick={onSignOut}
          disabled={authLoading}
          className="h-11 rounded-full bg-stone-950 px-5 text-white hover:bg-stone-800"
        >
          {authLoading ? "Signing out..." : "Sign out"}
        </Button>
      </div>

      {authError && <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{authError}</div>}

      <div className="grid gap-5 md:grid-cols-2">
        <Card className="rounded-[2rem] border-stone-200 bg-white shadow-sm">
          <CardContent className="p-7">
            <h2 className="text-xl font-semibold text-stone-950">Donations</h2>
            <p className="mt-3 leading-7 text-stone-600">View contribution level, renewal date, gift donations, billing status, and the 14-day guarantee.</p>
            <BillingPortalButton className="mt-5 h-11 rounded-full bg-stone-950 px-5 text-white hover:bg-stone-800" />
          </CardContent>
        </Card>
        {[
          ["Privacy", "Manage anonymity, story visibility, deletion, sharing, and moderation preferences."],
          ["Journal", "Open private reflections, recovery notes, appointment notes, and story drafts."],
          ["Saved Cards", "Return to saved coping cards, prompts, resources, and moderated stories."],
        ].map(([title, text]) => (
          <Card key={title} className="rounded-[2rem] border-stone-200 bg-white shadow-sm">
            <CardContent className="p-7">
              <h2 className="text-xl font-semibold text-stone-950">{title}</h2>
              <p className="mt-3 leading-7 text-stone-600">{text}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
