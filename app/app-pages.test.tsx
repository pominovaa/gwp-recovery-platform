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

function expectNoGlobalShell(html: string) {
  expect(html).not.toContain("<header");
  expect(html).not.toContain("<main");
  expect(html).not.toContain("<footer");
}

describe("app routes", () => {
  it("renders home route", () => {
    const html = renderToStaticMarkup(<HomeRoute />);

    expect(html).toContain("Get Whole Project");
    expectNoGlobalShell(html);
  });

  it("renders find support route", () => {
    const html = renderToStaticMarkup(<FindSupportRoute />);

    expect(html).toContain("Recovery is hard.");
    expectNoGlobalShell(html);
  });

  it("renders find help route", () => {
    const html = renderToStaticMarkup(<FindHelpRoute />);

    expect(html).toContain("Urgent help comes first.");
    expectNoGlobalShell(html);
  });

  it("renders heal route", () => {
    const html = renderToStaticMarkup(<HealRoute />);

    expect(html).toContain("Meal Support Reflection");
    expectNoGlobalShell(html);
  });

  it("renders live route", () => {
    const html = renderToStaticMarkup(<LiveRoute />);

    expect(html).toContain("School &amp; routine");
    expectNoGlobalShell(html);
  });

  it("renders give route", () => {
    const html = renderToStaticMarkup(<GiveRoute />);

    expect(html).toContain("Story Safety Standard");
    expectNoGlobalShell(html);
  });

  it("renders stories route", () => {
    const html = renderToStaticMarkup(<StoriesRoute />);

    expect(html).toContain("Recovery-support short #1");
    expectNoGlobalShell(html);
  });

  it("renders billing success route", () => {
    const html = renderToStaticMarkup(<BillingSuccessPage />);

    expect(html).toContain("Your donation is being activated.");
    expectNoGlobalShell(html);
  });
});
