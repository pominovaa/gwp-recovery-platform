import * as React from "react";
import { cn, designSystem } from "@/lib/design-system";

type TooltipIconButtonProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  icon: React.ReactNode;
  label: string;
  tooltip: string;
};

export function TooltipIconButton({ className = "", icon, label, tooltip, ...props }: TooltipIconButtonProps) {
  const tooltipIconButton = designSystem.components.tooltipIconButton;

  return (
    <span className={tooltipIconButton.wrapper}>
      <a
        aria-label={label}
        className={cn(tooltipIconButton.button, className)}
        {...props}
      >
        {icon}
      </a>
      <span className={tooltipIconButton.tooltip}>{tooltip}</span>
    </span>
  );
}
