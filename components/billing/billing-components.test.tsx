import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { DonationForm } from "@/components/billing/donation-form";
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
        Start family preview
      </CheckoutButton>
    );
    const className =
      Array.from(html.matchAll(/class="([^"]+)"/g))
        .map((match) => match[1])
        .find((classes) => classes.includes("bg-emerald-700")) ?? "";

    expect(html).toContain("min-h-11");
    expect(html).toContain("h-auto");
    expect(html).toContain("w-full");
    expect(className.split(" ")).toContain("!whitespace-normal");
    expect(className.split(" ")).not.toContain("whitespace-normal");
    expect(html).toContain("bg-emerald-700");
  });

  it("renders free-plan checkout button label", () => {
    const html = renderToStaticMarkup(<CheckoutButton>Get help now</CheckoutButton>);

    expect(html).toContain("Get help now");
  });

  it("renders custom donation form", () => {
    const html = renderToStaticMarkup(<DonationForm />);

    expect(html).toContain("Donations help pay for cloud resources");
    expect(html).toContain("bg-rose-700");
    expect(html).toContain("Donate");
    expect(html).not.toContain("thank you");
    expect(html).not.toContain('type="number"');
  });

  it("renders billing portal button", () => {
    const html = renderToStaticMarkup(<BillingPortalButton />);

    expect(html).toContain("Manage billing");
  });
});
