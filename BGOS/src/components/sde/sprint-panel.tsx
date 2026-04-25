"use client";

import { useMemo, useState } from "react";

import type { SdeSprint, SdeTask } from "@/components/sde/types";

type SprintPanelProps = {
  sprints: SdeSprint[];
  activeSprint: (SdeSprint & { tasks?: SdeTask[] }) | null;
  onSprintCreate: (sprint: SdeSprint) => void;
  onSprintUpdate: (sprint: SdeSprint) => void;
};

function ProgressRing({ value }: { value: number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="relative h-24 w-24">
      <svg className="-rotate-90" width="96" height="96"><circle cx="48" cy="48" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" /><circle cx="48" cy="48" r={radius} fill="none" stroke="#22D9A0" strokeWidth="7" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference - (Math.min(100, value) / 100) * circumference} /></svg>
      <div className="absolute inset-0 flex items-center justify-center font-heading text-lg font-bold text-white">{value}%</div>
    </div>
  );
}

function daysLeft(endDate?: string | Date) {
  if (!endDate) return 0;
  return Math.max(0, Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000));
}

export function SprintPanel({ sprints, activeSprint, onSprintCreate, onSprintUpdate }: SprintPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", goal: "", startDate: "", endDate: "" });
  const tasks = activeSprint?.tasks ?? [];
  const completed = tasks.filter((task) => task.status === "DONE");
  const progress = tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0;
  const totalPoints = tasks.reduce((sum, task) => sum + task.storyPoints, 0);
  const completedPoints = completed.reduce((sum, task) => sum + task.storyPoints, 0);
  const pastSprints = useMemo(() => sprints.filter((sprint) => sprint.status !== "ACTIVE"), [sprints]);

  async function completeSprint() {
    if (!activeSprint || !window.confirm("Are you sure? This will end the sprint and calculate velocity.")) return;
    const response = await fetch(`/api/sde/sprints/${activeSprint.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "COMPLETED" }) });
    if (response.ok) {
      const data = (await response.json()) as { sprint: SdeSprint };
      onSprintUpdate(data.sprint);
    }
  }

  async function createSprint() {
    const response = await fetch("/api/sde/sprints", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (response.ok) {
      const data = (await response.json()) as { sprint: SdeSprint };
      onSprintCreate(data.sprint);
      setShowForm(false);
      setForm({ name: "", goal: "", startDate: "", endDate: "" });
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-[#13131c] p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading text-base font-bold text-white">Sprint</h2>
        <button type="button" onClick={() => setShowForm((value) => !value)} className="rounded-lg bg-[#7C6FFF] px-3 py-2 text-xs font-bold text-white">Create sprint</button>
      </div>
      {activeSprint ? (
        <div className="mt-5 rounded-xl border border-white/10 bg-[#0e0e13] p-4">
          <div className="flex items-center gap-4">
            <ProgressRing value={progress} />
            <div className="min-w-0">
              <h3 className="font-heading text-lg font-bold text-white">{activeSprint.name}</h3>
              <p className="mt-1 text-sm text-zinc-500">{activeSprint.goal ?? "No goal set"}</p>
              <p className="mt-2 text-xs text-[#22D9A0]">{daysLeft(activeSprint.endDate)} days remaining</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <span className="rounded-lg bg-white/5 p-2 text-xs text-zinc-400">Total {tasks.length}</span>
            <span className="rounded-lg bg-white/5 p-2 text-xs text-zinc-400">Completed {completed.length}</span>
            <span className="rounded-lg bg-white/5 p-2 text-xs text-zinc-400">Remaining {tasks.length - completed.length}</span>
          </div>
          <p className="mt-3 text-sm text-zinc-400">Velocity: {completedPoints} / {totalPoints} pts</p>
          <button type="button" onClick={() => void completeSprint()} className="mt-4 w-full rounded-lg border border-[#22D9A0]/40 px-3 py-2 text-sm font-bold text-[#22D9A0]">Complete sprint</button>
        </div>
      ) : <p className="mt-5 rounded-xl border border-dashed border-white/10 p-5 text-sm text-zinc-500">No active sprint.</p>}
      {showForm ? <div className="mt-4 grid gap-3"><input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-lg border border-white/10 bg-[#070709] px-3 py-2 text-sm text-white" /><input placeholder="Goal" value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} className="rounded-lg border border-white/10 bg-[#070709] px-3 py-2 text-sm text-white" /><div className="grid grid-cols-2 gap-2"><input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="rounded-lg border border-white/10 bg-[#070709] px-3 py-2 text-sm text-white" /><input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="rounded-lg border border-white/10 bg-[#070709] px-3 py-2 text-sm text-white" /></div><button onClick={() => void createSprint()} className="rounded-lg bg-[#7C6FFF] px-3 py-2 text-sm font-bold text-white">Create</button></div> : null}
      <div className="mt-5 flex gap-3 overflow-x-auto">
        {pastSprints.map((sprint) => <div key={sprint.id} className="w-44 shrink-0 rounded-xl border border-white/10 bg-[#0e0e13] p-3"><p className="truncate text-sm font-bold text-white">{sprint.name}</p><p className="mt-1 text-xs text-zinc-500">{new Date(sprint.startDate).toLocaleDateString("en-IN")} - {new Date(sprint.endDate).toLocaleDateString("en-IN")}</p><p className="mt-2 text-xs text-[#7C6FFF]">{sprint.velocity ?? 0} velocity · {sprint.completedTaskCount ?? 0}/{sprint.taskCount ?? 0}</p></div>)}
      </div>
    </section>
  );
}
