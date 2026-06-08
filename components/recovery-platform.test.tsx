import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import GetWholeProjectPrototype from "@/components/recovery-platform";

describe("home prototype page", () => {
  it("renders route-specific home content without the global shell", () => {
    const html = renderToStaticMarkup(<GetWholeProjectPrototype />);

    expect(html).toContain("Get Whole Project");
    expect(html).toContain("Heal. Live. Give.");
    expect(html).toContain("Get urgent help");
    expect(html).toContain("Support for the hard days.");
    expect(html).toContain("border border-stone-200");
    expect(html).not.toContain("<header");
    expect(html).not.toContain("<main");
    expect(html).not.toContain("<footer");
  });
});
