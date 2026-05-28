"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ErrorState, LoadingState } from "@/components/ui/feedback-state";
import { FormField, textInputClasses } from "@/components/ui/form-field";

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
    <Card className="mx-auto max-w-xl">
      <CardContent className="p-6 md:p-8">
        <form onSubmit={onSubmit} className="space-y-5">
          <FormField id="auth-email" label="Email">
            <input
              id="auth-email"
              type="email"
              required
              value={authEmail}
              onChange={(event) => onEmailChange(event.target.value)}
              className={textInputClasses()}
            />
          </FormField>

          <FormField id="auth-password" label="Password">
            <input
              id="auth-password"
              type="password"
              required
              minLength={6}
              value={authPassword}
              onChange={(event) => onPasswordChange(event.target.value)}
              className={textInputClasses()}
            />
          </FormField>

          {authLoading && <LoadingState title="Checking your account..." />}
          {authError && <ErrorState title="Sign-in problem">{authError}</ErrorState>}
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
      </CardContent>
    </Card>
  );
}
