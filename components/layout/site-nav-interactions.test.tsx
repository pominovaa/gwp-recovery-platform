// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SiteNav } from "@/components/layout/site-nav";
import { supabaseBrowser } from "@/lib/supabase/browser";

describe("site nav interactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads signed-in profile initials", async () => {
    vi.mocked(supabaseBrowser.auth.getSession).mockResolvedValueOnce({
      data: { session: { user: { id: "user_1", email: "alex@example.com" } } },
      error: null,
    });
    vi.mocked(supabaseBrowser.from).mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: { display_initials: "AL" }, error: null }),
    });

    render(<SiteNav />);

    expect(await screen.findByRole("button", { name: "AL" })).toBeTruthy();
  });

  it("opens mobile navigation", async () => {
    render(<SiteNav />);
    await userEvent.click(screen.getByRole("button", { name: "Toggle navigation" }));

    await waitFor(() => {
      expect(screen.getAllByText("Find help").length).toBeGreaterThan(1);
    });
  });

  it("opens the account dialog", async () => {
    render(<SiteNav />);
    await userEvent.click(screen.getByRole("button", { name: "Sign up / Log in" }));

    expect(await screen.findByText("Private Profile")).toBeTruthy();
  });
});
