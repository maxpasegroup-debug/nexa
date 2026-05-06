import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "./utils";

type CardVariant = "default" | "compact" | "agent" | "plain";

const variantClass: Record<CardVariant, string> = {
  default: "c7-card min-w-0 max-w-[calc(100vw-2rem)] md:max-w-none",
  compact: "c7-card-compact min-w-0 max-w-[calc(100vw-2rem)] md:max-w-none",
  agent: "c7-agent-card min-w-0 max-w-[calc(100vw-2rem)] md:max-w-none",
  plain: "min-w-0 max-w-[calc(100vw-2rem)] rounded-[22px] border border-slate-200 bg-white md:max-w-none",
};

export type Career7CardProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  variant?: CardVariant;
  as?: "article" | "section" | "div";
  padded?: boolean;
};

export function Career7Card({
  children,
  variant = "default",
  as = "div",
  padded = true,
  className,
  ...props
}: Career7CardProps) {
  const Component = as;

  return (
    <Component className={cn(variantClass[variant], padded && "p-5 sm:p-6", className)} {...props}>
      {children}
    </Component>
  );
}
