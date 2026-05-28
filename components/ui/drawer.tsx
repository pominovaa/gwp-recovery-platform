"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/design-system/classnames";
import { Button } from "@/components/ui/button";

type DrawerProps = {
  children: React.ReactNode;
  labelledBy?: string;
  onClose: () => void;
  open: boolean;
};

export function Drawer({ children, labelledBy, onClose, open }: DrawerProps) {
  if (!open) return null;

  return (
    <div aria-labelledby={labelledBy} aria-modal="true" className="fixed inset-0 z-[60]" role="dialog">
      <button aria-label="Close drawer" className="absolute inset-0 bg-stone-950/35" onClick={onClose} type="button" />
      <aside className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-raised">
        <Button aria-label="Close drawer" className="mb-6 h-10 w-10 p-0" onClick={onClose} type="button" variant="outline">
          <X aria-hidden="true" className="h-5 w-5" />
        </Button>
        {children}
      </aside>
    </div>
  );
}

export function DrawerHeader({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-6 space-y-2", className)} {...props} />;
}
