"use client";

import Link from "next/link";

type BossUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type BossBusiness = {
  id: string;
  name: string;
  healthScore: number;
};

type BossMetrics = {
  healthScore: number;
  totalLeads: number;
  hotLeads: number;
  wonThisMonth: number;
  teamCount: number;
  revenueThisMonth: number;
  leadsThisWeek: number;
  conversionRate: number;
};

type BossActivity = {
  id: string;
  action: string;
  entity: string;
  createdAt: string | Date;
  user?: {
    name: string;
    role: string;
  };
};

type BossInsight = {
  id: string;
  type: string;
  message: string;
  action?: string | null;
};

type MobileBossDashboardProps = {
  user: BossUser;
  business: BossBusiness;
  metrics: BossMetrics;
  activity: BossActivity[];
  insights: BossInsight[];
  planName?: string;
};

function healthColor(score: number) {
  if (score < 40) return "#FF6B6B";
  if (score < 70) return "#F5A623";
  return "#22D9A0";
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function timeAgo(value: string | Date) {
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.max(1, Math.round(diff / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function Ring({ score }: { score: number }) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const color = healthColor(score);

  return (
    <svg width="90" height="90" viewBox="0 0 90 90" aria-label={`Health score ${score}`}>
      <circle cx="45" cy="45" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
      <circle
        cx="45"
        cy="45"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference - (Math.max(0, Math.min(score, 100)) / 100) * circumference}
        transform="rotate(-90 45 45)"
      />
      <text x="45" y="49" textAnchor="middle" className="fill-white font-heading text-[24px] font-extrabold">
        {score}
      </text>
    </svg>
  );
}

export function MobileBossDashboard({
  user,
  business,
  metrics,
  activity,
  insights,
  planName = "Growth",
}: MobileBossDashboardProps) {
  const healthInsights =
    insights.length > 0
      ? insights.slice(0, 3).map((item) => item.message)
      : [
          `${metrics.hotLeads} hot leads are ready for follow-up.`,
          `${metrics.teamCount} teammates are active in this workspace.`,
          `${metrics.wonThisMonth} deals were won this month.`,
        ];
  const brief =
    insights[0]?.message ??
    `Your business is at ${metrics.healthScore}% health. Review hot leads first, then check team follow-ups.`;

  const metricCards = [
    { label: "Active leads", value: metrics.totalLeads, trend: `${metrics.leadsThisWeek} new this week`, color: "#7C6FFF" },
    { label: "Team active", value: metrics.teamCount, trend: "Workspace users", color: "#22D9A0" },
    { label: "MRR this month", value: `₹${metrics.revenueThisMonth.toLocaleString("en-IN")}`, trend: "Live revenue", color: "#22D9A0" },
    { label: "Deals closing soon", value: metrics.hotLeads, trend: "High score leads", color: "#F5A623" },
  ];

  return (
    <main className="mobile-page min-h-screen bg-[var(--bg)] px-4 pt-4 text-[var(--text)]">
      <header className="flex items-center justify-between">
        <div className="min-w-0">
          <h1 className="truncate font-heading text-sm font-extrabold">{business.name}</h1>
          <p className="mt-1 text-[10px] font-semibold text-[#22D9A0]">NEXA running · {planName} plan</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#7C6FFF]/20 font-heading text-xs font-bold text-[#c9c4ff]">
          {initials(user.name)}
        </div>
      </header>

      <section className="mt-5 rounded-[18px] border border-white/10 bg-[var(--card)] p-4">
        <div className="flex items-center gap-4">
          <Ring score={metrics.healthScore} />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium text-[var(--muted)]">Business health</p>
            <div className="mt-2 space-y-1.5">
              {healthInsights.map((item) => (
                <p key={item} className="line-clamp-1 text-[11px] leading-5 text-zinc-400">
                  ▸ {item}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-4 grid grid-cols-2 gap-3">
        {metricCards.map((card) => (
          <div key={card.label} className="rounded-[14px] border border-white/10 bg-[var(--card)] p-3">
            <p className="font-heading text-[22px] font-extrabold" style={{ color: card.color }}>
              {card.value}
            </p>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-normal text-[var(--muted)]">{card.label}</p>
            <p className="mt-2 text-[10px] text-zinc-500">{card.trend}</p>
          </div>
        ))}
      </section>

      <section className="mt-4 rounded-[18px] border border-[#7C6FFF]/35 bg-[#7C6FFF]/10 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#7C6FFF] to-[#22D9A0] font-heading text-xs font-bold text-white">
            N
          </div>
          <div>
            <p className="font-heading text-sm font-bold">CEO Brief</p>
            <p className="text-[10px] text-zinc-500">Updated now</p>
          </div>
        </div>
        <p className="mt-3 text-xs leading-6 text-zinc-300">{brief}</p>
        <div className="mt-4 flex gap-2 overflow-x-auto scroll-x-hidden">
          {[
            ["View pipeline", "/boss/leads"],
            ["Team report", "/boss/team"],
            ["Revenue", "/boss/reports"],
            ["Alerts", "/boss/inbox"],
          ].map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className="shrink-0 rounded-full border border-[#7C6FFF]/30 px-3 py-2 text-[11px] font-semibold text-[#c9c4ff]"
            >
              {label}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-[18px] border border-white/10 bg-[var(--card)] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-heading text-sm font-bold">Recent activity</h2>
          <Link href="/boss/reports" className="text-[11px] font-semibold text-[#7C6FFF]">
            View all →
          </Link>
        </div>
        <div className="space-y-3">
          {activity.length > 0 ? (
            activity.slice(0, 5).map((item, index) => (
              <Link key={item.id} href="/boss/leads" className="flex items-start gap-3 rounded-xl py-1">
                <span
                  className="mt-1.5 h-2 w-2 rounded-full"
                  style={{ background: ["#7C6FFF", "#22D9A0", "#F5A623", "#00BCD4", "#FF6B6B"][index] }}
                />
                <span className="min-w-0 flex-1">
                  <span className="block line-clamp-1 text-xs text-zinc-300">
                    {item.user?.name ? `${item.user.name} ` : ""}
                    {item.action.toLowerCase()} {item.entity.toLowerCase()}
                  </span>
                  <span className="mt-1 block text-[10px] text-zinc-600">{timeAgo(item.createdAt)}</span>
                </span>
              </Link>
            ))
          ) : (
            <p className="text-xs text-zinc-500">No activity yet. NEXA will surface important updates here.</p>
          )}
        </div>
      </section>
    </main>
  );
}

export { MobileBossDashboard as MobileBossHome };
