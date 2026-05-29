"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { readJsonResponse } from "@/lib/billing/errors";

export function DonationForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function startDonation() {
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/billing/donation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await readJsonResponse(response);

      if (!response.ok || !data?.url) {
        setError(data?.error || "Unable to start donation checkout. Please try again.");
        setLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Donation checkout is temporarily unavailable. Please try again in a moment.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto mt-6 max-w-4xl text-center">
      <p className="text-sm leading-6 text-stone-600">
        Donations help pay for cloud resources, hosting, storage, and monitoring so GWP can stay live and available.
      </p>
      <div className="mt-4">
        <Button
          type="button"
          onClick={startDonation}
          disabled={loading}
          className="h-11 rounded-full bg-rose-700 px-6 text-white shadow-sm hover:bg-rose-800"
        >
          {loading ? "Opening..." : "Donate \uD83E\uDEF6"}
        </Button>
      </div>
      {error && <p className="mt-3 text-sm leading-6 text-rose-700">{error}</p>}
    </div>
  );
}
