import * as React from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { cn, designSystem } from "@/lib/design-system";

type FeedbackStateProps = {
  children?: React.ReactNode;
  className?: string;
  title: string;
};

export function EmptyState({ children, className = "", title }: FeedbackStateProps) {
  const feedback = designSystem.components.feedback;

  return (
    <div className={cn(feedback.empty, className)}>
      <h3 className={feedback.title}>{title}</h3>
      {children && <p className={feedback.body}>{children}</p>}
    </div>
  );
}

export function LoadingState({ className = "", title }: Omit<FeedbackStateProps, "children">) {
  return (
    <div className={cn(designSystem.components.feedback.loading, className)} role="status">
      <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
      <span>{title}</span>
    </div>
  );
}

export function ErrorState({ children, className = "", title }: FeedbackStateProps) {
  return (
    <div className={cn(designSystem.components.feedback.error, className)} role="alert">
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
