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

function money(value: number) {
  return `₹${Math.round(value || 0).toLocaleString("en-IN")}`;
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
  const radius = 41;
  const circumference = 2 * Math.PI * radius;
  const color = healthColor(score);

  return (
    <svg width="104" height="104" viewBox="0 0 104 104" aria-label={`Business health score ${score}`}>
      <circle cx="52" cy="52" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="9" />
      <circle
        cx="52"
        cy="52"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference - (Math.max(0, Math.min(score, 100)) / 100) * circumference}
        transform="rotate(-90 52 52)"
      />
      <text x="52" y="57" textAnchor="middle" className="fill-white font-heading text-[26px] font-extrabold">
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
  const brief =
    insights[0]?.message ??
    `Your business health is ${metrics.healthScore}. Start with ${metrics.hotLeads} hot leads, then check team follow-ups.`;
  const attention = [
    {
      title: `${metrics.hotLeads} hot leads need action`,
      subtitle: `${metrics.leadsThisWeek} new leads this week`,
      href: "/boss/leads",
      tone: "text-[#F5A623]",
    },
    {
      title: `${metrics.teamCount} team members active`,
      subtitle: "Review ownership and workloads",
      href: "/boss/team",
      tone: "text-[#22D9A0]",
    },
    {
      title: `${money(metrics.revenueThisMonth)} revenue this month`,
      subtitle: `${metrics.conversionRate}% conversion rate`,
      href: "/boss/reports",
      tone: "text-[#7C6FFF]",
    },
  ];
  const actions = [
    { icon: "📊", label: "Pipeline", href: "/boss/leads", color: "#7C6FFF" },
    { icon: "👥", label: "Team", href: "/boss/team", color: "#22D9A0" },
    { icon: "₹", label: "Revenue", href: "/boss/reports", color: "#06B6D4" },
    { icon: "🛒", label: "Agents", href: "/boss/marketplace", color: "#F5A623" },
  ];

  return (
    <main className="mobile-page min-h-screen bg-[#070709] px-4 pb-[92px] pt-4 text-white">
      <header className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#7C6FFF]">Boss command center</p>
          <h1 className="mt-1 truncate font-heading text-lg font-extrabold">{business.name}</h1>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7C6FFF]/20 font-heading text-xs font-bold text-[#c9c4ff]">
          {initials(user.name)}
        </div>
      </header>

      <section className="mt-5 overflow-hidden rounded-[24px] border border-white/10 bg-[#111119] p-4 shadow-2xl shadow-black/30">
        <div className="flex items-center gap-4">
          <Ring score={metrics.healthScore} />
          <div className="min-w-0 flex-1">
            <span className="rounded-full bg-[#22D9A0]/10 px-3 py-1 text-[10px] font-bold text-[#22D9A0]">
              NEXA running · {planName}
            </span>
            <h2 className="mt-4 font-heading text-xl font-extrabold">Business health</h2>
            <p className="mt-2 text-xs leading-5 text-zinc-500">NEXA watches leads, team execution, revenue risk, and daily follow-ups.</p>
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-[22px] border border-[#7C6FFF]/30 bg-[#7C6FFF]/10 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#7C6FFF] to-[#22D9A0] font-heading text-sm font-bold">
            N
          </div>
          <div>
            <h2 className="font-heading text-sm font-extrabold">NEXA CEO Brief</h2>
            <p className="text-[10px] text-zinc-500">Updated now</p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-zinc-300">{brief}</p>
        <Link href="/boss/nexa" className="mt-4 inline-flex rounded-xl bg-[#7C6FFF] px-4 py-2 text-xs font-bold text-white">
          Ask NEXA →
        </Link>
      </section>

      <section className="mt-4 grid grid-cols-4 gap-2">
        {actions.map((action) => (
          <Link key={action.href} href={action.href} className="rounded-2xl border border-white/10 bg-[#111119] p-3 text-center">
            <span className="block text-xl" style={{ color: action.color }}>{action.icon}</span>
            <span className="mt-2 block text-[10px] font-bold text-zinc-400">{action.label}</span>
          </Link>
        ))}
      </section>

      <section className="mt-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-heading text-base font-extrabold">Needs attention today</h2>
          <Link href="/boss/leads" className="text-xs font-bold text-[#7C6FFF]">Open pipeline</Link>
        </div>
        <div className="space-y-3">
          {attention.map((item) => (
            <Link key={item.title} href={item.href} className="block rounded-2xl border border-white/10 bg-[#111119] p-4">
              <p className={`font-heading text-sm font-extrabold ${item.tone}`}>{item.title}</p>
              <p className="mt-1 text-xs text-zinc-500">{item.subtitle}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-[22px] border border-white/10 bg-[#111119] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-heading text-sm font-extrabold">Latest movement</h2>
          <Link href="/boss/reports" className="text-[11px] font-bold text-[#7C6FFF]">View all</Link>
        </div>
        <div className="space-y-3">
          {activity.length > 0 ? (
            activity.slice(0, 4).map((item, index) => (
              <Link key={item.id} href="/boss/leads" className="flex items-start gap-3 rounded-xl py-1">
                <span
                  className="mt-1.5 h-2 w-2 rounded-full"
                  style={{ background: ["#7C6FFF", "#22D9A0", "#F5A623", "#06B6D4"][index] }}
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
            <p className="text-xs leading-6 text-zinc-500">No movement yet. NEXA will surface important updates here.</p>
          )}
        </div>
      </section>
    </main>
  );
}

export { MobileBossDashboard as MobileBossHome };
