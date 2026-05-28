import { describe, expect, it } from "vitest";
import { CHECKOUT_UNAVAILABLE_MESSAGE, getErrorMessage, readJsonResponse } from "@/lib/billing/errors";

describe("billing error helpers", () => {
  it("uses an Error message when available", () => {
    expect(getErrorMessage(new Error("Stripe is unavailable"))).toBe("Stripe is unavailable");
  });

  it("falls back for unknown errors", () => {
    expect(getErrorMessage("plain string")).toBe("Billing is temporarily unavailable. Please try again in a moment.");
  });

  it("supports a custom fallback", () => {
    expect(getErrorMessage(null, "Try again later.")).toBe("Try again later.");
  });

  it("uses user-safe checkout unavailable copy", () => {
    expect(CHECKOUT_UNAVAILABLE_MESSAGE).toBe(
      "This feature is currently in testing and will be available soon. Please try again later."
    );
  });

  it("reads valid JSON responses", async () => {
    const response = new Response(JSON.stringify({ error: "No billing account found yet." }), {
      headers: { "content-type": "application/json" },
    });

    await expect(readJsonResponse(response)).resolves.toEqual({ error: "No billing account found yet." });
  });

  it("returns null for invalid JSON responses", async () => {
    const response = new Response("not json");

    await expect(readJsonResponse(response)).resolves.toBeNull();
  });
});
