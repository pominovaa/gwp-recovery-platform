import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { FindHelpPage, GivePage, HealPage, LivePage, StoriesPage } from "@/components/pages/info-page";

function expectNoGlobalShell(html: string) {
  expect(html).not.toContain("<header");
  expect(html).not.toContain("<main");
  expect(html).not.toContain("<footer");
}

describe("content pages", () => {
  it("renders find help page", () => {
    const html = renderToStaticMarkup(<FindHelpPage />);

    expect(html).toContain("Urgent help comes first.");
    expectNoGlobalShell(html);
  });

  it("renders Liv Label Free with review metadata and boundaries", () => {
    const html = renderToStaticMarkup(<FindHelpPage />);

    expect(html).toContain("Liv Label Free");
    expect(html).toContain('href="https://www.livlabelfree.com/"');
    expect(html).toContain("Neurodiversity-affirming ED recovery");
    expect(html).toContain("Autistic and neurodivergent people");
    expect(html).toContain("Free educational materials and paid coaching or books");
    expect(html).toContain("not endorsements or clinical recommendations");
    expect(html).toContain("does not provide medical care, crisis support, diagnosis, treatment, or guarantees");
  });

  it("renders heal page", () => {
    const html = renderToStaticMarkup(<HealPage />);

    expect(html).toContain("Support for the hard days.");
    expect(html).toContain('<h1 class="text-3xl font-semibold tracking-tight text-stone-950 md:text-5xl">Support for the hard days.</h1>');
    expect(html).toContain("mx-auto mb-10 max-w-3xl text-center");
    expect(html).toContain("bg-white/80");
    expect(html).toContain("flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100");
    expectNoGlobalShell(html);
  });

  it("renders live page", () => {
    const html = renderToStaticMarkup(<LivePage />);

    expect(html).toContain("Recovery is not only about symptoms.");
    expectNoGlobalShell(html);
  });

  it("renders give page", () => {
    const html = renderToStaticMarkup(<GivePage />);

    expect(html).toContain("Stories that give hope forward.");
    expect(html).toContain("border-stone-200");
    expectNoGlobalShell(html);
  });

  it("renders stories page with videos and text stories", () => {
    const html = renderToStaticMarkup(<StoriesPage />);

    expect(html).toContain("Whole Stories");
    expect(html).toContain("Recovery-support short #1");
    expect(html).toContain("The first meal I did not do alone");
    expectNoGlobalShell(html);
  });
});
