import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { FindHelpPage, GivePage, HealPage, LivePage, StoriesPage } from "@/components/pages/info-page";

describe("content pages", () => {
  it("renders find help page", () => {
    const html = renderToStaticMarkup(<FindHelpPage />);

    expect(html).toContain("Urgent help comes first.");
    expect(html).toContain("This resource hub is a starting point for finding support.");
    expect(html).toContain("does not provide medical, psychiatric, nutrition, or treatment advice.");
  });

  it("renders heal page", () => {
    const html = renderToStaticMarkup(<HealPage />);

    expect(html).toContain("Support for the hard days.");
    expect(html).toContain("border border-stone-200");
  });

  it("renders live page", () => {
    expect(renderToStaticMarkup(<LivePage />)).toContain("Recovery is not only about symptoms.");
  });

  it("renders give page", () => {
    const html = renderToStaticMarkup(<GivePage />);

    expect(html).toContain("Stories that give hope forward.");
    expect(html).toContain("border border-stone-200");
  });

  it("renders stories page with videos and text stories", () => {
    const html = renderToStaticMarkup(<StoriesPage />);

    expect(html).toContain("Whole Stories");
    expect(html).toContain("Recovery-support short #1");
    expect(html).toContain("The first meal I did not do alone");
  });
});
