"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn, designSystem } from "@/lib/design-system";
import { Button } from "@/components/ui/button";

type DrawerProps = {
  children: React.ReactNode;
  labelledBy?: string;
  onClose: () => void;
  open: boolean;
};

export function Drawer({ children, labelledBy, onClose, open }: DrawerProps) {
  if (!open) return null;
  const drawer = designSystem.components.drawer;

  return (
    <div aria-labelledby={labelledBy} aria-modal="true" className={drawer.root} role="dialog">
      <button aria-label="Close drawer" className={drawer.backdrop} onClick={onClose} type="button" />
      <aside className={drawer.panel}>
        <Button aria-label="Close drawer" className={drawer.closeButton} onClick={onClose} type="button" variant="outline">
          <X aria-hidden="true" className="h-5 w-5" />
        </Button>
        {children}
      </aside>
    </div>
  );
}

export function DrawerHeader({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(designSystem.components.drawer.header, className)} {...props} />;
}
