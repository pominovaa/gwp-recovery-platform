import * as React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline";
};

export function Button({ className = "", variant = "default", ...props }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition disabled:pointer-events-none disabled:opacity-50";
  const styles =
    variant === "outline"
      ? "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
      : "bg-primary text-primary-foreground hover:bg-primary/90";

  return <button className={[base, styles, className].filter(Boolean).join(" ")} {...props} />;
}
