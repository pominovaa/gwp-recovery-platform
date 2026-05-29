import { describe, expect, it } from "vitest";
import { tiers } from "@/components/find-support/tiers";

describe("pricing tiers", () => {
  it("keeps the expected public plan order", () => {
    expect(tiers.map((tier) => tier.name)).toEqual(["Free", "Light", "Plus", "Family"]);
  });

  it("keeps paid tiers wired to billing plan IDs", () => {
    expect(tiers.find((tier) => tier.name === "Free")?.planId).toBeUndefined();
    expect(tiers.find((tier) => tier.name === "Light")?.planId).toBe("light");
    expect(tiers.find((tier) => tier.name === "Plus")?.planId).toBe("plus");
    expect(tiers.find((tier) => tier.name === "Family")?.planId).toBe("family");
  });

  it("keeps platform funding as the first paid tier feature", () => {
    const paidTiers = tiers.filter((tier) => tier.planId);

    expect(paidTiers).toHaveLength(3);
    paidTiers.forEach((tier) => {
      expect(tier.features[0]).toBe("Funds platform development");
    });
  });

  it("keeps expected displayed prices", () => {
    expect(tiers.map((tier) => [tier.name, tier.price])).toEqual([
      ["Free", "$0"],
      ["Light", "$1/month"],
      ["Plus", "$5/month"],
      ["Family", "$19/month"],
    ]);
  });
});
