"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { CHECKOUT_UNAVAILABLE_MESSAGE, readJsonResponse } from "@/lib/billing/errors";
import type { BillingPlanId } from "@/lib/billing/plans";
import type { ButtonVariant } from "@/lib/design-system";

type CheckoutButtonProps = {
  children: React.ReactNode;
  className?: string;
  planId?: BillingPlanId;
  variant?: ButtonVariant;
};

export function CheckoutButton({ children, className = "", planId, variant = "default" }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function startCheckout() {
    setError("");

    if (!planId) {
      window.location.href = "/find-help";
      return;
    }

    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabaseBrowser.auth.getSession();

      if (!session?.access_token) {
        setError("Please sign up or log in before starting a paid plan.");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ planId }),
      });

      const data = await readJsonResponse(response);

      if (!response.ok || !data?.url) {
        setError(
          response.status >= 500 ? CHECKOUT_UNAVAILABLE_MESSAGE : data?.error || "Unable to start checkout. Please try again."
        );
        setLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError(CHECKOUT_UNAVAILABLE_MESSAGE);
      setLoading(false);
    }
  }

  return (
    <div className="mt-auto">
      <Button
        type="button"
        onClick={startCheckout}
        disabled={loading}
        variant={variant}
        className={["min-h-11 h-auto w-full !whitespace-normal px-4 py-3 text-center leading-5", className]
          .filter(Boolean)
          .join(" ")}
      >
        {loading ? "Opening checkout..." : children}
      </Button>
      {error && <p className="mt-3 text-sm leading-6 text-rose-700">{error}</p>}
    </div>
  );
}
