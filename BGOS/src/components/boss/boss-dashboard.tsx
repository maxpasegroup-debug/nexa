"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Coins,
  Flame,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";

import { ActivityFeed, type Activity } from "@/components/boss/activity-feed";
import { AnalyticsCharts } from "@/components/boss/analytics-charts";
import { BDEPerformanceTable } from "@/components/boss/bde-performance-table";
import { HealthScore } from "@/components/boss/health-score";
import { InviteTeam } from "@/components/boss/invite-team";
import { MetricCard } from "@/components/boss/metric-card";
import { NexaInsightsPanel, type NexaInsight } from "@/components/boss/nexa-insights-panel";
import { NexaPanel } from "@/components/boss/nexa-panel";
import { TeamPerformance } from "@/components/boss/team-performance";
import { SystemHealth } from "@/components/boss/system-health";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";

type DashboardUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type DashboardBusiness = {
  id: string;
  name: string;
  healthScore: number;
};

type DashboardMetrics = {
  healthScore: number;
  totalLeads: number;
  hotLeads: number;
  wonThisMonth: number;
  teamCount: number;
  revenueThisMonth: number;
  leadsThisWeek: number;
  conversionRate: number;
};

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

type BossDashboardProps = {
  user: DashboardUser;
  business: DashboardBusiness;
  initialMetrics: DashboardMetrics;
  initialActivity: Activity[];
  initialInsights: NexaInsight[];
};

function todayLabel() {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

export function BossDashboard({
  user,
  business,
  initialMetrics,
  initialActivity,
  initialInsights,
}: BossDashboardProps) {
  const [metrics, setMetrics] = useState(initialMetrics);
  const [activity, setActivity] = useState(initialActivity);
  const [insights, setInsights] = useState(initialInsights);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [activityLoading, setActivityLoading] = useState(false);
  const [revealedCards, setRevealedCards] = useState(0);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamLoading, setTeamLoading] = useState(true);
  const date = useMemo(() => todayLabel(), []);

  useEffect(() => {
    const timers = [0, 1, 2, 3].map((index) =>
      window.setTimeout(
        () => setRevealedCards((current) => Math.max(current, index + 1)),
        500 + index * 100,
      ),
    );

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  useEffect(() => {
    const interval = window.setInterval(async () => {
      const response = await fetch("/api/dashboard/metrics", {
        cache: "no-store",
      });

      if (response.ok) {
        setMetrics((await response.json()) as DashboardMetrics);
      }
    }, 60_000);

    return () => window.clearInterval(interval);
  }, []);

  async function refreshActivity() {
    setActivityLoading(true);
    const response = await fetch("/api/dashboard/activity", {
      cache: "no-store",
    });
    setActivityLoading(false);

    if (response.ok) {
      const data = (await response.json()) as { activity: Activity[] };
      setActivity(data.activity);
    }
  }

  async function refreshInsights() {
    setInsightsLoading(true);
    await fetch("/api/dashboard/nexa-insights", { method: "POST" });
    const response = await fetch("/api/dashboard/nexa-insights", {
      cache: "no-store",
    });
    setInsightsLoading(false);

    if (response.ok) {
      const data = (await response.json()) as { insights: NexaInsight[] };
      setInsights(data.insights);
    }
  }

  async function loadTeamMembers() {
    setTeamLoading(true);
    const response = await fetch("/api/team", {
      cache: "no-store",
    });
    setTeamLoading(false);

    if (response.ok) {
      const data = (await response.json()) as { users: TeamMember[] };
      setTeamMembers(data.users);
    }
  }

  useEffect(() => {
    void loadTeamMembers();
  }, []);

  const metricCards = [
    {
      title: "Total Leads",
      value: metrics.totalLeads,
      subtitle: `${metrics.leadsThisWeek} new this week`,
      icon: <TrendingUp className="h-4 w-4" />,
      trend: { direction: "up" as const, value: metrics.leadsThisWeek },
      href: "/boss/leads",
    },
    {
      title: "Hot Leads",
      value: metrics.hotLeads,
      subtitle: "Score above 70",
      icon: <Flame className="h-4 w-4" />,
      href: "/boss/leads?filter=hot",
    },
    {
      title: "Team Members",
      value: metrics.teamCount,
      subtitle: business.name,
      icon: <Users className="h-4 w-4" />,
      href: "/boss/team",
    },
    {
      title: "Won This Month",
      value: metrics.wonThisMonth,
      subtitle: `${metrics.conversionRate}% conversion`,
      icon: <Trophy className="h-4 w-4" />,
      trend: { direction: "up" as const, value: metrics.conversionRate },
    },
  ];

  return (
    <div className="min-h-screen bg-[#070709] pl-[240px] text-white md:pr-[320px]">
      <Sidebar
        role={user.role}
        userName={user.name}
        businessName={business.name}
      />
      <Navbar title={`Good morning, ${user.name}`} userName={user.name} role={user.role} />

      <main className="pt-[60px]">
        <div className="space-y-8 p-8">
          <section>
            <h2 className="font-heading text-2xl font-bold tracking-normal">
              Dashboard
            </h2>
            <p className="mt-1 text-sm text-zinc-500">{date}</p>
          </section>

          <section className="grid gap-4 xl:grid-cols-5">
            <div className="rounded-2xl border border-white/10 bg-[#13131c] p-5">
              <HealthScore score={metrics.healthScore} />
            </div>
            {metricCards.map((card, index) => (
              card.href ? (
                <Link
                  key={card.title}
                  href={card.href}
                  className="block rounded-xl transition hover:-translate-y-0.5 hover:ring-1 hover:ring-[#7C6FFF]/40"
                >
                  <MetricCard
                    title={card.title}
                    value={card.value}
                    subtitle={card.subtitle}
                    icon={card.icon}
                    trend={card.trend}
                    loading={revealedCards <= index}
                  />
                </Link>
              ) : (
                <MetricCard
                  key={card.title}
                  title={card.title}
                  value={card.value}
                  subtitle={card.subtitle}
                  icon={card.icon}
                  trend={card.trend}
                  loading={revealedCards <= index}
                />
              )
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[3fr_2fr]">
            <div className="rounded-2xl border border-white/10 bg-[#13131c] p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <h2 className="font-heading text-lg font-bold">
                  Recent Activity
                </h2>
                <button
                  type="button"
                  onClick={() => void refreshActivity()}
                  className="text-sm font-semibold text-[#7C6FFF] transition hover:text-[#9f97ff]"
                >
                  {activityLoading ? "Refreshing..." : "Refresh"}
                </button>
              </div>
              <ActivityFeed activities={activity} />
            </div>
            <div id="nexa-insights-panel" className="scroll-mt-24">
              <NexaInsightsPanel
                insights={insights}
                onRefresh={() => void refreshInsights()}
                loading={insightsLoading}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#13131c] p-6">
            <div className="mb-5">
              <h2 className="font-heading text-base font-bold">
                Team Performance
              </h2>
            </div>
            <TeamPerformance />
          </section>

          <section>
            <div className="mb-4 flex items-center gap-2">
              <Coins className="h-5 w-5 text-[#F5A623]" />
              <h2 className="font-heading text-base font-bold">
                BDE Commission Tracker
              </h2>
            </div>
            <BDEPerformanceTable />
          </section>

          <AnalyticsCharts businessId={business.id} />

          <SystemHealth />

          <section id="team" className="rounded-2xl border border-white/10 bg-[#13131c] p-6">
            <div className="mb-5">
              <h2 className="font-heading text-lg font-bold">Your team</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Invite teammates and track who has joined your HQ.
              </p>
            </div>
            <InviteTeam showMembers={false} onInviteSent={loadTeamMembers} />
            <div className="mt-5 rounded-xl border border-white/10 bg-[#0e0e13] p-4">
              {teamLoading ? (
                <p className="text-sm text-zinc-400">Loading team...</p>
              ) : teamMembers.length > 0 ? (
                <div className="grid gap-3">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#13131c] px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">
                          {member.name}
                        </p>
                        <p className="mt-1 truncate text-xs text-zinc-500">
                          {member.email}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span className="rounded-full border border-[#7C6FFF]/30 bg-[#7C6FFF]/10 px-3 py-1 text-xs font-semibold text-[#c6c1ff]">
                          {member.role}
                        </span>
                        <span className="text-xs text-zinc-500">
                          Joined{" "}
                          {new Date(member.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-400">
                  No team members have joined yet.
                </p>
              )}
            </div>
          </section>
        </div>
      </main>

      <NexaPanel businessId={business.id} />
    </div>
  );
}
