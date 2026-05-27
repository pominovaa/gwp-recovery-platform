// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CheckoutButton } from "@/components/billing/checkout-button";
import { BillingPortalButton } from "@/components/billing/billing-portal-button";
import { supabaseBrowser } from "@/lib/supabase/browser";

describe("billing interactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("shows an inline checkout error when the user is signed out", async () => {
    vi.mocked(supabaseBrowser.auth.getSession).mockResolvedValueOnce({ data: { session: null }, error: null });

    render(<CheckoutButton planId="light">Start light plan</CheckoutButton>);
    await userEvent.click(screen.getByRole("button", { name: "Start light plan" }));

    expect(await screen.findByText("Please sign up or log in before starting a paid plan.")).toBeTruthy();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("shows an inline checkout error when the API fails", async () => {
    vi.mocked(supabaseBrowser.auth.getSession).mockResolvedValueOnce({
      data: { session: { access_token: "token" } },
      error: null,
    });
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Stripe is unavailable" }), { status: 500 })
    );

    render(<CheckoutButton planId="plus">Start plus preview</CheckoutButton>);
    await userEvent.click(screen.getByRole("button", { name: "Start plus preview" }));

    expect(await screen.findByText("Stripe is unavailable")).toBeTruthy();
  });

  it("shows a generic checkout error when fetch throws", async () => {
    vi.mocked(supabaseBrowser.auth.getSession).mockResolvedValueOnce({
      data: { session: { access_token: "token" } },
      error: null,
    });
    vi.mocked(fetch).mockRejectedValueOnce(new Error("network down"));

    render(<CheckoutButton planId="family">Start family plan preview</CheckoutButton>);
    await userEvent.click(screen.getByRole("button", { name: "Start family plan preview" }));

    expect(await screen.findByText("Checkout is temporarily unavailable. Please try again in a moment.")).toBeTruthy();
  });

  it("does not call checkout APIs for the free help button", async () => {
    render(<CheckoutButton>Get help now</CheckoutButton>);
    await userEvent.click(screen.getByRole("button", { name: "Get help now" }));

    expect(supabaseBrowser.auth.getSession).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("shows an inline portal error when the user is signed out", async () => {
    vi.mocked(supabaseBrowser.auth.getSession).mockResolvedValueOnce({ data: { session: null }, error: null });

    render(<BillingPortalButton />);
    await userEvent.click(screen.getByRole("button", { name: "Manage billing" }));

    expect(await screen.findByText("Please sign up or log in before managing billing.")).toBeTruthy();
  });

  it("shows an inline portal error when the API fails", async () => {
    vi.mocked(supabaseBrowser.auth.getSession).mockResolvedValueOnce({
      data: { session: { access_token: "token" } },
      error: null,
    });
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "No billing account found yet." }), { status: 404 })
    );

    render(<BillingPortalButton />);
    await userEvent.click(screen.getByRole("button", { name: "Manage billing" }));

    expect(await screen.findByText("No billing account found yet.")).toBeTruthy();
  });
});
