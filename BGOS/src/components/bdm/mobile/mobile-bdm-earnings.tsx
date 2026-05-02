"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

type MobileBDMEarningsProps = {
  earnings?: { firstSale: number; renewal: number; slabBonus: number; total: number };
  target?: number;
  leaderboard?: Array<{ id: string; name: string; total: number; current?: boolean }>;
  history?: Array<{ month: string; firstSale: number; renewal: number; slabBonus: number }>;
};

function money(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

export function MobileBDMEarnings({
  earnings = { firstSale: 0, renewal: 0, slabBonus: 0, total: 0 },
  target = 30000,
  leaderboard = [],
  history = [],
}: MobileBDMEarningsProps) {
  const pct = target > 0 ? Math.min(100, Math.round((earnings.total / target) * 100)) : 0;
  return (
    <main className="mobile-page min-h-screen bg-[#070709] px-4 py-5 text-white">
      <h1 className="font-heading text-xl font-extrabold">Earnings</h1>
      <section className="mt-5 rounded-2xl border border-white/[0.08] bg-[#13131c] p-5 text-center">
        <div className="mx-auto flex h-[110px] w-[110px] items-center justify-center rounded-full border-[8px] border-[#22D9A0]/60">
          <div><p className="font-heading text-xl font-extrabold text-[#22D9A0]">{pct}%</p><p className="text-[10px] text-[#6B6878]">{money(target)}</p></div>
        </div>
      </section>
      <section className="mt-4 rounded-2xl border border-white/[0.08] bg-[#13131c] p-4">
        {[["First sale", earnings.firstSale, "#22D9A0"], ["Renewal", earnings.renewal, "#7C6FFF"], ["Slab bonus", earnings.slabBonus, "#F5A623"]].map(([label, value, color]) => <div key={String(label)} className="flex justify-between border-b border-white/[0.06] py-3 text-sm"><span className="text-[#6B6878]">{label}</span><span style={{ color: String(color) }} className="font-bold">{money(Number(value))}</span></div>)}
        <div className="flex justify-between pt-4"><span>Total</span><span className="font-heading text-xl font-extrabold text-[#22D9A0]">{money(earnings.total)}</span></div>
        <button type="button" className="mt-4 w-full rounded-xl border border-white/[0.08] py-3 text-sm text-[#6B6878]">Target: {money(target)}/month ✎</button>
      </section>
      <section className="mt-4 rounded-2xl border border-white/[0.08] bg-[#13131c] p-4">
        <h2 className="font-heading text-sm font-extrabold">Leaderboard</h2>
        <div className="mt-3 space-y-2">{leaderboard.map((item, index) => <div key={item.id} className={`flex justify-between rounded-xl px-3 py-2 text-sm ${item.current ? "bg-[#22D9A0]/12 text-[#22D9A0]" : "bg-white/[0.03]"}`}><span>#{index + 1} {item.name}</span><b>{money(item.total)}</b></div>)}</div>
      </section>
      <section className="mt-4 rounded-2xl border border-white/[0.08] bg-[#13131c] p-4">
        <h2 className="font-heading text-sm font-extrabold">6-month history</h2>
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
      </section>
    </main>
  );
}
