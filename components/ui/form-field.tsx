import * as React from "react";
import { cn } from "@/lib/design-system/classnames";

type FormFieldProps = {
  children?: React.ReactNode;
  className?: string;
  error?: string;
  helpText?: string;
  id: string;
  label: string;
};

export function FormField({ children, className = "", error, helpText, id, label }: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="block text-sm font-semibold text-stone-800" htmlFor={id}>
        {label}
      </label>
      {children}
      {helpText && <p className="text-sm leading-6 text-stone-500">{helpText}</p>}
      {error && (
        <p className="text-sm font-medium text-rose-700" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}

export function textInputClasses(className = "") {
  return cn(
    "h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm outline-none transition focus:border-stone-500",
    className
  );
}
