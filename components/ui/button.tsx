import * as React from "react";
import { cn, designSystem, type ButtonSize, type ButtonVariant } from "@/lib/design-system";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: ButtonSize;
  variant?: ButtonVariant;
};

export function Button({ className = "", size = "md", variant = "default", ...props }: ButtonProps) {
  const button = designSystem.components.button;

  return <button className={cn(button.base, button.sizes[size], button.variants[variant], className)} {...props} />;
}
