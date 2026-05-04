"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Bug, GitPullRequest, ListTodo } from "lucide-react";

import { DailyBrief } from "@/components/bdm/daily-brief";
import { MetricCard } from "@/components/boss/metric-card";
import { NexaPanel } from "@/components/boss/nexa-panel";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { BossWorkAlert } from "@/components/shared/boss-work-alert";
import { MobileSDEDashboard } from "@/components/sde/mobile/mobile-sde-home";
import { TaskDrawer } from "@/components/sde/task-drawer";
import type {
  IntegrationHealthItem,
  SdeBug,
  SdeEscalation,
  SdeSprint,
  SdeTask,
  SdeUser,
} from "@/components/sde/types";
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

function priorityTone(priority: SdeTask["priority"]) {
  if (priority === "URGENT") return "bg-[#FF6B6B]/15 text-[#FF6B6B]";
  if (priority === "HIGH") return "bg-[#F5A623]/15 text-[#F5A623]";
  return "bg-[#22D9A0]/15 text-[#22D9A0]";
}

export function SdeDashboard({
  user,
  initialMetrics,
  initialTasks,
  initialBugs,
  activeSprint,
  initialSprints = [],
  initialEscalations,
  teamMembers = [],
}: Props) {
  const device = useDevice();
  const [metrics, setMetrics] = useState(initialMetrics);
  const [tasks, setTasks] = useState(initialTasks);
  const [bugs] = useState(initialBugs);
  const [sprints] = useState(initialSprints);
  const [escalations, setEscalations] = useState(initialEscalations);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [brief, setBrief] = useState<{ greeting: string; tasks: []; insights: string[] } | null>(null);
  const [revealed, setRevealed] = useState(0);

  const criticalCount = bugs.filter(
    (bug) => bug.severity === "CRITICAL" && !["RESOLVED", "CLOSED"].includes(bug.status),
  ).length;
  const urgentCount = escalations.filter(
    (item) => item.priority === "URGENT" && !["RESOLVED", "CLOSED"].includes(item.status),
  ).length;
  const urgentTasks = tasks
    .filter((task) => task.status !== "DONE")
    .sort((a, b) => {
      const order = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 } as Record<string, number>;
      return (order[a.priority] ?? 9) - (order[b.priority] ?? 9);
    })
    .slice(0, 3);

  useEffect(() => {
    void fetch("/api/sde/daily-brief").then(async (response) => {
      if (response.ok) setBrief(((await response.json()) as { brief: typeof brief }).brief);
    });

    const timers = [0, 1, 2, 3].map((index) =>
      window.setTimeout(() => setRevealed(index + 1), 500 + index * 100),
    );
    return () => timers.forEach(window.clearTimeout);
  }, []);

  useEffect(() => {
    const metricsInterval = window.setInterval(async () => {
      const response = await fetch("/api/sde/metrics", { cache: "no-store" });
      if (response.ok) setMetrics((await response.json()) as Metrics);
    }, 90_000);
    const escalationInterval = window.setInterval(async () => {
      const response = await fetch("/api/sde/escalations", { cache: "no-store" });
      if (response.ok) {
        setEscalations(((await response.json()) as { escalations: SdeEscalation[] }).escalations);
      }
    }, 60_000);

    return () => {
      window.clearInterval(metricsInterval);
      window.clearInterval(escalationInterval);
    };
  }, []);

  function upsertTask(task: SdeTask) {
    setTasks((current) =>
      current.some((item) => item.id === task.id)
        ? current.map((item) => (item.id === task.id ? { ...item, ...task } : item))
        : [task, ...current],
    );
  }

  const metricCards = [
    { title: "Open Tasks", value: metrics.openTasks, icon: <ListTodo className="h-4 w-4" /> },
    { title: "Active Builds", value: metrics.inProgressTasks, icon: <GitPullRequest className="h-4 w-4" /> },
    { title: "Critical Bugs", value: metrics.criticalBugs, icon: <Bug className="h-4 w-4" /> },
    { title: "Escalations", value: metrics.openEscalations, icon: <AlertTriangle className="h-4 w-4" /> },
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
    <div className="min-h-screen bg-[#070709] text-white md:pl-[240px] md:pr-[320px]">
      <Sidebar role="SDE" userName={user.name} businessName={user.businessName} />
      <Navbar title="SDE Dashboard" userName={user.name} />
      {criticalCount + urgentCount > 0 ? (
        <button
          onClick={() => document.getElementById("sde-urgent-work")?.scrollIntoView({ behavior: "smooth" })}
          className="fixed right-[344px] top-3 z-40 rounded-xl bg-[#FF6B6B] px-3 py-2 text-sm font-bold text-white animate-pulse"
        >
          {criticalCount + urgentCount} urgent
        </button>
      ) : null}

      <main className="pt-[60px]">
        <div className="space-y-8 p-8">
          <BossWorkAlert />
          {user.defaultPassword ? (
            <div className="rounded-2xl border border-[#F5A623]/30 bg-[#F5A623]/10 px-5 py-4 text-sm text-[#F5A623]">
              Your password is still the default. Please change it now for security.{" "}
              <Link href="/sde/settings" className="font-bold underline">
                Change password →
              </Link>
            </div>
          ) : null}

          <section className="rounded-2xl border border-[#7C6FFF]/25 bg-[#7C6FFF]/10 p-5">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a89fff]">
                  Delivery focus
                </p>
                <h1 className="mt-2 font-heading text-2xl font-bold text-white">
                  {metrics.activeSprintName ?? activeSprint?.name ?? "SDE Dashboard"}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                  {metrics.activeSprintDaysLeft > 0
                    ? `${metrics.activeSprintDaysLeft} days left in sprint. Clear urgent tasks and critical bugs first.`
                    : "No active sprint deadline. Keep workspace delivery steady and unblock the team."}
                </p>
              </div>
              <div className="min-w-[220px] rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Sprint progress</span>
                  <span className="font-bold text-white">{metrics.activeSprintProgress}%</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-[#7C6FFF]"
                    style={{ width: `${Math.min(100, metrics.activeSprintProgress)}%` }}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {metricCards.map((card, index) => (
              <MetricCard
                key={card.title}
                title={card.title}
                value={card.value}
                icon={card.icon}
                loading={revealed <= index}
              />
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            {brief ? (
              <DailyBrief brief={brief} loading={false} />
            ) : (
              <section className="rounded-2xl border border-white/10 bg-[#13131c] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#7C6FFF] to-[#22D9A0] font-heading text-sm font-bold">
                    N
                  </div>
                  <div>
                    <h2 className="font-heading text-sm font-bold">NEXA dev brief</h2>
                    <p className="text-xs text-zinc-500">Preparing today&apos;s context</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-zinc-400">
                  Your daily engineering brief will appear here when NEXA has fresh context.
                </p>
              </section>
            )}

            <section id="sde-urgent-work" className="scroll-mt-24 rounded-2xl border border-white/10 bg-[#13131c] p-5">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-heading text-lg font-bold">Urgent work today</h2>
                  <p className="mt-1 text-sm text-zinc-500">The next 3 items that need SDE attention.</p>
                </div>
                <Link href="/sde/tasks" className="text-sm font-semibold text-[#7C6FFF]">
                  View all
                </Link>
              </div>
              <div className="space-y-3">
                {urgentTasks.length > 0 ? (
                  urgentTasks.map((task) => (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => setSelectedTaskId(task.id)}
                      className="w-full rounded-xl border border-white/10 bg-[#0e0e13] p-4 text-left transition hover:border-[#7C6FFF]/40"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="line-clamp-1 font-heading text-sm font-bold text-white">{task.title}</h3>
                          <p className="mt-1 text-xs text-zinc-500">
                            {task.sprint?.name ?? metrics.activeSprintName ?? "No sprint"}
                          </p>
                        </div>
                        <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${priorityTone(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-400">
                        {task.description || "No description provided."}
                      </p>
                    </button>
                  ))
                ) : (
                  <p className="rounded-xl border border-white/10 bg-[#0e0e13] p-5 text-sm text-zinc-500">
                    No urgent tasks right now.
                  </p>
                )}
              </div>
            </section>
          </section>
        </div>
      </main>

      <TaskDrawer
        taskId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        teamMembers={teamMembers}
        tasks={tasks}
        sprints={sprints}
        onTaskUpdate={upsertTask}
      />
      <NexaPanel businessId={user.businessId} initialMessage="sde_morning_context" />
    </div>
  );
}
