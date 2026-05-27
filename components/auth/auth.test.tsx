import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { AccountPanel } from "@/components/auth/account-panel";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { AuthForm } from "@/components/auth/auth-form";

const noop = vi.fn();

describe("auth components", () => {
  it("renders signin form copy", () => {
    const html = renderToStaticMarkup(
      <AuthForm
        authEmail=""
        authError=""
        authLoading={false}
        authMessage=""
        authMode="signin"
        authPassword=""
        onAuthModeChange={noop}
        onEmailChange={noop}
        onPasswordChange={noop}
        onSubmit={noop}
      />
    );

    expect(html).toContain("Sign in");
    expect(html).toContain("Need an account?");
  });

  it("renders signup form copy and messages", () => {
    const html = renderToStaticMarkup(
      <AuthForm
        authEmail="alex@example.com"
        authError="Password is too short"
        authLoading={false}
        authMessage="Check your email"
        authMode="signup"
        authPassword=""
        onAuthModeChange={noop}
        onEmailChange={noop}
        onPasswordChange={noop}
        onSubmit={noop}
      />
    );

    expect(html).toContain("Create account");
    expect(html).toContain("Password is too short");
    expect(html).toContain("Check your email");
  });

  it("renders account panel with billing management", () => {
    const html = renderToStaticMarkup(
      <AccountPanel authError="" authLoading={false} email="alex@example.com" onSignOut={noop} />
    );

    expect(html).toContain("alex@example.com");
    expect(html).toContain("Manage billing");
    expect(html).toContain("Sign out");
  });

  it("renders auth dialog form when signed out", () => {
    const html = renderToStaticMarkup(
      <AuthDialog
        authEmail=""
        authError=""
        authLoading={false}
        authMessage=""
        authMode="signin"
        authPassword=""
        onAuthModeChange={noop}
        onClose={noop}
        onEmailChange={noop}
        onPasswordChange={noop}
        onSignOut={noop}
        onSubmit={noop}
        open
        profileInitials="OA"
        session={null}
      />
    );

    expect(html).toContain("Private Profile");
    expect(html).toContain("Sign In");
  });

  it("renders account management when signed in", () => {
    const html = renderToStaticMarkup(
      <AuthDialog
        authEmail=""
        authError=""
        authLoading={false}
        authMessage=""
        authMode="signin"
        authPassword=""
        onAuthModeChange={noop}
        onClose={noop}
        onEmailChange={noop}
        onPasswordChange={noop}
        onSignOut={noop}
        onSubmit={noop}
        open
        profileInitials="AL"
        session={{ user: { email: "alex@example.com" } }}
      />
    );

    expect(html).toContain("Account Management");
    expect(html).toContain("alex@example.com");
  });
});
