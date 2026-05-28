import * as React from "react";
import { cn } from "@/lib/design-system/classnames";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "ghost" | "danger";
};

export function Button({ className = "", size = "md", variant = "default", ...props }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center whitespace-nowrap rounded-full font-semibold transition disabled:pointer-events-none disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-calm";
  const sizes = {
    sm: "h-9 px-4 text-sm",
    md: "h-11 px-5 text-sm",
    lg: "h-12 px-7 text-base"
  };
  const variants = {
    default: "bg-stone-950 text-white hover:bg-stone-800",
    outline: "border border-stone-300 bg-white text-stone-950 hover:bg-stone-50",
    ghost: "bg-transparent text-stone-950 hover:bg-stone-100",
    danger: "bg-rose-700 text-white hover:bg-rose-800"
  };

  return <button className={cn(base, sizes[size], variants[variant], className)} {...props} />;
}
