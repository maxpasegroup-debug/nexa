"use client";

import { useMemo, useState } from "react";

import { MobileSheet } from "@/components/mobile/mobile-sheet";
import type { SdeTask } from "@/components/sde/types";

type MobileSDETasksProps = {
  tasks: SdeTask[];
};

function priorityColor(priority: string) {
  if (priority === "URGENT") return "#FF6B6B";
  if (priority === "HIGH") return "#F5A623";
  if (priority === "MEDIUM") return "#7C6FFF";
  return "#22D9A0";
}

function dateLabel(value?: string | Date | null) {
  if (!value) return "No due date";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" }).format(new Date(value));
}

function isToday(value?: string | Date | null) {
  if (!value) return false;
  const date = new Date(value);
  const now = new Date();
  return date.toDateString() === now.toDateString();
}

function isThisWeek(value?: string | Date | null) {
  if (!value) return false;
  const date = new Date(value).getTime();
  const now = Date.now();
  return date >= now - 86400000 && date <= now + 7 * 86400000;
}

function isOverdue(value?: string | Date | null) {
  if (!value) return false;
  return new Date(value).getTime() < Date.now();
}

export function MobileSDETasks({ tasks }: MobileSDETasksProps) {
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<SdeTask | null>(null);
  const filteredTasks = useMemo(() => {
    if (filter === "Today") return tasks.filter((task) => isToday(task.dueDate));
    if (filter === "This week") return tasks.filter((task) => isThisWeek(task.dueDate));
    if (filter === "Sprint") return tasks.filter((task) => Boolean(task.sprint));
    if (filter === "Overdue") return tasks.filter((task) => task.status !== "DONE" && isOverdue(task.dueDate));
    return tasks;
  }, [filter, tasks]);

  return (
    <main className="mobile-page min-h-screen bg-[var(--bg)] px-4 pt-4 text-[var(--text)]">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-lg font-extrabold">Tasks</h1>
          <p className="mt-1 text-[11px] text-[var(--muted)]">{filteredTasks.length} visible</p>
        </div>
        <button type="button" className="rounded-full bg-[#22D9A0] px-4 py-2 font-heading text-xs font-bold text-[#070709]">
          Add
        </button>
      </header>

      <div className="mt-4 flex gap-2 overflow-x-auto scroll-x-hidden">
        {["All", "Today", "This week", "Sprint", "Overdue"].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={`shrink-0 rounded-full border px-3 py-2 text-[11px] font-semibold ${
              filter === item ? "border-[#7C6FFF] bg-[#7C6FFF]/15 text-[#c9c4ff]" : "border-white/10 text-[var(--muted)]"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <section className="mt-4 space-y-3">
        {filteredTasks.map((task) => (
          <button
            key={task.id}
            type="button"
            onClick={() => setSelected(task)}
            className="w-full rounded-[16px] border border-white/10 bg-[var(--card)] p-4 text-left"
          >
            <div className="flex items-start gap-3">
              <span className="mt-1 h-2.5 w-2.5 rounded-full" style={{ background: priorityColor(task.priority) }} />
              <div className="min-w-0 flex-1">
                <h2 className="line-clamp-2 font-heading text-[13px] font-bold">{task.title}</h2>
                <p className="mt-2 text-[11px] text-[var(--muted)]">{dateLabel(task.dueDate)} · {task.status.replace(/_/g, " ")}</p>
              </div>
              {task.sprint ? (
                <span className="rounded-full bg-[#7C6FFF]/15 px-2 py-1 text-[10px] font-semibold text-[#c9c4ff]">
                  {task.sprint.name}
                </span>
              ) : null}
            </div>
          </button>
        ))}
        {filteredTasks.length === 0 ? (
          <div className="rounded-[16px] border border-white/10 bg-[var(--card)] p-5 text-center text-xs text-zinc-500">
            No tasks in this filter.
          </div>
        ) : null}
      </section>

      <button className="fixed bottom-[92px] right-4 z-30 h-14 w-14 rounded-full bg-[#22D9A0] font-heading text-2xl font-bold text-[#070709]">
        +
      </button>

      <MobileSheet isOpen={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.title ?? "Task"} height="full">
        {selected ? (
          <div className="space-y-4 text-sm text-zinc-300">
            <p className="leading-6">{selected.description || "No description provided."}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/[0.03] p-3">
                <p className="text-[10px] text-zinc-500">Priority</p>
                <p className="mt-1 font-heading text-sm font-bold" style={{ color: priorityColor(selected.priority) }}>{selected.priority}</p>
              </div>
              <div className="rounded-xl bg-white/[0.03] p-3">
                <p className="text-[10px] text-zinc-500">Due</p>
                <p className="mt-1 font-heading text-sm font-bold">{dateLabel(selected.dueDate)}</p>
              </div>
            </div>
            <select className="h-11 w-full rounded-xl border border-white/10 bg-[#0f0f14] px-3 text-sm">
              {["TODO", "IN_PROGRESS", "REVIEW", "DONE"].map((status) => (
                <option key={status} value={status}>{status.replace(/_/g, " ")}</option>
              ))}
            </select>
            <textarea placeholder="Add note..." className="min-h-24 w-full rounded-xl border border-white/10 bg-[#0f0f14] p-3 text-sm outline-none" />
            <button className="h-11 w-full rounded-xl bg-[#22D9A0] font-heading text-sm font-bold text-[#070709]">Mark complete</button>
          </div>
        ) : null}
      </MobileSheet>
    </main>
  );
}
