import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { FindHelpPage, GivePage, HealPage, LivePage, StoriesPage } from "@/components/pages/info-page";

describe("content pages", () => {
  it("renders find help page", () => {
    expect(renderToStaticMarkup(<FindHelpPage />)).toContain("Urgent help comes first.");
  });

  it("renders heal page", () => {
    const html = renderToStaticMarkup(<HealPage />);

    expect(html).toContain("Support for the hard days.");
    expect(html).toContain('<h1 class="text-3xl font-semibold tracking-tight text-stone-950 md:text-5xl">Support for the hard days.</h1>');
    expect(html).toContain("mx-auto mb-10 max-w-3xl text-center");
    expect(html).toContain("bg-white/80");
    expect(html).toContain("flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100");
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
