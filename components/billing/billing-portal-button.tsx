"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { readJsonResponse } from "@/lib/billing/errors";

type BillingPortalButtonProps = {
  className?: string;
};

export function BillingPortalButton({ className = "" }: BillingPortalButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function openPortal() {
    setError("");
    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabaseBrowser.auth.getSession();

      if (!session?.access_token) {
        setError("Please sign up or log in before managing billing.");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/billing/portal", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await readJsonResponse(response);

      if (!response.ok || !data?.url) {
        setError(data?.error || "Unable to open billing portal. Please try again.");
        setLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Billing portal is temporarily unavailable. Please try again in a moment.");
      setLoading(false);
    }
  }

  return (
    <>
      <Button type="button" onClick={openPortal} disabled={loading} className={className}>
        {loading ? "Opening billing..." : "Manage billing"}
      </Button>
      {error && <p className="mt-3 text-sm leading-6 text-rose-700">{error}</p>}
    </>
  );
}
