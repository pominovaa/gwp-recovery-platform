// @vitest-environment jsdom

import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthForm } from "@/components/auth/auth-form";

describe("auth form interactions", () => {
  it("passes email and password changes upward", async () => {
    const onEmailChange = vi.fn();
    const onPasswordChange = vi.fn();

    render(
      <AuthForm
        authEmail=""
        authError=""
        authLoading={false}
        authMessage=""
        authMode="signin"
        authPassword=""
        onAuthModeChange={vi.fn()}
        onEmailChange={onEmailChange}
        onPasswordChange={onPasswordChange}
        onSubmit={vi.fn()}
      />
    );

    await userEvent.type(screen.getByLabelText("Email"), "alex@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "secret1");

    expect(onEmailChange).toHaveBeenCalled();
    expect(onPasswordChange).toHaveBeenCalled();
  });

  it("submits through the provided handler", async () => {
    const onSubmit = vi.fn((event) => event.preventDefault());

    render(
      <AuthForm
        authEmail="alex@example.com"
        authError=""
        authLoading={false}
        authMessage=""
        authMode="signin"
        authPassword="secret1"
        onAuthModeChange={vi.fn()}
        onEmailChange={vi.fn()}
        onPasswordChange={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("toggles auth mode through the provided handler", async () => {
    const onAuthModeChange = vi.fn();

    render(
      <AuthForm
        authEmail=""
        authError=""
        authLoading={false}
        authMessage=""
        authMode="signin"
        authPassword=""
        onAuthModeChange={onAuthModeChange}
        onEmailChange={vi.fn()}
        onPasswordChange={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "Create one" }));

    expect(onAuthModeChange).toHaveBeenCalledWith("signup");
  });
});
