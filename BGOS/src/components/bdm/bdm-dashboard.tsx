"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Bell,
  CalendarCheck,
  PhoneCall,
  Search,
  Target,
  Trophy,
} from "lucide-react";

import { CallLogHistory, type CallLog } from "@/components/bdm/call-log-history";
import { DailyBrief } from "@/components/bdm/daily-brief";
import { MyPipeline, type BdmLead } from "@/components/bdm/my-pipeline";
import { PerformanceCard, type BdmMetrics } from "@/components/bdm/performance-card";
import { TargetProgress } from "@/components/bdm/target-progress";
import { MetricCard } from "@/components/boss/metric-card";
import { NexaPanel } from "@/components/boss/nexa-panel";
import { LeadDrawer } from "@/components/crm/lead-drawer";
import type { CrmLead, LeadStatus, TeamMember } from "@/components/crm/types";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { useToast } from "@/components/ui/toast";

type BdmUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  defaultPassword: boolean;
  businessId: string;
  businessName: string;
};

type BriefTask = {
  title: string;
  priority: "high" | "medium" | "low";
  leadId: string | null;
  leadName?: string | null;
  type: "follow_up" | "new_lead" | "demo" | "proposal" | "admin";
};

type DailyBriefData = {
  greeting: string;
  tasks: BriefTask[];
  insights: string[];
  createdAt: string;
};

type TargetData = {
  leadsTarget: number;
  wonTarget: number;
  revenueTarget: number;
};

type BdmDashboardProps = {
  user: BdmUser;
  initialBrief: DailyBriefData;
  initialMetrics: BdmMetrics;
  initialLeads: BdmLead[];
  initialCallLogs: CallLog[];
  initialTarget: TargetData;
};

function isFreshBrief(createdAt: string) {
  return Date.now() - new Date(createdAt).getTime() < 60 * 60 * 1000;
}

export function BdmDashboard({
  user,
  initialBrief,
  initialMetrics,
  initialLeads,
  initialCallLogs,
  initialTarget,
}: BdmDashboardProps) {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState(initialMetrics);
  const [leads, setLeads] = useState(initialLeads);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [revealedCards, setRevealedCards] = useState(0);
  const overdueRef = useRef<HTMLDivElement>(null);
  const teamMembers = useMemo<TeamMember[]>(
    () => [{ id: user.id, name: user.name, role: user.role }],
    [user.id, user.name, user.role],
  );

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
      const response = await fetch("/api/bdm/metrics", { cache: "no-store" });
      if (response.ok) {
        setMetrics((await response.json()) as BdmMetrics);
      }
    }, 120_000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    function openLead(event: Event) {
      const customEvent = event as CustomEvent<{ leadId?: string }>;
      if (customEvent.detail?.leadId) {
        setSelectedLeadId(customEvent.detail.leadId);
      }
    }

    window.addEventListener("bdm:open-lead", openLead);
    return () => window.removeEventListener("bdm:open-lead", openLead);
  }, []);

  const filteredLeads = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) return leads;

    return leads.filter((lead) =>
      [lead.name, lead.email, lead.phone, lead.company]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedSearch)),
    );
  }, [leads, search]);

  function upsertLead(lead: CrmLead) {
    setLeads((current) =>
      current.map((item) => (item.id === lead.id ? { ...item, ...lead } : item)),
    );
  }

  async function changeLeadStatus(lead: BdmLead, status: LeadStatus) {
    setLeads((current) =>
      current.map((item) => (item.id === lead.id ? { ...item, status } : item)),
    );

    const response = await fetch(`/api/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      setLeads((current) =>
        current.map((item) =>
          item.id === lead.id ? { ...item, status: lead.status } : item,
        ),
      );
      toast("Could not update lead status", "error");
      return;
    }

    const data = (await response.json()) as { lead: CrmLead };
    upsertLead(data.lead);
  }

  const metricCards = [
    {
      title: "My Leads Total",
      value: metrics.myLeadsTotal,
      subtitle: `${metrics.myLeadsHot} hot leads`,
      icon: <Target className="h-4 w-4" />,
    },
    {
      title: "Follow-ups Due Today",
      value: metrics.followUpsDueToday,
      subtitle:
        metrics.followUpsOverdue > 0
          ? `${metrics.followUpsOverdue} overdue`
          : "No overdue follow-ups",
      icon: <CalendarCheck className="h-4 w-4" />,
      trend:
        metrics.followUpsDueToday > 0
          ? ({ direction: "down" as const, value: metrics.followUpsDueToday })
          : undefined,
    },
    {
      title: "Won This Month",
      value: metrics.wonThisMonth,
      subtitle: `${metrics.wonProgress}% of target`,
      icon: <Trophy className="h-4 w-4" />,
    },
    {
      title: "Calls Today",
      value: metrics.callsToday,
      subtitle: `${metrics.avgResponseTime} hours avg response`,
      icon: <PhoneCall className="h-4 w-4" />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#070709] pl-[240px] text-white md:pr-[320px]">
      <Sidebar role="BDM" userName={user.name} businessName={user.businessName} />
      <Navbar title={`Good morning, ${user.name}`} userName={user.name} />

      <button
        type="button"
        onClick={() => overdueRef.current?.scrollIntoView({ behavior: "smooth" })}
        className="fixed right-[344px] top-3 z-40 hidden items-center gap-2 rounded-xl border border-white/10 bg-[#13131c] px-3 py-2 text-sm font-bold text-zinc-300 shadow-xl transition hover:text-white md:flex"
      >
        <Bell className="h-4 w-4" />
        {metrics.followUpsOverdue > 0 ? (
          <span className="rounded-full bg-[#FF6B6B] px-2 py-0.5 text-xs text-white">
            {metrics.followUpsOverdue} overdue
          </span>
        ) : null}
      </button>

      <main className="pt-[60px]">
        <div className="space-y-8 p-8">
          {user.defaultPassword ? (
            <div className="rounded-2xl border border-[#F5A623]/30 bg-[#F5A623]/10 px-5 py-4 text-sm text-[#F5A623]">
              Your password is still the default. Please change it now for
              security.{" "}
              <Link href="/bdm/settings" className="font-bold underline">
                Change password →
              </Link>
            </div>
          ) : null}

          <DailyBrief
            brief={initialBrief}
            loading={false}
            animateLines={isFreshBrief(initialBrief.createdAt)}
          />

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {metricCards.map((card, index) => (
              <MetricCard
                key={card.title}
                title={card.title}
                value={card.value}
                subtitle={card.subtitle}
                icon={card.icon}
                trend={card.trend}
                loading={revealedCards <= index}
              />
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[65fr_35fr]">
            <div ref={overdueRef} className="scroll-mt-24 rounded-2xl border border-white/10 bg-[#13131c] p-5">
              <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="font-heading text-lg font-bold">My Leads</h2>
                  <Link
                    href="/bdm/leads"
                    className="mt-1 inline-block text-sm font-semibold text-[#7C6FFF]"
                  >
                    View all
                  </Link>
                </div>
                <div className="relative w-full md:max-w-xs">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search leads..."
                    className="w-full rounded-xl border border-white/10 bg-[#0e0e13] py-2.5 pl-10 pr-3 text-sm text-white outline-none focus:border-[#7C6FFF]"
                  />
                </div>
              </div>
              <MyPipeline
                leads={filteredLeads}
                onLeadClick={(lead) => setSelectedLeadId(lead.id)}
                onStatusChange={(lead, status) => void changeLeadStatus(lead, status)}
              />
            </div>

            <div className="space-y-6">
              <TargetProgress target={initialTarget} metrics={metrics} />
              <PerformanceCard metrics={metrics} />
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#13131c] p-5">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold">Recent Calls</h2>
              <Link href="/bdm/calls" className="text-sm font-semibold text-[#7C6FFF]">
                View all
              </Link>
            </div>
            <CallLogHistory callLogs={initialCallLogs.slice(0, 5)} />
          </section>
        </div>
      </main>

      <LeadDrawer
        leadId={selectedLeadId}
        onClose={() => setSelectedLeadId(null)}
        teamMembers={teamMembers}
        onLeadUpdate={upsertLead}
        allowReassign={false}
      />
      <NexaPanel businessId={user.businessId} initialMessage="bdm_morning_context" />
    </div>
  );
}
