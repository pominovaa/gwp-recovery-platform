import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import GetWholeProjectPrototype from "@/components/recovery-platform";

describe("home prototype page", () => {
  it("renders primary home content and shared nav", () => {
    const html = renderToStaticMarkup(<GetWholeProjectPrototype />);

    expect(html).toContain("Get Whole Project");
    expect(html).toContain("Heal. Live. Give.");
    expect(html).toContain("Get urgent help");
    expect(html).toContain("Support for the hard days.");
  });
});
