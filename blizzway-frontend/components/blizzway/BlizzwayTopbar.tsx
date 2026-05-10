import type { ReactNode } from "react";

import { BlizzwayBadge } from "./BlizzwayBadge";
import { BlizzwayButton } from "./BlizzwayButton";
import { cn } from "./utils";

export type BlizzwayTopbarProps = {
  title: string;
  subtitle?: string;
  userName?: string;
  userLabel?: string;
  action?: ReactNode;
  className?: string;
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function BlizzwayTopbar({
  title,
  subtitle,
  userName = "Blizzway user",
  userLabel = "Preview",
  action,
  className,
}: BlizzwayTopbarProps) {
  return (
    <header className={cn("flex flex-col gap-4 rounded-[28px] bg-white/82 p-4 shadow-sm ring-1 ring-slate-200/70 backdrop-blur sm:flex-row sm:items-center sm:justify-between", className)}>
      <div>
        <div className="flex items-center gap-2">
          <BlizzwayBadge tone="cyan" dot>
            {userLabel}
          </BlizzwayBadge>
        </div>
        <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm leading-6 c7-muted">{subtitle}</p> : null}
      </div>

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        {action ?? <BlizzwayButton href="/quick-boosts" variant="secondary">Quick boost</BlizzwayButton>}
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-xs font-black text-white">
            {initials(userName)}
          </span>
          <span className="hidden text-sm font-bold text-slate-700 sm:inline">{userName}</span>
        </div>
      </div>
    </header>
  );
}
