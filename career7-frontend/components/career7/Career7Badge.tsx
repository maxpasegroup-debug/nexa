import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "./utils";

type BadgeTone = "indigo" | "cyan" | "purple" | "emerald" | "slate";

const toneClass: Record<BadgeTone, string> = {
  indigo: "c7-badge",
  cyan: "border-cyan-500/15 bg-cyan-50 text-cyan-700",
  purple: "border-purple-500/15 bg-purple-50 text-purple-700",
  emerald: "border-emerald-500/15 bg-emerald-50 text-emerald-700",
  slate: "border-slate-200 bg-slate-50 text-slate-600",
};

export type Career7BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  tone?: BadgeTone;
  dot?: boolean;
};

export function Career7Badge({
  children,
  tone = "indigo",
  dot = false,
  className,
  ...props
}: Career7BadgeProps) {
  return (
    <span className={cn("c7-badge", toneClass[tone], className)} {...props}>
      {dot ? <span className="h-2 w-2 rounded-full bg-current opacity-70" /> : null}
      {children}
    </span>
  );
}
