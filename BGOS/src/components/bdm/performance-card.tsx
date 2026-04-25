"use client";

type BdmMetrics = {
  myLeadsTotal: number;
  myLeadsNew: number;
  myLeadsHot: number;
  followUpsDueToday: number;
  followUpsOverdue: number;
  wonThisMonth: number;
  wonTarget: number;
  wonProgress: number;
  revenueThisMonth: number;
  revenueTarget: number;
  revenueProgress: number;
  callsToday: number;
  avgResponseTime: number;
  conversionRate: number;
  teamRank: number;
  teamSize: number;
};

type PerformanceCardProps = {
  metrics: BdmMetrics;
};

function ProgressRing({
  value,
  color,
  label,
}: {
  value: number;
  color: string;
  label: string;
}) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, value));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-28 w-28">
        <svg className="-rotate-90" width="112" height="112" viewBox="0 0 112 112">
          <circle
            cx="56"
            cy="56"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth="7"
          />
          <circle
            cx="56"
            cy="56"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-heading text-xl font-bold text-white">
          {Math.round(value)}%
        </div>
      </div>
      <p className="mt-2 text-xs text-zinc-500">{label}</p>
    </div>
  );
}

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export function PerformanceCard({ metrics }: PerformanceCardProps) {
  const rankPosition =
    metrics.teamSize > 1
      ? ((metrics.teamRank - 1) / (metrics.teamSize - 1)) * 100
      : 0;

  return (
    <section className="rounded-2xl border border-white/10 bg-[#13131c] p-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <ProgressRing value={metrics.wonProgress} color="#7C6FFF" label="Won target" />
          <p className="mt-2 text-center text-xs text-zinc-400">
            {metrics.wonThisMonth} / {metrics.wonTarget} won
          </p>
        </div>
        <div>
          <ProgressRing
            value={metrics.revenueProgress}
            color="#22D9A0"
            label="Revenue target"
          />
          <p className="mt-2 text-center text-xs text-zinc-400">
            {formatCurrency(metrics.revenueThisMonth)} /{" "}
            {formatCurrency(metrics.revenueTarget)}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        {[
          ["Calls today", metrics.callsToday],
          ["Avg response", `${metrics.avgResponseTime} hours`],
          ["Conversion", `${metrics.conversionRate}%`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-white/10 bg-[#0e0e13] p-3">
            <p className="text-[11px] text-zinc-500">{label}</p>
            <p className="mt-1 text-sm font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-xl border border-white/10 bg-[#0e0e13] p-4">
        <p className="text-sm text-zinc-300">
          {metrics.teamRank === 1 ? "👑 " : ""}You are ranked{" "}
          <span className="font-bold text-white">#{metrics.teamRank}</span> of{" "}
          {metrics.teamSize} in your team this month.
        </p>
        <div className="relative mt-4 h-2 rounded-full bg-white/10">
          <span
            className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-[#7C6FFF] shadow-[0_0_18px_rgba(124,111,255,0.6)]"
            style={{ left: `calc(${rankPosition}% - 8px)` }}
          />
        </div>
      </div>
    </section>
  );
}

export type { BdmMetrics };
