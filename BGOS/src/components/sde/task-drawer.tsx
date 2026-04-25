"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

import type { Priority, SdeSprint, SdeTask, SdeUser, TaskStatus } from "@/components/sde/types";

type TaskDrawerProps = {
  taskId: string | null;
  onClose: () => void;
  teamMembers: SdeUser[];
  tasks?: SdeTask[];
  sprints?: SdeSprint[];
  onTaskUpdate?: (task: SdeTask) => void;
};

const statuses: TaskStatus[] = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];
const priorities: Priority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

function toDateInput(value?: string | Date | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export function TaskDrawer({
  taskId,
  onClose,
  teamMembers,
  tasks = [],
  sprints = [],
  onTaskUpdate,
}: TaskDrawerProps) {
  const task = useMemo(
    () => tasks.find((item) => item.id === taskId) ?? null,
    [taskId, tasks],
  );
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "TODO" as TaskStatus,
    priority: "MEDIUM" as Priority,
    dueDate: "",
    sprintId: "",
    storyPoints: "1",
    assignedTo: "",
    blockedBy: "",
  });
  const [blocking, setBlocking] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<string[]>([]);

  useEffect(() => {
    if (!task) return;
    setForm({
      title: task.title,
      description: task.description ?? "",
      status: task.status,
      priority: task.priority,
      dueDate: toDateInput(task.dueDate),
      sprintId: task.sprintId ?? "",
      storyPoints: String(task.storyPoints),
      assignedTo: task.assignedTo,
      blockedBy: task.blockedBy ?? "",
    });
  }, [task]);

  async function save(extra?: Partial<typeof form>) {
    if (!taskId) return;
    const next = { ...form, ...extra };
    const response = await fetch(`/api/sde/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...next,
        dueDate: next.dueDate || null,
        sprintId: next.sprintId || null,
        storyPoints: Number(next.storyPoints || 1),
      }),
    });

    if (response.ok) {
      const data = (await response.json()) as { task: SdeTask };
      onTaskUpdate?.(data.task);
    }
  }

  if (!taskId) return null;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
        aria-label="Close task drawer"
      />
      <aside className="fixed bottom-0 right-0 top-0 z-50 w-full max-w-[400px] overflow-y-auto border-l border-white/10 bg-[#0d0d11] p-5 text-white shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold">Task detail</h2>
          <button type="button" onClick={onClose} className="rounded-lg border border-white/10 p-2">
            <X className="h-4 w-4" />
          </button>
        </div>

        {!task ? (
          <p className="text-sm text-zinc-500">Task not found in current list.</p>
        ) : (
          <div className="space-y-4">
            <input className="w-full rounded-lg border border-white/10 bg-[#070709] px-3 py-2 text-sm outline-none focus:border-[#7C6FFF]" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
            <textarea className="h-24 w-full resize-none rounded-lg border border-white/10 bg-[#070709] px-3 py-2 text-sm outline-none focus:border-[#7C6FFF]" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Description" />
            <div className="grid grid-cols-2 gap-3">
              <select className="rounded-lg border border-white/10 bg-[#070709] px-3 py-2 text-sm" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as TaskStatus })}>{statuses.map((status) => <option key={status}>{status}</option>)}</select>
              <select className="rounded-lg border border-white/10 bg-[#070709] px-3 py-2 text-sm" value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value as Priority })}>{priorities.map((priority) => <option key={priority}>{priority}</option>)}</select>
              <input type="date" className="rounded-lg border border-white/10 bg-[#070709] px-3 py-2 text-sm" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} />
              <input type="number" min="1" className="rounded-lg border border-white/10 bg-[#070709] px-3 py-2 text-sm" value={form.storyPoints} onChange={(event) => setForm({ ...form, storyPoints: event.target.value })} />
            </div>
            <select className="w-full rounded-lg border border-white/10 bg-[#070709] px-3 py-2 text-sm" value={form.sprintId} onChange={(event) => setForm({ ...form, sprintId: event.target.value })}>
              <option value="">No sprint</option>
              {sprints.map((sprint) => <option key={sprint.id} value={sprint.id}>{sprint.name}</option>)}
            </select>
            <select className="w-full rounded-lg border border-white/10 bg-[#070709] px-3 py-2 text-sm" value={form.assignedTo} onChange={(event) => setForm({ ...form, assignedTo: event.target.value })}>
              {teamMembers.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
            </select>
            <input className="w-full rounded-lg border border-white/10 bg-[#070709] px-3 py-2 text-sm outline-none focus:border-[#7C6FFF]" value={form.blockedBy} onChange={(event) => setForm({ ...form, blockedBy: event.target.value })} placeholder="Blocked by" />
            {blocking ? (
              <div className="rounded-xl border border-[#FF6B6B]/30 bg-[#FF6B6B]/10 p-3">
                <p className="text-sm text-white">This will notify the dev team. Continue?</p>
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={() => void save()} className="rounded-lg bg-[#FF6B6B] px-3 py-2 text-sm font-bold">Yes</button>
                  <button type="button" onClick={() => setBlocking(false)} className="rounded-lg border border-white/10 px-3 py-2 text-sm">No</button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => setBlocking(true)} className="w-full rounded-lg border border-[#FF6B6B]/40 px-3 py-2 text-sm font-bold text-[#FF6B6B]">Mark as blocked</button>
            )}
            <button type="button" onClick={() => void save()} className="w-full rounded-lg bg-[#7C6FFF] px-3 py-2 text-sm font-bold">Save</button>

            <section className="border-t border-white/10 pt-4">
              <h3 className="font-heading text-sm font-bold">Activity</h3>
              <div className="mt-3 space-y-2 text-xs text-zinc-500">
                <p>Status: {task.status}</p>
                {comments.map((item, index) => <p key={`${item}-${index}`}>{item}</p>)}
              </div>
              <div className="mt-3 flex gap-2">
                <input value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Add note" className="min-w-0 flex-1 rounded-lg border border-white/10 bg-[#070709] px-3 py-2 text-sm" />
                <button type="button" onClick={() => { if (comment.trim()) setComments([comment, ...comments]); setComment(""); }} className="rounded-lg bg-[#7C6FFF] px-3 py-2 text-sm font-bold">Add</button>
              </div>
            </section>
          </div>
        )}
      </aside>
    </>
  );
}
