"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Bug, CheckCircle2, GitPullRequest, ListTodo } from "lucide-react";

import { DailyBrief } from "@/components/bdm/daily-brief";
import { MetricCard } from "@/components/boss/metric-card";
import { NexaPanel } from "@/components/boss/nexa-panel";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileSDEDashboard } from "@/components/sde/mobile/mobile-sde-home";
import { BugTracker } from "@/components/sde/bug-tracker";
import { EscalationFeed } from "@/components/sde/escalation-feed";
import { IntegrationHealth } from "@/components/sde/integration-health";
import { SprintPanel } from "@/components/sde/sprint-panel";
import { TaskBoard } from "@/components/sde/task-board";
import { TaskDrawer } from "@/components/sde/task-drawer";
import type { IntegrationHealthItem, SdeBug, SdeEscalation, SdeSprint, SdeTask, SdeUser } from "@/components/sde/types";
import { useDevice } from "@/hooks/use-device";

type Metrics = {
  openTasks: number;
  inProgressTasks: number;
  completedThisWeek: number;
  openBugs: number;
  criticalBugs: number;
  openEscalations: number;
  activeSprintName: string | null;
  activeSprintProgress: number;
  activeSprintDaysLeft: number;
  deploymentsThisMonth: number;
};

type Props = {
  user: SdeUser & { businessId: string; businessName: string; defaultPassword: boolean };
  initialMetrics: Metrics;
  initialTasks: SdeTask[];
  initialBugs: SdeBug[];
  activeSprint: SdeSprint | null;
  initialSprints?: SdeSprint[];
  initialEscalations: SdeEscalation[];
  initialIntegrations: IntegrationHealthItem[];
  teamMembers?: SdeUser[];
};

export function SdeDashboard({ user, initialMetrics, initialTasks, initialBugs, activeSprint, initialSprints = [], initialEscalations, initialIntegrations, teamMembers = [] }: Props) {
  const device = useDevice();
  const [metrics, setMetrics] = useState(initialMetrics);
  const [tasks, setTasks] = useState(initialTasks);
  const [bugs, setBugs] = useState(initialBugs);
  const [sprints, setSprints] = useState(initialSprints);
  const [sprint, setSprint] = useState(activeSprint);
  const [escalations, setEscalations] = useState(initialEscalations);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [brief, setBrief] = useState<{ greeting: string; tasks: []; insights: string[] } | null>(null);
  const [briefOpen, setBriefOpen] = useState(false);
  const [revealed, setRevealed] = useState(0);
  const criticalCount = bugs.filter((bug) => bug.severity === "CRITICAL" && !["RESOLVED", "CLOSED"].includes(bug.status)).length;
  const urgentCount = escalations.filter((item) => item.priority === "URGENT" && !["RESOLVED", "CLOSED"].includes(item.status)).length;

  useEffect(() => {
    void fetch("/api/sde/daily-brief").then(async (response) => {
      if (response.ok) setBrief(((await response.json()) as { brief: typeof brief }).brief);
    });
    const timers = [0, 1, 2, 3, 4].map((index) => window.setTimeout(() => setRevealed(index + 1), 500 + index * 100));
    return () => timers.forEach(window.clearTimeout);
  }, []);

  useEffect(() => {
    const metricsInterval = window.setInterval(async () => {
      const response = await fetch("/api/sde/metrics", { cache: "no-store" });
      if (response.ok) setMetrics((await response.json()) as Metrics);
    }, 90000);
    const escalationInterval = window.setInterval(async () => {
      const response = await fetch("/api/sde/escalations", { cache: "no-store" });
      if (response.ok) setEscalations(((await response.json()) as { escalations: SdeEscalation[] }).escalations);
    }, 60000);
    return () => { window.clearInterval(metricsInterval); window.clearInterval(escalationInterval); };
  }, []);

  function upsertTask(task: SdeTask) {
    setTasks((current) => current.some((item) => item.id === task.id) ? current.map((item) => item.id === task.id ? { ...item, ...task } : item) : [task, ...current]);
  }
  function upsertBug(bug: SdeBug) {
    setBugs((current) => current.some((item) => item.id === bug.id) ? current.map((item) => item.id === bug.id ? { ...item, ...bug } : item) : [bug, ...current]);
  }
  function upsertEscalation(escalation: SdeEscalation) {
    setEscalations((current) => current.some((item) => item.id === escalation.id) ? current.map((item) => item.id === escalation.id ? escalation : item) : [escalation, ...current]);
  }

  const metricCards = [
    { title: "Open Tasks", value: metrics.openTasks, icon: <ListTodo className="h-4 w-4" /> },
    { title: "In Progress", value: metrics.inProgressTasks, icon: <GitPullRequest className="h-4 w-4" /> },
    { title: "Critical Bugs", value: metrics.criticalBugs, icon: <Bug className="h-4 w-4" /> },
    { title: "Open Escalations", value: metrics.openEscalations, icon: <AlertTriangle className="h-4 w-4" /> },
    { title: "Sprint Progress", value: `${metrics.activeSprintProgress}%`, icon: <CheckCircle2 className="h-4 w-4" /> },
  ] as const;

  if (device === "mobile") {
    return (
      <MobileSDEDashboard
        user={user}
        metrics={metrics}
        tasks={tasks}
        bugs={bugs}
        escalations={escalations}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#070709] pl-[240px] text-white md:pr-[320px]">
      <Sidebar role="SDE" userName={user.name} businessName={user.businessName} />
      <Navbar title="SDE Dashboard" userName={user.name} />
      {(criticalCount + urgentCount) > 0 ? <button onClick={() => document.getElementById("sde-issues")?.scrollIntoView({ behavior: "smooth" })} className="fixed right-[344px] top-3 z-40 rounded-xl bg-[#FF6B6B] px-3 py-2 text-sm font-bold text-white animate-pulse">{criticalCount + urgentCount} urgent</button> : null}
      <main className="pt-[60px]"><div className="space-y-8 p-8">
        {user.defaultPassword ? <div className="rounded-2xl border border-[#F5A623]/30 bg-[#F5A623]/10 px-5 py-4 text-sm text-[#F5A623]">Your password is still the default. Please change it now for security. <Link href="/sde/settings" className="font-bold underline">Change password →</Link></div> : null}
        {brief ? <section className="rounded-2xl border border-white/10 bg-[#13131c] p-4"><button onClick={() => setBriefOpen((v) => !v)} className="text-sm font-bold text-[#7C6FFF]">{briefOpen ? "Hide today's brief" : "See today's brief"}</button>{briefOpen ? <div className="mt-4"><DailyBrief brief={brief} loading={false} /></div> : null}</section> : null}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">{metricCards.map((card, index) => <MetricCard key={card.title} title={card.title} value={card.value} icon={card.icon} loading={revealed <= index} />)}</section>
        <section className="rounded-2xl border border-white/10 bg-[#13131c] p-5"><h2 className="mb-4 font-heading text-lg font-bold">Task Board</h2><TaskBoard tasks={tasks} sprints={sprints} onTaskUpdate={upsertTask} onTaskCreate={upsertTask} onTaskClick={(task) => setSelectedTaskId(task.id)} /></section>
        <section id="sde-issues" className="grid gap-6 xl:grid-cols-[55fr_45fr]"><div><h2 className="mb-4 font-heading text-lg font-bold">Bug Tracker</h2><BugTracker bugs={bugs} teamMembers={teamMembers} onBugUpdate={upsertBug} onBugCreate={upsertBug} /></div><SprintPanel sprints={sprints} activeSprint={sprint} onSprintCreate={(next) => setSprints([next, ...sprints])} onSprintUpdate={(next) => { setSprint(next.status === "ACTIVE" ? next : null); setSprints(sprints.map((item) => item.id === next.id ? next : item)); }} /></section>
        <section className="grid gap-6 xl:grid-cols-2"><IntegrationHealth integrations={initialIntegrations} /><EscalationFeed escalations={escalations} currentUserId={user.id} onEscalationCreate={upsertEscalation} onEscalationResolve={upsertEscalation} /></section>
      </div></main>
      <TaskDrawer taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} teamMembers={teamMembers} tasks={tasks} sprints={sprints} onTaskUpdate={upsertTask} />
      <NexaPanel businessId={user.businessId} initialMessage="sde_morning_context" />
    </div>
  );
}
