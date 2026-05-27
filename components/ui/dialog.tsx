"use client";

import * as React from "react";

type DialogProps = {
  children: React.ReactNode;
  open: boolean;
};

export function Dialog({ children, open }: DialogProps) {
  if (!open) return null;

  return <div className="fixed inset-0 z-[60] overflow-y-auto bg-white">{children}</div>;
}

export function DialogContent({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={["mx-auto max-w-7xl px-5 py-6 md:py-10", className].filter(Boolean).join(" ")} {...props} />;
}

export function DialogHeader({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={["mb-8 flex items-center justify-between gap-4", className].filter(Boolean).join(" ")} {...props} />;
}
