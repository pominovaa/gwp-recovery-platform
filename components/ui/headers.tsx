import * as React from "react";
import { cn, designSystem, type HeaderTone } from "@/lib/design-system";

type HeaderProps = {
  children?: React.ReactNode;
  className?: string;
  eyebrow?: string;
  tone?: HeaderTone;
  title: string;
};

export function PageHeader({ children, className = "", eyebrow, title, tone = "light" }: HeaderProps) {
  const header = designSystem.components.header;

  return (
    <header className={cn(header.page, className)}>
      {eyebrow && <p className={cn(header.eyebrow.base, header.eyebrow[tone])}>{eyebrow}</p>}
      <h1 className={cn(header.pageTitle.base, header.pageTitle[tone])}>{title}</h1>
      {children && <div className={cn(header.body.base, header.body[tone])}>{children}</div>}
    </header>
  );
}

export function SectionHeader({ children, className = "", eyebrow, title, tone = "light" }: HeaderProps) {
  const header = designSystem.components.header;

  return (
    <div className={cn(header.section, className)}>
      {eyebrow && <p className={cn(header.eyebrow.base, header.eyebrow[tone])}>{eyebrow}</p>}
      <h2 className={cn(header.sectionTitle.base, header.sectionTitle[tone])}>{title}</h2>
      {children && <p className={cn(header.body.base, header.body[tone])}>{children}</p>}
    </div>
  );
}
