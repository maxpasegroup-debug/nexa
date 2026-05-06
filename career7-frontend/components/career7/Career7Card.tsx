import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "./utils";

type CardVariant = "default" | "compact" | "agent" | "plain";

const variantClass: Record<CardVariant, string> = {
  default: "c7-card",
  compact: "c7-card-compact",
  agent: "c7-agent-card",
  plain: "rounded-[22px] border border-slate-200 bg-white",
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
