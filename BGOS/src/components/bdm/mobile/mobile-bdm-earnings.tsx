"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

type MobileBDMEarningsProps = {
  earnings?: { firstSale: number; renewal: number; slabBonus: number; total: number };
  leadTypeBreakdown?: Record<"platform" | "management" | "self", { closed: number; amount: number; base: number }>;
  target?: number;
  leaderboard?: Array<{ id: string; name: string; total: number; current?: boolean }>;
  history?: Array<{ month: string; firstSale: number; renewal: number; slabBonus: number }>;
};

type TargetData = {
  currentEarnings?: number;
  progressPct?: number;
  currentSlab?: string;
  nextMilestone?: string;
  breakdown?: {
    planFirst?: number;
    planRenewal?: number;
    agentFirst?: number;
    agentRenewal?: number;
    slabBonus?: number;
  };
  recentTransactions?: Array<{ id: string; type: string; amount: number }>;
  target?: { revenueTarget?: number };
};

function money(value: number) {
  return `₹${Math.round(value || 0).toLocaleString("en-IN")}`;
}

export function MobileBDMEarnings({
  earnings = { firstSale: 0, renewal: 0, slabBonus: 0, total: 0 },
  leadTypeBreakdown,
  target = 30000,
  leaderboard = [],
  history = [],
}: MobileBDMEarningsProps) {
  const [targetData, setTargetData] = useState<TargetData | null>(null);

  useEffect(() => {
    async function loadTarget() {
      const response = await fetch("/api/bdm/target", { cache: "no-store" });
      if (!response.ok) return;
      setTargetData((await response.json()) as TargetData);
    }

    void loadTarget();
  }, []);

  const breakdown = targetData?.breakdown || {};
  const currentEarnings = targetData?.currentEarnings ?? earnings.total ?? 0;
  const targetAmount = targetData?.target?.revenueTarget || target || 30000;
  const pct = targetData?.progressPct ?? (targetAmount > 0 ? Math.min(100, Math.round((currentEarnings / targetAmount) * 100)) : 0);
  const currentSlab = targetData?.currentSlab || "NONE";
  const nextMilestone = targetData?.nextMilestone || "Earn ₹7,500 to unlock Bronze slab and earn ₹3,000 bonus";
  const recentTransactions = targetData?.recentTransactions || [];
  const rows = [
    ["Plan commissions", breakdown.planFirst ?? earnings.firstSale ?? 0, "#22D9A0"],
    ["Agent commissions", breakdown.agentFirst ?? 0, "#7C6FFF"],
    ["Renewal income", (breakdown.planRenewal ?? 0) + (breakdown.agentRenewal ?? earnings.renewal ?? 0), "#a89fff"],
    ["Slab bonus", breakdown.slabBonus ?? earnings.slabBonus ?? 0, "#F5A623"],
  ] as const;

  return (
    <main className="mobile-page min-h-screen bg-[#070709] px-4 py-5 text-white">
      <h1 className="font-heading text-xl font-extrabold">Earnings</h1>
      <section className="mt-5 rounded-2xl border border-white/[0.08] bg-[#13131c] p-5 text-center">
        <div className={`mx-auto flex h-[118px] w-[118px] items-center justify-center rounded-full border-[8px] ${currentEarnings > 0 ? "border-[#22D9A0]/60" : "border-white/15"}`}>
          <div>
            <p className={`font-heading text-xl font-extrabold ${currentEarnings > 0 ? "text-[#22D9A0]" : "text-zinc-500"}`}>{pct}%</p>
            <p className="mt-1 text-[10px] text-[#6B6878]">{money(currentEarnings)} earned this month</p>
          </div>
        </div>
        <span className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-bold ${currentSlab === "NONE" ? "bg-white/[0.06] text-zinc-400" : "bg-[#F5A623]/12 text-[#F5A623]"}`}>
          {currentSlab === "NONE" ? "No slab yet" : `${currentSlab} slab`}
        </span>
      </section>

      <section className="mt-4 rounded-2xl border border-white/[0.08] bg-[#13131c] p-4">
        <div className="rounded-xl border border-[#7C6FFF]/20 bg-[#7C6FFF]/10 p-3 text-xs font-bold text-[#c6c1ff]">
          {nextMilestone}
        </div>
        <div className="mt-3">
          {rows.map(([label, value, color]) => (
            <div key={label} className="flex justify-between border-b border-white/[0.06] py-3 text-sm">
              <span className="text-[#6B6878]">{label}</span>
              <span style={{ color }} className="font-bold">{money(Number(value))}</span>
            </div>
          ))}
          <div className="flex justify-between pt-4">
            <span>Total this month</span>
            <span className={`font-heading text-xl font-extrabold ${currentEarnings > 0 ? "text-[#22D9A0]" : "text-zinc-500"}`}>{money(currentEarnings)}</span>
          </div>
        </div>
        {recentTransactions.length > 0 ? (
          <div className="mt-4 rounded-xl border border-white/[0.08] bg-black/20 p-3 text-xs">
            {recentTransactions.map((item) => (
              <div key={item.id} className="flex justify-between border-b border-white/[0.05] py-2">
                <span>{item.type}</span>
                <b>{money(item.amount)}</b>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-xl border border-white/[0.08] bg-black/20 p-3 text-xs leading-5 text-[#6B6878]">
            No earnings yet this month. Your first commission appears here when a customer pays.
          </p>
        )}
        {leadTypeBreakdown ? (
          <div className="mt-4 rounded-xl border border-white/[0.08] bg-black/20 p-3 text-left text-xs">
            {[
              ["Platform", leadTypeBreakdown.platform, "standard"],
              ["Management", leadTypeBreakdown.management, "70%"],
              ["Self", leadTypeBreakdown.self, "10% bonus"],
            ].map(([label, row, note]) => {
              const item = row as { closed: number; amount: number };
              return <div key={String(label)} className="flex justify-between border-b border-white/[0.05] py-2"><span>{String(label)} ({item.closed})</span><b>{money(item.amount)} <em className="font-normal text-[#6B6878]">{String(note)}</em></b></div>;
            })}
          </div>
        ) : null}
        <button type="button" className="mt-4 w-full rounded-xl border border-white/[0.08] py-3 text-sm text-[#6B6878]">Target: {money(targetAmount)}/month</button>
      </section>

      <section className="mt-4 rounded-2xl border border-white/[0.08] bg-[#13131c] p-4">
        <h2 className="font-heading text-sm font-extrabold">Leaderboard</h2>
        <div className="mt-3 space-y-2">
          {leaderboard.length > 0 ? leaderboard.map((item, index) => (
            <div key={item.id} className={`flex justify-between rounded-xl px-3 py-2 text-sm ${item.current ? "bg-[#22D9A0]/12 text-[#22D9A0]" : "bg-white/[0.03]"}`}>
              <span>#{index + 1} {item.name}</span><b>{money(item.total)}</b>
            </div>
          )) : <p className="text-xs text-[#6B6878]">Leaderboard appears after the first commission this month.</p>}
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-white/[0.08] bg-[#13131c] p-4">
        <h2 className="font-heading text-sm font-extrabold">6-month history</h2>
        {history.length > 0 ? (
          <div className="mt-3 h-[180px] min-w-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={history}>
                <XAxis dataKey="month" hide />
                <YAxis hide />
                <Bar dataKey="firstSale" stackId="a" fill="#22D9A0" />
                <Bar dataKey="renewal" stackId="a" fill="#7C6FFF" />
                <Bar dataKey="slabBonus" stackId="a" fill="#F5A623" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="mt-3 text-xs text-[#6B6878]">Earnings history appears after payouts are recorded.</p>
        )}
      </section>
    </main>
  );
}
