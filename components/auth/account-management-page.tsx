"use client";

import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { AccountPanel } from "@/components/auth/account-panel";
import { AuthForm } from "@/components/auth/auth-form";
import { supabaseBrowser } from "@/lib/supabase/browser";

export function AccountManagementPage() {
  const [authMode, setAuthMode] = useState("signin");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [authError, setAuthError] = useState("");
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const { data, error } = await supabaseBrowser.auth.getSession();
      if (!mounted) return;
      setSession(error ? null : data.session);
    }

    loadSession();

    const {
      data: { subscription },
    } = supabaseBrowser.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleAuthSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    setAuthMessage("");

    const credentials = { email: authEmail, password: authPassword };
    const { data, error } =
      authMode === "signup"
        ? await supabaseBrowser.auth.signUp(credentials)
        : await supabaseBrowser.auth.signInWithPassword(credentials);

    if (error) {
      setAuthError(error.message);
    } else if (authMode === "signup" && !data.session) {
      setAuthMessage("Check your email to confirm your account, then come back to sign in.");
    } else {
      setAuthMessage(authMode === "signup" ? "Account created." : "Signed in.");
      setAuthPassword("");
      setSession(data.session);
    }

    setAuthLoading(false);
  }

  async function handleSignOut() {
    setAuthLoading(true);
    setAuthError("");
    setAuthMessage("");
    const { error } = await supabaseBrowser.auth.signOut();
    if (error) {
      setAuthError(error.message);
    } else {
      setSession(null);
    }
    setAuthLoading(false);
  }

  return (
    <section className="px-4 py-12 sm:px-5 md:py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500 sm:tracking-[0.25em]">
            Private Profile
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl md:text-5xl">
            Account Management
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-stone-600 sm:text-lg sm:leading-8">
            Manage sign-in, donations, privacy preferences, journal access, and saved recovery tools from one place.
          </p>
        </div>

        {session ? (
          <AccountPanel authError={authError} authLoading={authLoading} email={session.user.email} onSignOut={handleSignOut} />
        ) : (
          <div className="max-w-xl">
            <AuthForm
              authEmail={authEmail}
              authError={authError}
              authLoading={authLoading}
              authMessage={authMessage}
              authMode={authMode}
              authPassword={authPassword}
              onAuthModeChange={(mode) => {
                setAuthMode(mode);
                setAuthError("");
                setAuthMessage("");
              }}
              onEmailChange={setAuthEmail}
              onPasswordChange={setAuthPassword}
              onSubmit={handleAuthSubmit}
            />
          </div>
        )}
      </div>
    </section>
  );
}
