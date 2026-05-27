"use client";

import { AccountPanel } from "@/components/auth/account-panel";
import { AuthForm } from "@/components/auth/auth-form";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";

type AuthDialogProps = {
  authEmail: string;
  authError: string;
  authLoading: boolean;
  authMessage: string;
  authMode: string;
  authPassword: string;
  onAuthModeChange: (mode: string) => void;
  onClose: () => void;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onSignOut: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  open: boolean;
  profileInitials: string;
  session: any;
};

export function AuthDialog({
  authEmail,
  authError,
  authLoading,
  authMessage,
  authMode,
  authPassword,
  onAuthModeChange,
  onClose,
  onEmailChange,
  onPasswordChange,
  onSignOut,
  onSubmit,
  open,
  profileInitials,
  session,
}: AuthDialogProps) {
  return (
    <Dialog open={open}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-stone-950 text-sm font-semibold text-white">
              {profileInitials}
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.25em] text-stone-500">Private Profile</div>
              <h1 className="text-2xl font-semibold tracking-tight text-stone-950">
                {session ? "Account Management" : authMode === "signup" ? "Create Account" : "Sign In"}
              </h1>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-stone-300 bg-white px-5 py-2 text-sm font-medium text-stone-700 shadow-sm transition hover:bg-stone-50"
          >
            Back to site
          </button>
        </DialogHeader>

        {session ? (
          <AccountPanel authError={authError} authLoading={authLoading} email={session.user.email} onSignOut={onSignOut} />
        ) : (
          <AuthForm
            authEmail={authEmail}
            authError={authError}
            authLoading={authLoading}
            authMessage={authMessage}
            authMode={authMode}
            authPassword={authPassword}
            onAuthModeChange={onAuthModeChange}
            onEmailChange={onEmailChange}
            onPasswordChange={onPasswordChange}
            onSubmit={onSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
