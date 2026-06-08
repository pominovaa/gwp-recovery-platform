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

  it("closes mobile navigation from the brand link", async () => {
    render(<SiteNav />);
    await userEvent.click(screen.getByRole("button", { name: "Toggle navigation" }));

    await waitFor(() => {
      expect(screen.getAllByText("Find help").length).toBeGreaterThan(1);
    });

    await userEvent.click(screen.getByRole("link", { name: /Get Whole Project/i }));

    await waitFor(() => {
      expect(screen.getAllByText("Find help")).toHaveLength(1);
    });
  });

  it("opens the account dialog", async () => {
    render(<SiteNav />);
    await userEvent.click(screen.getByRole("button", { name: "Sign up / Log in" }));

    expect(await screen.findByText("Private Profile")).toBeTruthy();
  });

  it("clears a stale invalid refresh token during auth bootstrap", async () => {
    vi.mocked(supabaseBrowser.auth.getSession).mockResolvedValueOnce({
      data: { session: null },
      error: { message: "Invalid Refresh Token: Refresh Token Not Found" },
    });

    render(<SiteNav />);

    await waitFor(() => {
      expect(supabaseBrowser.auth.signOut).toHaveBeenCalledWith({ scope: "local" });
    });
    expect(await screen.findByRole("button", { name: "Sign up / Log in" })).toBeTruthy();
  });

  it("shows a sign-in error from Supabase", async () => {
    vi.mocked(supabaseBrowser.auth.signInWithPassword).mockResolvedValueOnce({
      data: { session: null },
      error: { message: "Invalid login credentials" },
    });

    render(<SiteNav />);
    await userEvent.click(screen.getByRole("button", { name: "Sign up / Log in" }));
    await userEvent.type(screen.getByLabelText("Email"), "alex@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "secret1");
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Invalid login credentials")).toBeTruthy();
  });

  it("shows signup email confirmation message", async () => {
    vi.mocked(supabaseBrowser.auth.signUp).mockResolvedValueOnce({
      data: { session: null },
      error: null,
    });

    render(<SiteNav />);
    await userEvent.click(screen.getByRole("button", { name: "Sign up / Log in" }));
    await userEvent.click(screen.getByRole("button", { name: "Create one" }));
    await userEvent.type(screen.getByLabelText("Email"), "alex@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "secret1");
    await userEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByText("Check your email to confirm your account, then come back to sign in.")).toBeTruthy();
  });

  it("signs out an authenticated user", async () => {
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
    await userEvent.click(await screen.findByRole("button", { name: "AL" }));
    await userEvent.click(await screen.findByRole("button", { name: "Sign out" }));

    expect(supabaseBrowser.auth.signOut).toHaveBeenCalled();
  });
});
