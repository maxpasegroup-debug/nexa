import type { ReactNode } from "react";

import { Career7Button } from "./Career7Button";
import { Career7Card } from "./Career7Card";

export type Career7EmptyStateProps = {
  title: string;
  description: string;
  icon?: ReactNode;
  actionLabel?: string;
  actionHref?: string;
};

export function Career7EmptyState({
  title,
  description,
  icon,
  actionLabel,
  actionHref = "#",
}: Career7EmptyStateProps) {
  return (
    <Career7Card className="mx-auto max-w-lg text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
        {icon ?? <span className="text-lg font-black">C7</span>}
      </div>
      <h3 className="mt-5 text-xl font-black tracking-tight text-slate-950">{title}</h3>
      <p className="mt-3 text-sm leading-6 c7-muted">{description}</p>
      {actionLabel ? (
        <Career7Button href={actionHref} className="mt-6">
          {actionLabel}
        </Career7Button>
      ) : null}
    </Career7Card>
  );
}
