"use client";

import { useEffect, useState } from "react";

type TargetData = {
  target?: { revenueTarget?: number };
  currentEarnings?: number;
  progressPct?: number;
  dealsThisMonth?: number;
  daysRemaining?: number;
  projectedEarnings?: number;
  currentSlab?: string;
  currentSlabBonus?: number;
  nextSlabName?: string | null;
  nextSlabAmount?: number;
  amountToNextSlab?: number;
  nextMilestone?: string;
  breakdown?: {
    planFirst?: number;
    planRenewal?: number;
    agentFirst?: number;
    agentRenewal?: number;
    slabBonus?: number;
  };
  recentTransactions?: Array<{ id: string; type: string; amount: number; createdAt: string }>;
};

function money(value: number) {
  return `₹${Math.round(value || 0).toLocaleString("en-IN")}`;
}

export function TargetHero() {
  const [data, setData] = useState<TargetData | null>(null);

  useEffect(() => {
    async function loadTarget() {
      const response = await fetch("/api/bdm/target", { cache: "no-store" });
      if (!response.ok) return;
      setData((await response.json()) as TargetData);
    }

    void loadTarget();
  }, []);

  const {
    target,
    currentEarnings = 0,
    progressPct = 0,
    dealsThisMonth = 0,
    daysRemaining = 0,
    projectedEarnings = 0,
    currentSlab = "NONE",
    currentSlabBonus = 0,
    nextSlabName,
    nextSlabAmount = 0,
    amountToNextSlab = 0,
    nextMilestone = "",
    breakdown = {},
    recentTransactions = [],
  } = data || {};
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, progressPct));
  const stroke = currentEarnings > 0 ? "#22D9A0" : "rgba(255,255,255,0.18)";
  const total = (breakdown.planFirst || 0) + (breakdown.agentFirst || 0) + (breakdown.planRenewal || 0) + (breakdown.agentRenewal || 0) + (breakdown.slabBonus || 0);

  return (
    <section className="rounded-2xl border border-white/10 bg-[#13131c] p-5">
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <div className="flex flex-col items-center">
          <div className="relative h-[150px] w-[150px]">
            <svg className="-rotate-90" width="150" height="150" viewBox="0 0 150 150">
              <circle cx="75" cy="75" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
              <circle
                cx="75"
                cy="75"
                r={radius}
                fill="none"
                stroke={stroke}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - (clamped / 100) * circumference}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <p className={`font-heading text-xl font-bold ${currentEarnings > 0 ? "text-[#22D9A0]" : "text-zinc-500"}`}>
                {progressPct || 0}%
              </p>
              <p className="mt-1 text-xs text-zinc-500">{money(currentEarnings)} earned this month</p>
            </div>
          </div>
          <span className={`mt-3 rounded-full px-3 py-1 text-xs font-bold ${currentSlab === "NONE" ? "bg-white/[0.06] text-zinc-400" : "bg-[#F5A623]/12 text-[#F5A623]"}`}>
            {currentSlab === "NONE" ? "No slab yet" : `${currentSlab} · ${money(currentSlabBonus)}`}
          </span>
        </div>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-[#0e0e13] p-3">
              <p className="text-[11px] text-zinc-500">Deals</p>
              <p className="mt-1 font-heading text-xl font-bold text-white">{dealsThisMonth}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#0e0e13] p-3">
              <p className="text-[11px] text-zinc-500">Days left</p>
              <p className="mt-1 font-heading text-xl font-bold text-white">{daysRemaining}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#0e0e13] p-3">
              <p className="text-[11px] text-zinc-500">Projected</p>
              <p className="mt-1 font-heading text-xl font-bold text-white">{money(projectedEarnings)}</p>
            </div>
          </div>

          <div className="rounded-xl border border-[#7C6FFF]/20 bg-[#7C6FFF]/10 p-3 text-sm text-[#c6c1ff]">
            {nextMilestone || `Earn ₹7,500 to unlock Bronze slab and earn ₹3,000 bonus`}
            {nextSlabName ? <span className="ml-2 text-xs text-zinc-400">Next: {nextSlabName} · {money(nextSlabAmount)} · {money(amountToNextSlab)} away</span> : null}
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0e0e13] p-4 text-sm">
            {[
              ["Plan commissions", breakdown.planFirst || 0],
              ["Agent commissions", breakdown.agentFirst || 0],
              ["Renewal income", (breakdown.planRenewal || 0) + (breakdown.agentRenewal || 0)],
              ["Slab bonus", breakdown.slabBonus || 0],
            ].map(([label, value]) => (
              <div key={String(label)} className="flex justify-between py-1.5 text-zinc-400">
                <span>{label}</span>
                <span>{money(Number(value))}</span>
              </div>
            ))}
            <div className="mt-2 flex justify-between border-t border-white/10 pt-3 font-bold text-white">
              <span>Total this month</span>
              <span>{money(total)}</span>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0e0e13] p-4">
            <h3 className="font-heading text-sm font-bold text-white">Recent transactions</h3>
            {recentTransactions.length > 0 ? (
              <div className="mt-3 space-y-2">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex justify-between text-sm">
                    <span className="text-zinc-400">{transaction.type}</span>
                    <span className="font-bold text-[#22D9A0]">{money(transaction.amount)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-zinc-500">
                No earnings yet this month. Your first commission appears here when a customer pays.
              </p>
            )}
          </div>
        </div>
      </div>
      <p className="mt-4 text-xs text-zinc-600">Target: {money(target?.revenueTarget || 30000)}</p>
    </section>
  );
}
