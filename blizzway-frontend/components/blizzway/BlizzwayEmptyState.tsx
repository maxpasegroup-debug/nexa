import type { ReactNode } from "react";

import { BlizzwayButton } from "./BlizzwayButton";
import { BlizzwayCard } from "./BlizzwayCard";

export type BlizzwayEmptyStateProps = {
  title: string;
  description: string;
  icon?: ReactNode;
  actionLabel?: string;
  actionHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
};

export function BlizzwayEmptyState({
  title,
  description,
  icon,
  actionLabel,
  actionHref = "#",
  secondaryLabel,
  secondaryHref = "#",
}: BlizzwayEmptyStateProps) {
  return (
    <BlizzwayCard className="mx-auto max-w-lg text-center c7-lift-card">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-gradient-to-br from-indigo-50 to-cyan-50 text-indigo-600 ring-1 ring-indigo-100">
        {icon ?? <span className="text-lg font-black">BW</span>}
      </div>
      <h3 className="mt-5 text-xl font-black tracking-tight text-slate-950">{title}</h3>
      <p className="mt-3 text-sm leading-6 c7-muted">{description}</p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        {actionLabel ? <BlizzwayButton href={actionHref}>{actionLabel}</BlizzwayButton> : null}
        {secondaryLabel ? (
          <BlizzwayButton href={secondaryHref} variant="secondary">
            {secondaryLabel}
          </BlizzwayButton>
        ) : null}
      </div>
    </BlizzwayCard>
  );
}
