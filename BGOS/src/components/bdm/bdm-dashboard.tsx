"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bell,
  CalendarCheck,
  Plus,
  Target,
  Trophy,
} from "lucide-react";

import { BdeOnboarding } from "@/components/bde/bde-onboarding";
import type { CallLog } from "@/components/bdm/call-log-history";
import { DailyBrief } from "@/components/bdm/daily-brief";
import { MobileBDMHome } from "@/components/bdm/mobile/mobile-bdm-home";
import type { BdmLead } from "@/components/bdm/my-pipeline";
import { NewLeadForm } from "@/components/bdm/new-lead-form";
import type { BdmMetrics } from "@/components/bdm/performance-card";
import { MetricCard } from "@/components/boss/metric-card";
import { NexaPanel } from "@/components/boss/nexa-panel";
import { LeadDrawer } from "@/components/crm/lead-drawer";
import type { CrmLead, LeadStatus, TeamMember } from "@/components/crm/types";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { BossWorkAlert } from "@/components/shared/boss-work-alert";
import { useToast } from "@/components/ui/toast";
import { useDevice } from "@/hooks/use-device";

type BdmUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  bdmSubType?: string;
  bdmCode?: string | null;
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

type CompactCommission = {
  total: number;
  target: number;
  progressPct: number;
};

type BdmDashboardProps = {
  user: BdmUser;
  initialBrief: DailyBriefData;
  initialMetrics: BdmMetrics;
  initialLeads: BdmLead[];
  initialCallLogs: CallLog[];
  initialTarget: TargetData;
  initialCommission: CompactCommission;
  showBdeOnboarding: boolean;
};

function isFreshBrief(createdAt: string) {
  return Date.now() - new Date(createdAt).getTime() < 60 * 60 * 1000;
}

function money(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

function CompactEarningsCard({ data }: { data: CompactCommission }) {
  const progress = Math.max(0, Math.min(100, data.progressPct));

  return (
    <section className="rounded-2xl border border-[#22D9A0]/20 bg-[#13131c] p-5 shadow-2xl shadow-black/20">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
            Earnings this month
          </p>
          <p className="mt-3 font-heading text-4xl font-bold text-[#22D9A0]">
            {money(data.total)}
          </p>
        </div>
        <Link
          href="/bdm/commission"
          className="rounded-xl border border-[#22D9A0]/30 px-4 py-2 text-sm font-bold text-[#22D9A0] transition hover:bg-[#22D9A0]/10"
        >
          View full earnings →
        </Link>
      </div>
      <div className="mt-5">
        <div className="mb-2 flex justify-between text-xs font-semibold text-zinc-500">
          <span>Progress to {money(data.target)}</span>
          <span>{Math.round(data.progressPct)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-[#22D9A0]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </section>
  );
}

export function BdmDashboard({
  user,
  initialBrief,
  initialMetrics,
  initialLeads,
  initialTarget,
  initialCommission,
  showBdeOnboarding,
}: BdmDashboardProps) {
  const device = useDevice();
  const { toast } = useToast();
  const [metrics, setMetrics] = useState(initialMetrics);
  const [leads, setLeads] = useState(initialLeads);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [revealedCards, setRevealedCards] = useState(0);
  const [newLeadOpen, setNewLeadOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(showBdeOnboarding);
  const isMf = user.bdmSubType === "MF";
  const dashboardTitle = isMf ? "BGOS Micro Franchise" : "BDM Dashboard";
  const subtypeLabel = isMf ? "MF Owner" : "BDM";
  const displayCode = user.bdmCode ?? (isMf ? "BGOSMF---" : "BDM---");
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

  const priorityLeads = useMemo(
    () =>
      [...leads]
        .filter((lead) => !["WON", "LOST"].includes(lead.status))
        .sort((a, b) => {
          const aFollowUp = a.followUpDate ? new Date(a.followUpDate).getTime() : Number.MAX_SAFE_INTEGER;
          const bFollowUp = b.followUpDate ? new Date(b.followUpDate).getTime() : Number.MAX_SAFE_INTEGER;
          if (aFollowUp !== bFollowUp) return aFollowUp - bFollowUp;
          return b.score - a.score;
        })
        .slice(0, 3),
    [leads],
  );

  function upsertLead(lead: CrmLead | BdmLead) {
    setLeads((current) =>
      current.some((item) => item.id === lead.id)
        ? current.map((item) => (item.id === lead.id ? { ...item, ...lead } : item))
        : [lead as BdmLead, ...current],
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
    if (status === "WON") {
      window.dispatchEvent(new Event("bgos:commission-created"));
    }
  }

  const metricCards = [
    {
      title: "Active Leads",
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
      title: "Earnings",
      value: money(initialCommission.total),
      subtitle: `${Math.round(initialCommission.progressPct)}% of ${money(initialCommission.target)}`,
      icon: <Trophy className="h-4 w-4" />,
    },
  ];

  if (device === "mobile") {
    return (
      <MobileBDMHome
        user={user}
        metrics={metrics}
        brief={initialBrief}
        leads={leads}
        target={initialTarget}
        commission={initialCommission}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#070709] md:pl-[240px] text-white md:pr-[320px]">
      <Sidebar role="BDM" userName={user.name} businessName={user.businessName} />
      <Navbar title={dashboardTitle} userName={user.name} />
      {showOnboarding ? (
        <BdeOnboarding
          user={{ name: user.name, role: user.role }}
          onComplete={() => setShowOnboarding(false)}
        />
      ) : null}

      <button
        type="button"
        onClick={() => document.getElementById("bdm-priority-leads")?.scrollIntoView({ behavior: "smooth" })}
        className="fixed right-[344px] top-3 z-40 hidden items-center gap-2 rounded-xl border border-white/10 bg-[#13131c] px-3 py-2 text-sm font-bold text-zinc-300 shadow-xl transition hover:text-white md:flex"
      >
        <Bell className="h-4 w-4" />
        {metrics.followUpsOverdue > 0 ? (
          <span className="rounded-full bg-[#FF6B6B] px-2 py-0.5 text-xs text-white">
            {metrics.followUpsOverdue} overdue
          </span>
        ) : null}
      </button>

      <button
        type="button"
        aria-label="Create new lead"
        onClick={() => setNewLeadOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#2ECC8A] text-[#0A0F0D] shadow-[0_4px_20px_rgba(46,204,138,0.3)] transition hover:scale-105"
      >
        <Plus className="h-6 w-6" />
      </button>

      <main className="pt-[60px]">
        <div className="space-y-8 p-8">
          <BossWorkAlert />
          {user.defaultPassword ? (
            <div className="rounded-2xl border border-[#F5A623]/30 bg-[#F5A623]/10 px-5 py-4 text-sm text-[#F5A623]">
              Your password is still the default. Please change it now for
              security.{" "}
              <Link href="/bdm/settings" className="font-bold underline">
                Change password →
              </Link>
            </div>
          ) : null}

          <section className="rounded-2xl border border-[var(--accent-border,rgba(124,111,255,0.3))] bg-[var(--accent-muted,rgba(124,111,255,0.15))] p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
                  {subtypeLabel} ID {displayCode}
                </p>
                <h1 className="mt-2 font-heading text-2xl font-bold text-white">
                  {dashboardTitle}
                </h1>
                <p className="mt-1 text-sm text-zinc-400">
                  Good morning, {user.name}. Your leads, commissions, and onboarding flow are ready.
                </p>
              </div>
              <span className="inline-flex w-fit rounded-full border border-[var(--accent-border,rgba(124,111,255,0.3))] bg-black/20 px-3 py-1 text-xs font-bold text-[var(--accent,#7C6FFF)]">
                {subtypeLabel}
              </span>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <CompactEarningsCard data={initialCommission} />
            <section className="rounded-2xl border border-white/10 bg-[#13131c] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
                Next milestone
              </p>
              <h2 className="mt-3 font-heading text-2xl font-bold text-white">
                {metrics.wonTarget > 0 ? `${metrics.wonProgress}% of won target` : "Build your first target streak"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                {metrics.followUpsDueToday > 0
                  ? `Start with ${metrics.followUpsDueToday} follow-ups due today.`
                  : "No urgent follow-ups. Use the time to create new conversations."}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link href="/bdm/leads" className="rounded-xl bg-[#7C6FFF] px-4 py-2 text-sm font-bold text-white">
                  Open leads
                </Link>
                <Link href="/bdm/commission" className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-zinc-300">
                  Earnings
                </Link>
              </div>
            </section>
          </section>

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

          <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <DailyBrief
              brief={initialBrief}
              loading={false}
              animateLines={isFreshBrief(initialBrief.createdAt)}
            />

            <section id="bdm-priority-leads" className="scroll-mt-24 rounded-2xl border border-white/10 bg-[#13131c] p-5">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-heading text-lg font-bold">Hot leads today</h2>
                  <p className="mt-1 text-sm text-zinc-500">Only the next 3 actions for this morning.</p>
                </div>
                <Link href="/bdm/leads" className="text-sm font-semibold text-[#7C6FFF]">
                  View all
                </Link>
              </div>
              <div className="space-y-3">
                {priorityLeads.length > 0 ? priorityLeads.map((lead) => (
                  <article key={lead.id} className="rounded-xl border border-white/10 bg-[#0e0e13] p-4">
                    <button type="button" onClick={() => setSelectedLeadId(lead.id)} className="w-full text-left">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="truncate font-heading text-sm font-bold text-white">{lead.company ?? lead.name}</h3>
                          <p className="mt-1 truncate text-xs text-zinc-500">{lead.name} · Score {lead.score}</p>
                        </div>
                        <span className="rounded-full bg-[#7C6FFF]/15 px-2 py-1 text-[10px] font-bold text-[#c8c2ff]">{lead.status}</span>
                      </div>
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-400">{lead.notes ?? lead.scoreReason ?? "No note yet."}</p>
                    </button>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button type="button" onClick={() => setSelectedLeadId(lead.id)} className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold text-white">
                        Open
                      </button>
                      {lead.status !== "WON" && lead.status !== "LOST" ? (
                        <button type="button" onClick={() => void changeLeadStatus(lead, lead.status === "NEW" ? "CONTACTED" : lead.status)} className="rounded-lg border border-[#22D9A0]/25 px-3 py-1.5 text-xs font-bold text-[#22D9A0]">
                          Mark contacted
                        </button>
                      ) : null}
                    </div>
                  </article>
                )) : (
                  <p className="rounded-xl border border-white/10 bg-[#0e0e13] p-5 text-sm text-zinc-500">
                    No active priority leads right now.
                  </p>
                )}
              </div>
            </section>
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
      {newLeadOpen ? (
        <NewLeadForm
          currentUser={{ id: user.id, name: user.name }}
          onSuccess={upsertLead}
          onClose={() => setNewLeadOpen(false)}
        />
      ) : null}
    </div>
  );
}
