"use client";

import { Button } from "@/components/ui/button";

type AuthFormProps = {
  authEmail: string;
  authError: string;
  authLoading: boolean;
  authMessage: string;
  authMode: string;
  authPassword: string;
  onAuthModeChange: (mode: string) => void;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export function AuthForm({
  authEmail,
  authError,
  authLoading,
  authMessage,
  authMode,
  authPassword,
  onAuthModeChange,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: AuthFormProps) {
  return (
    <div className="mx-auto max-w-xl rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm md:p-8">
      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-semibold text-stone-800" htmlFor="auth-email">
            Email
          </label>
          <input
            id="auth-email"
            type="email"
            required
            value={authEmail}
            onChange={(event) => onEmailChange(event.target.value)}
            className="h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm outline-none transition focus:border-stone-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-stone-800" htmlFor="auth-password">
            Password
          </label>
          <input
            id="auth-password"
            type="password"
            required
            minLength={6}
            value={authPassword}
            onChange={(event) => onPasswordChange(event.target.value)}
            className="h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm outline-none transition focus:border-stone-500"
          />
        </div>

        {authError && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{authError}</div>}
        {authMessage && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{authMessage}</div>}

        <Button
          type="submit"
          disabled={authLoading}
          className="h-12 w-full rounded-full bg-stone-950 px-6 text-base text-white hover:bg-stone-800"
        >
          {authLoading ? "Please wait..." : authMode === "signup" ? "Create account" : "Sign in"}
        </Button>
      </form>

      <div className="mt-5 text-center text-sm text-stone-600">
        {authMode === "signup" ? "Already have an account?" : "Need an account?"}{" "}
        <button
          type="button"
          onClick={() => onAuthModeChange(authMode === "signup" ? "signin" : "signup")}
          className="font-semibold text-stone-950 underline underline-offset-4"
        >
          {authMode === "signup" ? "Sign in" : "Create one"}
        </button>
      </div>
    </div>
  );
}
