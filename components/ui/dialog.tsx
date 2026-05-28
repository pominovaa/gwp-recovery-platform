"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/design-system/classnames";
import { Button } from "@/components/ui/button";

type DialogProps = {
  children: React.ReactNode;
  labelledBy?: string;
  onClose?: () => void;
  open: boolean;
};

export function Dialog({ children, labelledBy, onClose, open }: DialogProps) {
  if (!open) return null;

  return (
    <div
      aria-labelledby={labelledBy}
      aria-modal="true"
      className="fixed inset-0 z-[60] overflow-y-auto bg-white"
      role="dialog"
    >
      {onClose && (
        <Button
          aria-label="Close dialog"
          className="fixed right-4 top-4 z-[61] h-10 w-10 p-0"
          onClick={onClose}
          type="button"
          variant="outline"
        >
          <X aria-hidden="true" className="h-5 w-5" />
        </Button>
      )}
      {children}
    </div>
  );
}

export function DialogContent({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mx-auto max-w-7xl px-5 py-6 md:py-10", className)} {...props} />;
}

export function DialogHeader({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-8 flex items-center justify-between gap-4", className)} {...props} />;
}
