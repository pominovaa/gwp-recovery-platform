import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CustomizeIcon } from "@/components/ui/customize-icon";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Drawer, DrawerHeader } from "@/components/ui/drawer";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/feedback-state";
import { FormField, textInputClasses } from "@/components/ui/form-field";
import { PageHeader, SectionHeader } from "@/components/ui/headers";
import { TooltipIconButton } from "@/components/ui/tooltip-icon-button";

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
      <Dialog open onClose={() => undefined}>
        <DialogContent>
          <DialogHeader>Title</DialogHeader>
        </DialogContent>
      </Dialog>
    );

    expect(html).toContain("Title");
    expect(html).toContain("fixed inset-0");
    expect(html).toContain("Close dialog");
  });

  it("renders shared page and section headers", () => {
    const html = renderToStaticMarkup(
      <>
        <PageHeader eyebrow="Account" title="Welcome back">
          Private tools
        </PageHeader>
        <SectionHeader eyebrow="Heal" title="Support for today">
          Gentle prompts
        </SectionHeader>
      </>
    );

    expect(html).toContain("Welcome back");
    expect(html).toContain("Support for today");
  });

  it("renders form fields with centralized input classes", () => {
    const html = renderToStaticMarkup(
      <FormField id="email" label="Email" helpText="Use your recovery account email.">
        <input className={textInputClasses()} id="email" />
      </FormField>
    );

    expect(html).toContain("Email");
    expect(html).toContain("recovery account email");
    expect(html).toContain("rounded-2xl");
  });

  it("renders tooltip icon buttons with labels", () => {
    const html = renderToStaticMarkup(
      <TooltipIconButton href="/find-support" icon={<CustomizeIcon />} label="Customize prompts" tooltip="Upgrade to customize prompts." />
    );

    expect(html).toContain("Customize prompts");
    expect(html).toContain("Upgrade to customize prompts.");
  });

  it("renders drawer and feedback states", () => {
    const html = renderToStaticMarkup(
      <>
        <Drawer open labelledBy="drawer-title" onClose={() => undefined}>
          <DrawerHeader id="drawer-title">Settings</DrawerHeader>
        </Drawer>
        <EmptyState title="No saved tools">Save a tool to see it here.</EmptyState>
        <LoadingState title="Loading tools..." />
        <ErrorState title="Could not load tools">Try again.</ErrorState>
      </>
    );

    expect(html).toContain("Settings");
    expect(html).toContain("No saved tools");
    expect(html).toContain("Loading tools");
    expect(html).toContain("Could not load tools");
  });
});
