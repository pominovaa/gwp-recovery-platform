import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { BillingPortalButton } from "@/components/billing/billing-portal-button";
import { CheckoutButton } from "@/components/billing/checkout-button";

describe("billing components", () => {
  it("renders checkout button label", () => {
    const html = renderToStaticMarkup(<CheckoutButton planId="light">Start light plan</CheckoutButton>);

    expect(html).toContain("Start light plan");
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
