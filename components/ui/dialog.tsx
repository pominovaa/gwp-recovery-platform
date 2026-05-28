"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn, designSystem } from "@/lib/design-system";
import { Button } from "@/components/ui/button";

type DialogProps = {
  children: React.ReactNode;
  labelledBy?: string;
  onClose?: () => void;
  open: boolean;
};

export function Dialog({ children, labelledBy, onClose, open }: DialogProps) {
  if (!open) return null;
  const dialog = designSystem.components.dialog;

  return (
    <div
      aria-labelledby={labelledBy}
      aria-modal="true"
      className={dialog.overlay}
      role="dialog"
    >
      {onClose && (
        <Button
          aria-label="Close dialog"
          className={dialog.closeButton}
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
  return <div className={cn(designSystem.components.dialog.content, className)} {...props} />;
}

export function DialogHeader({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(designSystem.components.dialog.header, className)} {...props} />;
}
