import * as React from "react";
import { cn } from "@/lib/design-system/classnames";

type HeaderProps = {
  children?: React.ReactNode;
  className?: string;
  eyebrow?: string;
  tone?: "light" | "dark";
  title: string;
};

export function PageHeader({ children, className = "", eyebrow, title, tone = "light" }: HeaderProps) {
  const isDark = tone === "dark";

  return (
    <header className={cn("mx-auto max-w-4xl px-5 py-14 text-center md:py-20", className)}>
      {eyebrow && <p className={cn("mb-3 text-sm font-semibold uppercase tracking-[0.2em]", isDark ? "text-stone-300" : "text-stone-500")}>{eyebrow}</p>}
      <h1 className={cn("text-4xl font-semibold tracking-tight md:text-6xl", isDark ? "text-white" : "text-stone-950")}>{title}</h1>
      {children && <div className={cn("mt-5 text-lg leading-8", isDark ? "text-stone-300" : "text-stone-600")}>{children}</div>}
    </header>
  );
}

export function SectionHeader({ children, className = "", eyebrow, title, tone = "light" }: HeaderProps) {
  const isDark = tone === "dark";

  return (
    <div className={cn("mx-auto mb-10 max-w-3xl text-center", className)}>
      {eyebrow && <p className={cn("mb-3 text-sm font-semibold uppercase tracking-[0.2em]", isDark ? "text-stone-300" : "text-stone-500")}>{eyebrow}</p>}
      <h2 className={cn("text-3xl font-semibold tracking-tight md:text-5xl", isDark ? "text-white" : "text-stone-950")}>{title}</h2>
      {children && <p className={cn("mt-5 text-lg leading-8", isDark ? "text-stone-300" : "text-stone-600")}>{children}</p>}
    </div>
  );
}
