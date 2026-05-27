import { describe, expect, it } from "vitest";
import { tiers } from "@/components/find-support/tiers";

describe("pricing tiers", () => {
  it("keeps the expected public plan order", () => {
    expect(tiers.map((tier) => tier.name)).toEqual(["Free", "Light", "Plus (preview)", "Family (preview)"]);
  });

  it("keeps paid tiers wired to billing plan IDs", () => {
    expect(tiers.find((tier) => tier.name === "Free")?.planId).toBeUndefined();
    expect(tiers.find((tier) => tier.name === "Light")?.planId).toBe("light");
    expect(tiers.find((tier) => tier.name === "Plus (preview)")?.planId).toBe("plus");
    expect(tiers.find((tier) => tier.name === "Family (preview)")?.planId).toBe("family");
  });

  it("keeps support-platform-development as the first paid tier feature", () => {
    const paidTiers = tiers.filter((tier) => tier.planId);

    expect(paidTiers).toHaveLength(3);
    paidTiers.forEach((tier) => {
      expect(tier.features[0]).toBe("Supports platform development");
    });
  });

  it("keeps expected displayed prices", () => {
    expect(tiers.map((tier) => [tier.name, tier.price])).toEqual([
      ["Free", "$0"],
      ["Light", "$1/month"],
      ["Plus (preview)", "$5/month"],
      ["Family (preview)", "$19/month"],
    ]);
  });
});
