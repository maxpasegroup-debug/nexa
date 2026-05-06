import type { ReactNode } from "react";

import { Career7Card } from "./Career7Card";
import { cn } from "./utils";

type StatTone = "indigo" | "purple" | "cyan" | "emerald" | "amber";

const toneClass: Record<StatTone, string> = {
  indigo: "text-indigo-600 bg-indigo-50",
  purple: "text-purple-600 bg-purple-50",
  cyan: "text-cyan-600 bg-cyan-50",
  emerald: "text-emerald-600 bg-emerald-50",
  amber: "text-amber-600 bg-amber-50",
};

export type Career7StatCardProps = {
  label: string;
  value: string | number;
  trend?: string;
  icon?: ReactNode;
  tone?: StatTone;
  className?: string;
};

export function Career7StatCard({
  label,
  value,
  trend,
  icon,
  tone = "indigo",
  className,
}: Career7StatCardProps) {
  return (
    <Career7Card variant="compact" className={className}>
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-semibold c7-muted">{label}</p>
        {icon ? <span className={cn("rounded-xl p-2", toneClass[tone])}>{icon}</span> : null}
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <p className="text-3xl font-black tracking-tight text-slate-950">{value}</p>
        {trend ? (
          <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold", toneClass[tone])}>
            {trend}
          </span>
        ) : null}
      </div>
    </Career7Card>
  );
}
