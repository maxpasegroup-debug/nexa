"use client";

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";

type Slab = {
  name: string;
  label: string;
  bonus: number;
  deals: number;
};

type CommissionSummary = {
  firstSale: number;
  renewal: number;
  slab: number;
  total: number;
  target: number;
  progressPct: number;
  currentSlab: Slab;
  nextMilestone: string | null;
  projectedTotal: number;
  daysRemaining: number;
  dealsThisMonth: number;
  leadTypeBreakdown?: Record<"platform" | "management" | "self", { closed: number; amount: number; base: number }>;
};

type EarningsTrackerProps = {
  data: CommissionSummary;
};

function money(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

function fillColor(progress: number) {
  if (progress < 30) return "#FF6B6B";
  if (progress < 70) return "#F5A623";
  return "#22D9A0";
}

function daysTone(days: number) {
  if (days < 5) return "text-[#FF6B6B]";
  if (days < 10) return "text-[#F5A623]";
  return "text-[#22D9A0]";
}

function BreakdownPill({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-zinc-300">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

export function EarningsTracker({ data }: EarningsTrackerProps) {
  const [animatedPct, setAnimatedPct] = useState(0);
  const progress = Math.max(0, Math.min(100, data.progressPct));

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setAnimatedPct(progress));
    return () => window.cancelAnimationFrame(frame);
  }, [progress]);

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#13131c] text-white shadow-2xl shadow-black/20">
      <div className="border-l-4 border-l-transparent bg-[linear-gradient(#13131c,#13131c)_padding-box,linear-gradient(180deg,#7C6FFF,#22D9A0)_border-box] p-5 md:p-6">
        <div className="grid gap-6 text-center md:grid-cols-2 md:items-end">
          <div>
            <p className="font-heading text-4xl font-bold leading-none text-[#22D9A0]">
              {money(data.total)} earned
            </p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              this month
            </p>
          </div>
          <div>
            <p className="font-heading text-2xl font-bold leading-none text-[#F5A623]">
              {money(data.projectedTotal)} projected
            </p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              by month end
            </p>
          </div>
        </div>

        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
              Progress to ₹30,000 target
            </p>
            <p className="text-xs font-bold text-zinc-400">
              {Math.round(data.progressPct)}%
            </p>
          </div>
          <div className="relative h-3 overflow-hidden rounded-full bg-white/[0.05]">
            <div
              className="relative h-full rounded-full transition-[width] duration-[1500ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                width: `${animatedPct}%`,
                backgroundColor: fillColor(progress),
              }}
            >
              {animatedPct > 12 ? (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-black/70">
                  {Math.round(data.progressPct)}%
                </span>
              ) : null}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <BreakdownPill color="#22D9A0" label={`${money(data.firstSale)} first sale`} />
            <BreakdownPill color="#7C6FFF" label={`${money(data.renewal)} renewal`} />
            <BreakdownPill color="#F5A623" label={`${money(data.slab)} slab bonus`} />
          </div>
          {data.leadTypeBreakdown ? (
            <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4 text-sm">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
                Commission breakdown this month
              </p>
              {[
                ["⚡ Platform leads", data.leadTypeBreakdown.platform, "standard rate"],
                ["🎯 Management leads", data.leadTypeBreakdown.management, "70% rate"],
                ["💪 Self-generated", data.leadTypeBreakdown.self, "10% bonus"],
              ].map(([label, row, note]) => {
                const item = row as { closed: number; amount: number; base: number };
                return (
                  <div key={String(label)} className="flex items-center justify-between border-b border-white/5 py-2">
                    <span className="text-zinc-300">{String(label)} ({item.closed} closed)</span>
                    <span className="font-bold text-white">{money(item.amount)} <em className="ml-2 text-xs font-normal text-zinc-500">{String(note)}</em></span>
                  </div>
                );
              })}
              <p className="mt-3 text-xs text-zinc-500">
                Self-generated leads earn 10% bonus. Management leads earn 70% of standard rate.
              </p>
            </div>
          ) : null}
        </div>

        <div className="mt-6 space-y-4">
          {data.nextMilestone ? (
            <div className="flex items-start gap-3 rounded-xl border border-[#F5A623]/25 bg-[#F5A623]/10 px-4 py-3 text-sm font-semibold text-[#F5A623]">
              <Zap className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{data.nextMilestone}</p>
            </div>
          ) : (
            <div className="rounded-xl border border-[#22D9A0]/25 bg-[#22D9A0]/10 px-4 py-3 text-sm font-semibold text-[#22D9A0]">
              💎 Diamond achieved - maximum slab unlocked this month!
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-sm font-semibold">
            <span className={daysTone(data.daysRemaining)}>
              {data.daysRemaining} days remaining this month
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-zinc-300">
              {data.dealsThisMonth} deals closed
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
