import * as React from "react";
import { cn, designSystem } from "@/lib/design-system";

type FormFieldProps = {
  children?: React.ReactNode;
  className?: string;
  error?: string;
  helpText?: string;
  id: string;
  label: string;
};

export function FormField({ children, className = "", error, helpText, id, label }: FormFieldProps) {
  const form = designSystem.components.form;

  return (
    <div className={cn(form.field, className)}>
      <label className={form.label} htmlFor={id}>
        {label}
      </label>
      {children}
      {helpText && <p className={form.helpText}>{helpText}</p>}
      {error && (
        <p className={form.errorText} id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}

export function textInputClasses(className = "") {
  return cn(designSystem.components.form.input, className);
}
