import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { FindHelpPage, GivePage, HealPage, LivePage, StoriesPage } from "@/components/pages/info-page";

describe("content pages", () => {
  it("renders find help page", () => {
    expect(renderToStaticMarkup(<FindHelpPage />)).toContain("Urgent help comes first.");
  });

  it("renders heal page", () => {
    expect(renderToStaticMarkup(<HealPage />)).toContain("Support for the hard days.");
  });

  it("renders live page", () => {
    expect(renderToStaticMarkup(<LivePage />)).toContain("Recovery is not only about symptoms.");
  });

  it("renders give page", () => {
    expect(renderToStaticMarkup(<GivePage />)).toContain("Stories that give hope forward.");
  });

  it("renders stories page with videos and text stories", () => {
    const html = renderToStaticMarkup(<StoriesPage />);

    expect(html).toContain("Whole Stories");
    expect(html).toContain("Recovery-support short #1");
    expect(html).toContain("The first meal I did not do alone");
  });
});
