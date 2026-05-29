import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { FindSupportContent } from "@/components/find-support/find-support-content";
import { FindSupportPage } from "@/components/find-support/find-support-page";
import { PricingCard } from "@/components/find-support/pricing-card";
import { tiers } from "@/components/find-support/tiers";

describe("find support components", () => {
  it("renders all pricing tiers", () => {
    const html = renderToStaticMarkup(<FindSupportContent />);

    expect(html).toContain("Recovery is hard. Finding support should not be.");
    tiers.forEach((tier) => {
      expect(html).toContain(tier.name);
    });
    expect(html).toContain("Donations help pay for cloud resources");
  });

  it("renders a pricing card CTA", () => {
    const html = renderToStaticMarkup(<PricingCard tier={tiers[1]} />);

    expect(html).toContain("Light");
    expect(html).toContain("Start light plan");
    expect(html).toContain("Gift access");
    expect(html).toContain("Gift subscription");
  });

  it("renders the full find support page with navigation", () => {
    const html = renderToStaticMarkup(<FindSupportPage />);

    expect(html).toContain("Get Whole Project");
    expect(html).toContain("Donate");
  });
});
