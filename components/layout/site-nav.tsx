// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { Heart, LifeBuoy, Menu, X } from "lucide-react";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { CustomizeIcon } from "@/components/ui/customize-icon";
import { supabaseBrowser } from "@/lib/supabase/browser";

const links = [
  { label: "Heal", href: "/heal" },
  { label: "Live", href: "/live" },
  { label: "Give", href: "/give" },
  { label: "Stories", href: "/stories" },
  { label: "Subscription", href: "/find-support" },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [authMode, setAuthMode] = useState("signin");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [authError, setAuthError] = useState("");
  const [session, setSession] = useState(null);
  const [profileInitials, setProfileInitials] = useState("OA");

  useEffect(() => {
    let mounted = true;

    async function loadProfileInitials(activeSession) {
      if (!activeSession?.user) {
        setProfileInitials("OA");
        return;
      }

      const fallback =
        activeSession.user.email
          ?.split("@")[0]
          ?.slice(0, 2)
          ?.toUpperCase() || "OA";

      const { data } = await supabaseBrowser
        .from("profiles")
        .select("display_initials")
        .eq("id", activeSession.user.id)
        .maybeSingle();

      setProfileInitials(data?.display_initials || fallback);
    }

    async function loadSession() {
      const { data } = await supabaseBrowser.auth.getSession();
      if (!mounted) return;
      setSession(data.session);
      await loadProfileInitials(data.session);
    }

    loadSession();

    const {
      data: { subscription },
    } = supabaseBrowser.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      loadProfileInitials(nextSession);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleAuthSubmit(event) {
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
      if (data.session) setAccountOpen(false);
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
      setProfileInitials("OA");
    }
    setAuthLoading(false);
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-stone-900 text-white shadow-sm">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <div className="text-base font-semibold tracking-tight text-stone-950">Get Whole Project</div>
              <div className="text-xs font-medium uppercase tracking-[0.25em] text-stone-500">Heal · Live · Give</div>
            </div>
          </a>

          <nav className="hidden items-center gap-6 md:flex">
            {links.map((link) => (
              <a key={link.label} href={link.href} className="text-sm font-medium text-stone-600 transition hover:text-stone-950">
                {link.label}
              </a>
            ))}
            <a href="/find-help" className="inline-flex h-10 items-center gap-2 rounded-full bg-rose-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-800">
              Find help <LifeBuoy className="h-4 w-4" />
            </a>
            <a href="/find-support" aria-label="Upgrade to customize" className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-xs font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50">
              <CustomizeIcon />
            </a>
            <button
              type="button"
              onClick={() => setAccountOpen(true)}
              className="inline-flex h-10 items-center justify-center rounded-full border border-stone-200 bg-white px-4 text-sm font-semibold text-stone-950 shadow-sm transition hover:bg-stone-50"
            >
              {session ? profileInitials : "Sign up / Log in"}
            </button>
          </nav>

          <button className="rounded-xl p-2 md:hidden" onClick={() => setOpen((value) => !value)} aria-label="Toggle navigation">
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {open && (
          <div className="border-t border-stone-200 bg-white px-5 py-4 md:hidden">
            <div className="flex flex-col gap-4">
              {links.map((link) => (
                <a key={link.label} href={link.href} className="text-sm font-medium text-stone-700" onClick={() => setOpen(false)}>
                  {link.label}
                </a>
              ))}
              <a href="/find-help" className="inline-flex w-fit items-center gap-2 rounded-full bg-rose-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm" onClick={() => setOpen(false)}>
                Find help <LifeBuoy className="h-4 w-4" />
              </a>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setAccountOpen(true);
                }}
                className="inline-flex h-10 w-fit items-center justify-center rounded-full border border-stone-200 bg-white px-4 text-sm font-semibold text-stone-950 shadow-sm"
              >
                {session ? profileInitials : "Sign up / Log in"}
              </button>
            </div>
          </div>
        )}
      </header>

      <AuthDialog
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
        onClose={() => setAccountOpen(false)}
        onEmailChange={setAuthEmail}
        onPasswordChange={setAuthPassword}
        onSignOut={handleSignOut}
        onSubmit={handleAuthSubmit}
        open={accountOpen}
        profileInitials={profileInitials}
        session={session}
      />
    </>
  );
}
