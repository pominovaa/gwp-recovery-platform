import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CustomizeIcon } from "@/components/ui/customize-icon";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";

describe("ui primitives", () => {
  it("renders a default button", () => {
    const html = renderToStaticMarkup(<Button>Save</Button>);

    expect(html).toContain("Save");
    expect(html).toContain("inline-flex");
  });

  it("renders an outline button", () => {
    const html = renderToStaticMarkup(<Button variant="outline">Cancel</Button>);

    expect(html).toContain("Cancel");
    expect(html).toContain("border");
  });

  it("renders card content", () => {
    const html = renderToStaticMarkup(
      <Card>
        <CardContent>Card body</CardContent>
      </Card>
    );

    expect(html).toContain("Card body");
  });

  it("renders the customize icon", () => {
    const html = renderToStaticMarkup(<CustomizeIcon />);

    expect(html).toContain("✨");
  });

  it("does not render a closed dialog", () => {
    const html = renderToStaticMarkup(<Dialog open={false}>Hidden</Dialog>);

    expect(html).toBe("");
  });

  it("renders an open dialog with content and header", () => {
    const html = renderToStaticMarkup(
      <Dialog open>
        <DialogContent>
          <DialogHeader>Title</DialogHeader>
        </DialogContent>
      </Dialog>
    );

    expect(html).toContain("Title");
    expect(html).toContain("fixed inset-0");
  });
});
