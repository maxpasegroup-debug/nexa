"use client";

import { useState } from "react";

import { MobileSheet } from "@/components/mobile/mobile-sheet";
import type { SdeBug, SdeEscalation, SdeTask } from "@/components/sde/types";

type SDEMetrics = {
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

type MobileSDEDashboardProps = {
  user: { name: string };
  metrics: SDEMetrics;
  tasks: SdeTask[];
  bugs: SdeBug[];
  escalations: SdeEscalation[];
};

function priorityColor(priority: string) {
  if (priority === "URGENT") return "#FF6B6B";
  if (priority === "HIGH") return "#F5A623";
  return "#22D9A0";
}

function dueLabel(value?: string | Date | null) {
  if (!value) return "No due";
  return new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" }).format(new Date(value));
}

export function MobileSDEDashboard({ user, metrics, tasks, bugs, escalations }: MobileSDEDashboardProps) {
  const [selected, setSelected] = useState<SdeTask | null>(null);
  const urgentTasks = tasks
    .filter((task) => task.status !== "DONE")
    .sort((a, b) => {
      const order = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 } as Record<string, number>;
      return (order[a.priority] ?? 9) - (order[b.priority] ?? 9);
    })
    .slice(0, 3);
  const criticalBugs = bugs.filter((bug) => bug.severity === "CRITICAL" && !["RESOLVED", "CLOSED"].includes(bug.status)).length;

  return (
    <main className="mobile-page min-h-screen bg-[var(--bg)] px-4 pt-4 text-[var(--text)]">
      <header>
        <h1 className="font-heading text-sm font-extrabold">Good morning, {user.name}</h1>
        <p className="mt-1 text-[10px] font-semibold text-[#22D9A0]">NEXA briefed you</p>
      </header>

      <section className="mt-4 flex gap-3 overflow-x-auto scroll-x-hidden snap-x">
        {urgentTasks.map((task) => (
          <button
            key={task.id}
            type="button"
            onClick={() => setSelected(task)}
            className="snap-start min-w-[210px] rounded-[16px] border border-white/10 bg-[var(--card)] p-4 text-left"
          >
            <span className="rounded-full px-2 py-1 text-[10px] font-bold" style={{ background: `${priorityColor(task.priority)}22`, color: priorityColor(task.priority) }}>
              {task.priority}
            </span>
            <h2 className="mt-3 line-clamp-2 font-heading text-[13px] font-bold">{task.title}</h2>
            <p className="mt-2 text-[11px] text-[var(--muted)]">{dueLabel(task.dueDate)}</p>
          </button>
        ))}
      </section>

      <section className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-[14px] border border-white/10 bg-[var(--card)] p-3">
          <p className="font-heading text-[22px] font-extrabold" style={{ color: metrics.openTasks > 0 ? "#FF6B6B" : "#22D9A0" }}>{metrics.openTasks}</p>
          <p className="text-[10px] text-[var(--muted)]">Tasks due today</p>
        </div>
        <div className="rounded-[14px] border border-white/10 bg-[var(--card)] p-3">
          <p className="font-heading text-[22px] font-extrabold" style={{ color: criticalBugs > 0 ? "#FF3B30" : "#F5A623" }}>{metrics.openBugs}</p>
          <p className="text-[10px] text-[var(--muted)]">Open bugs</p>
        </div>
        <div className="rounded-[14px] border border-white/10 bg-[var(--card)] p-3">
          <p className="font-heading text-[22px] font-extrabold text-[#7C6FFF]">{metrics.activeSprintProgress}%</p>
          <p className="text-[10px] text-[var(--muted)]">Active sprint</p>
          <div className="mt-2 h-1.5 rounded-full bg-white/10"><div className="h-full rounded-full bg-[#7C6FFF]" style={{ width: `${metrics.activeSprintProgress}%` }} /></div>
        </div>
        <div className="rounded-[14px] border border-white/10 bg-[var(--card)] p-3">
          <p className="font-heading text-[22px] font-extrabold text-[#F5A623]">{metrics.openEscalations}</p>
          <p className="text-[10px] text-[var(--muted)]">Escalations pending</p>
        </div>
      </section>

      <section className="mt-4 rounded-[18px] border border-[#7C6FFF]/35 bg-[#7C6FFF]/10 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#7C6FFF] to-[#22D9A0] font-heading text-xs font-bold">N</div>
          <div>
            <h2 className="font-heading text-sm font-bold">NEXA dev brief</h2>
            <p className="text-[10px] text-zinc-500">Today’s tech priorities</p>
          </div>
        </div>
        <p className="mt-3 text-xs leading-6 text-zinc-300">
          {criticalBugs} critical bugs, {escalations.length} escalations pending, sprint ends in {metrics.activeSprintDaysLeft} days.
        </p>
      </section>

      <MobileSheet isOpen={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.title ?? "Task"} height="half">
        {selected ? (
          <div className="space-y-3 text-sm text-zinc-300">
            <p>{selected.description || "No description provided."}</p>
            <p className="text-xs text-zinc-500">Due: {dueLabel(selected.dueDate)}</p>
          </div>
        ) : null}
      </MobileSheet>
    </main>
  );
}
