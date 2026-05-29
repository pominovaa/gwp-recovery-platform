import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNav } from "@/components/layout/site-nav";

describe("layout components", () => {
  it("renders footer links", () => {
    const html = renderToStaticMarkup(<SiteFooter />);

    expect(html).toContain("Get Whole Project");
    expect(html).toContain("Privacy");
    expect(html).toContain("Terms");
  });

  it("renders page navigation links", () => {
    const html = renderToStaticMarkup(<SiteNav />);

    expect(html).toContain("Heal");
    expect(html).toContain("Stories");
    expect(html).toContain("Donate");
    expect(html).toContain("Find help");
  });
});
