import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import BillingSuccessPage from "@/app/billing/success/page";
import FindHelpRoute from "@/app/find-help/page";
import FindSupportRoute from "@/app/find-support/page";
import GiveRoute from "@/app/give/page";
import HealRoute from "@/app/heal/page";
import HomeRoute from "@/app/page";
import LiveRoute from "@/app/live/page";
import StoriesRoute from "@/app/stories/page";

describe("app routes", () => {
  it("renders home route", () => {
    expect(renderToStaticMarkup(<HomeRoute />)).toContain("Get Whole Project");
  });

  it("renders find support route", () => {
    expect(renderToStaticMarkup(<FindSupportRoute />)).toContain("Recovery is hard.");
  });

  it("renders find help route", () => {
    const html = renderToStaticMarkup(<FindHelpRoute />);

    expect(html).toContain("Urgent help comes first.");
    expect(html).toContain("This resource hub is a starting point for finding support.");
    expect(html).toContain("not a substitute for emergency services");
  });

  it("renders heal route", () => {
    expect(renderToStaticMarkup(<HealRoute />)).toContain("Meal Support Reflection");
  });

  it("renders live route", () => {
    expect(renderToStaticMarkup(<LiveRoute />)).toContain("School &amp; routine");
  });

  it("renders give route", () => {
    expect(renderToStaticMarkup(<GiveRoute />)).toContain("Story Safety Standard");
  });

  it("renders stories route", () => {
    expect(renderToStaticMarkup(<StoriesRoute />)).toContain("Recovery-support short #1");
  });

  it("renders billing success route", () => {
    expect(renderToStaticMarkup(<BillingSuccessPage />)).toContain("Your donation is being activated.");
  });
});
