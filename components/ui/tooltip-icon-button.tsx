import * as React from "react";
import { cn } from "@/lib/design-system/classnames";

type TooltipIconButtonProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  icon: React.ReactNode;
  label: string;
  tooltip: string;
};

export function TooltipIconButton({ className = "", icon, label, tooltip, ...props }: TooltipIconButtonProps) {
  return (
    <span className="group relative inline-flex">
      <a
        aria-label={label}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 shadow-sm transition hover:bg-stone-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-calm",
          className
        )}
        {...props}
      >
        {icon}
      </a>
      <span className="pointer-events-none absolute right-0 top-full z-10 mt-2 w-48 rounded-2xl bg-stone-950 px-3 py-2 text-xs leading-5 text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-within:opacity-100">
        {tooltip}
      </span>
    </span>
  );
}
