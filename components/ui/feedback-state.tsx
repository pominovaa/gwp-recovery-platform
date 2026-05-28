import * as React from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/design-system/classnames";

type FeedbackStateProps = {
  children?: React.ReactNode;
  className?: string;
  title: string;
};

export function EmptyState({ children, className = "", title }: FeedbackStateProps) {
  return (
    <div className={cn("rounded-gwp border border-dashed border-stone-300 bg-white p-6 text-center", className)}>
      <h3 className="text-lg font-semibold text-stone-950">{title}</h3>
      {children && <p className="mt-2 text-sm leading-6 text-stone-600">{children}</p>}
    </div>
  );
}

export function LoadingState({ className = "", title }: Omit<FeedbackStateProps, "children">) {
  return (
    <div className={cn("flex items-center gap-3 rounded-gwp border border-stone-200 bg-white p-4 text-sm text-stone-700", className)} role="status">
      <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
      <span>{title}</span>
    </div>
  );
}

export function ErrorState({ children, className = "", title }: FeedbackStateProps) {
  return (
    <div className={cn("rounded-gwp border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800", className)} role="alert">
      <div className="flex gap-3">
        <AlertCircle aria-hidden="true" className="mt-0.5 h-5 w-5 flex-none" />
        <div>
          <h3 className="font-semibold">{title}</h3>
          {children && <p className="mt-1 leading-6">{children}</p>}
        </div>
      </div>
    </div>
  );
}
