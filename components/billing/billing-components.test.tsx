import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { BillingPortalButton } from "@/components/billing/billing-portal-button";
import { CheckoutButton } from "@/components/billing/checkout-button";

describe("billing components", () => {
  it("renders checkout button label", () => {
    const html = renderToStaticMarkup(<CheckoutButton planId="light">Start light plan</CheckoutButton>);

    expect(html).toContain("Start light plan");
  });

  it("renders checkout buttons with wrapping-safe layout classes", () => {
    const html = renderToStaticMarkup(
      <CheckoutButton planId="family" className="bg-emerald-700">
        Start family plan preview
      </CheckoutButton>
    );

    expect(html).toContain("min-h-11");
    expect(html).toContain("h-auto");
    expect(html).toContain("w-full");
    expect(html).toContain("whitespace-normal");
    expect(html).toContain("bg-emerald-700");
  });

  it("renders free-plan checkout button label", () => {
    const html = renderToStaticMarkup(<CheckoutButton>Get help now</CheckoutButton>);

    expect(html).toContain("Get help now");
  });

  it("renders billing portal button", () => {
    const html = renderToStaticMarkup(<BillingPortalButton />);

    expect(html).toContain("Manage billing");
  });
});
