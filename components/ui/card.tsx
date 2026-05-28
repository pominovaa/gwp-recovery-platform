import * as React from "react";
import { cn } from "@/lib/design-system/classnames";

export function Card({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-gwp-lg border border-stone-200 bg-white text-stone-950 shadow-sm", className)} {...props} />;
}

export function CardContent({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={className} {...props} />;
}
