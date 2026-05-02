"use client";

import Link from "next/link";

import type { InternalBusiness, InternalInsight, InternalTeamMember } from "@/components/internal/bgos-internal-dashboard";

type MobileInternalMetrics = {
  totalCustomers: number;
  totalUsers: number;
  totalLeads: number;
  newThisMonth: number;
  marketplaceLeadsToday: number;
};

type MobileInternalDashboardProps = {
  metrics: MobileInternalMetrics;
  businesses: InternalBusiness[];
  teamMembers: InternalTeamMember[];
  insights: InternalInsight[];
  onboardingCounts?: Array<{ status: string; count: number }>;
};

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" }).format(new Date(value));
}

function healthColor(score: number) {
  if (score >= 75) return "#22D9A0";
  if (score >= 45) return "#F5A623";
  return "#FF6B6B";
}

export function MobileInternalDashboard({
  metrics,
  businesses,
  teamMembers,
  insights,
  onboardingCounts = [],
}: MobileInternalDashboardProps) {
  const statusCounts = onboardingCounts.length > 0
    ? onboardingCounts
    : [
        { status: "NEW", count: metrics.marketplaceLeadsToday },
        { status: "BDM_ASSIGNED", count: 0 },
        { status: "SDE_ASSIGNED", count: 0 },
        { status: "BUILDING", count: 0 },
        { status: "DELIVERED", count: 0 },
        { status: "CONVERTED", count: 0 },
      ];

  const cards = [
    { label: "Total customers", value: metrics.totalCustomers, color: "#7C6FFF" },
    { label: "Active trials", value: metrics.newThisMonth, color: "#F5A623" },
    { label: "MRR this month", value: "₹0", color: "#22D9A0" },
    { label: "New leads today", value: metrics.marketplaceLeadsToday, color: "#22D9A0" },
  ];

  return (
    <main className="mobile-page min-h-screen bg-[var(--bg)] px-4 pt-4 text-[var(--text)]">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-lg font-extrabold">BGOS Control Room</h1>
          <div className="mt-1 flex items-center gap-2 text-[10px] font-semibold text-[#22D9A0]">
            <span className="h-2 w-2 rounded-full bg-[#22D9A0]" />
            NEXA running
          </div>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#7C6FFF]/20 font-heading text-xs font-bold text-[#c9c4ff]">
          BG
        </div>
      </header>

      <section className="mt-5 grid grid-cols-2 gap-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-[14px] border border-white/10 bg-[var(--card)] p-3">
            <p className="font-heading text-[22px] font-extrabold" style={{ color: card.color }}>{card.value}</p>
            <p className="mt-1 text-[10px] text-[var(--muted)]">{card.label}</p>
          </div>
        ))}
      </section>

      <section className="mt-4">
        <h2 className="font-heading text-sm font-bold">Onboarding pipeline</h2>
        <div className="mt-3 flex gap-3 overflow-x-auto scroll-x-hidden snap-x">
          {statusCounts.map((item) => (
            <Link
              key={item.status}
              href="/internal/onboarding"
              className="snap-start min-w-[130px] rounded-[16px] border border-white/10 bg-[var(--card)] p-4"
            >
              <p className="font-heading text-2xl font-extrabold text-[#7C6FFF]">{item.count}</p>
              <p className="mt-2 text-[10px] font-semibold text-zinc-500">{item.status.replace(/_/g, " ")}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-[18px] border border-white/10 bg-[var(--card)] p-4">
        <h2 className="font-heading text-sm font-bold">Recent customers</h2>
        <div className="mt-3 space-y-3">
          {businesses.slice(0, 5).map((business) => (
            <div key={business.id} className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{business.name}</p>
                <p className="mt-1 text-[10px] text-zinc-600">Joined {dateLabel(business.joinedAt)}</p>
              </div>
              <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] font-bold text-zinc-300">{business.plan}</span>
              <span className="font-heading text-sm font-bold" style={{ color: healthColor(business.healthScore) }}>{business.healthScore}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-[18px] border border-white/10 bg-[var(--card)] p-4">
        <h2 className="font-heading text-sm font-bold">Team summary</h2>
        <div className="mt-3 space-y-3">
          {teamMembers.slice(0, 5).map((member) => (
            <div key={member.id} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{member.name}</p>
                <p className="text-[10px] text-zinc-600">{member.role}</p>
              </div>
              <span className="rounded-full bg-[#22D9A0]/10 px-2 py-1 text-[10px] font-bold text-[#22D9A0]">
                active
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-[18px] border border-[#7C6FFF]/35 bg-[#7C6FFF]/10 p-4">
        <h2 className="font-heading text-sm font-bold">NEXA insights</h2>
        <div className="mt-3 space-y-2">
          {insights.slice(0, 3).map((insight) => (
            <p key={insight.id} className="text-xs leading-5 text-zinc-300">▸ {insight.message}</p>
          ))}
          {insights.length === 0 ? <p className="text-xs text-zinc-500">No unread insights right now.</p> : null}
        </div>
      </section>
    </main>
  );
}
