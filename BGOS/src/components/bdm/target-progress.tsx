"use client";

import { useEffect, useState } from "react";

import type { BdmMetrics } from "@/components/bdm/performance-card";

type Target = {
  leadsTarget: number;
  wonTarget: number;
  revenueTarget: number;
};

type TargetProgressProps = {
  target: Target;
  metrics: BdmMetrics;
};

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

function daysRemainingInMonth() {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return Math.max(0, end.getDate() - now.getDate());
}

function ProgressBar({
  label,
  current,
  target,
  color,
  formatter = String,
}: {
  label: string;
  current: number;
  target: number;
  color: string;
  formatter?: (value: number) => string;
}) {
  const [mounted, setMounted] = useState(false);
  const percentage = target > 0 ? (current / target) * 100 : 0;
  const capped = Math.min(100, percentage);
  const hit = percentage >= 100 && target > 0;

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-xs">
        <p className="text-zinc-400">
          {label}:{" "}
          <span className={hit ? "font-bold text-[#22D9A0]" : "text-white"}>
            {formatter(current)}
          </span>{" "}
          of {formatter(target)} target
        </p>
        {hit ? (
          <span className="rounded-full bg-[#22D9A0]/10 px-2 py-0.5 text-[10px] font-bold text-[#22D9A0]">
            🎯 Target hit!
          </span>
        ) : null}
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[rgba(255,255,255,0.07)]">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: mounted ? `${capped}%` : "0%",
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}

export function TargetProgress({ target, metrics }: TargetProgressProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#13131c] p-5">
      <h2 className="font-heading text-base font-bold text-white">
        Monthly targets
      </h2>
      <div className="mt-5 space-y-5">
        <ProgressBar
          label="Total leads"
          current={metrics.myLeadsTotal}
          target={target.leadsTarget}
          color="#7C6FFF"
        />
        <ProgressBar
          label="Leads won"
          current={metrics.wonThisMonth}
          target={target.wonTarget}
          color="#F5A623"
        />
        <ProgressBar
          label="Revenue"
          current={metrics.revenueThisMonth}
          target={target.revenueTarget}
          color="#22D9A0"
          formatter={formatCurrency}
        />
      </div>
      <p className="mt-5 text-xs text-zinc-500">
        {daysRemainingInMonth()} days left this month.
      </p>
    </section>
  );
}
