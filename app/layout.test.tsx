import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import RootLayout, { metadata } from "@/app/layout";

describe("root layout", () => {
  it("defines project metadata", () => {
    expect(metadata.title).toBe("Get Whole Project");
    expect(metadata.description).toContain("Eating disorder recovery support platform");
  });

  it("renders children in the html document", () => {
    const html = renderToStaticMarkup(
      <RootLayout>
        <section>Page content</section>
      </RootLayout>
    );

    expect(html).toContain("<html");
    expect(html).toContain("<main>");
    expect(html).toContain("Page content");
    expect(html).toContain("Get Whole Project");
    expect(html).toContain("Privacy");
  });

  it("reserves the scrollbar gutter so the shared nav stays aligned between routes", () => {
    const css = readFileSync(join(process.cwd(), "app", "globals.css"), "utf8");

    expect(css).toContain("scrollbar-gutter: stable;");
  });
});
