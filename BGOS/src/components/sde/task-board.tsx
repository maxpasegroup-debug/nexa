"use client";

import { useMemo, useState } from "react";
import { GripVertical, Plus } from "lucide-react";

import type { Priority, SdeSprint, SdeTask, TaskStatus } from "@/components/sde/types";
import { EmptyState } from "@/components/ui/EmptyState";

type TaskBoardProps = {
  tasks: SdeTask[];
  sprints: SdeSprint[];
  onTaskUpdate: (task: SdeTask) => void;
  onTaskCreate: (task: SdeTask) => void;
  onTaskClick?: (task: SdeTask) => void;
};

const columns: Array<{ status: TaskStatus; title: string }> = [
  { status: "TODO", title: "Todo" },
  { status: "IN_PROGRESS", title: "In Progress" },
  { status: "REVIEW", title: "Review" },
  { status: "DONE", title: "Done" },
];

const priorityColors: Record<Priority, string> = {
  URGENT: "#FF6B6B",
  HIGH: "#F97316",
  MEDIUM: "#7C6FFF",
  LOW: "#6B6878",
};

function initials(name?: string | null) {
  return (name ?? "SDE")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function dueClass(value?: string | Date | null) {
  if (!value) return "text-zinc-600";
  const due = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today ? "text-[#FF6B6B]" : "text-zinc-500";
}

function dueLabel(value?: string | Date | null) {
  if (!value) return "No due date";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
}

function TaskCard({
  task,
  onClick,
  onDragStart,
}: {
  task: SdeTask;
  onClick: () => void;
  onDragStart: (taskId: string) => void;
}) {
  return (
    <button
      type="button"
      draggable
      onDragStart={() => onDragStart(task.id)}
      onClick={onClick}
      className="group w-full cursor-grab rounded-xl border border-white/10 bg-[#13131c] p-3 text-left transition hover:-translate-y-0.5 hover:border-[#7C6FFF]/30"
      style={{ borderLeftColor: priorityColors[task.priority], borderLeftWidth: 4 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-[13px] font-bold text-white">{task.title}</h3>
          <p className="mt-1 truncate text-xs text-zinc-500">
            {task.description ?? "No description yet"}
          </p>
        </div>
        <GripVertical className="h-4 w-4 shrink-0 text-zinc-700 opacity-0 transition group-hover:opacity-100" />
      </div>
      {task.blockedBy ? (
        <span className="mt-3 inline-flex rounded-full bg-[#FF6B6B]/10 px-2 py-1 text-[10px] font-bold text-[#FF6B6B]">
          Blocked
        </span>
      ) : null}
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white/5 px-2 py-1 text-[11px] font-bold text-zinc-400">
            {task.storyPoints} pts
          </span>
          <span className={`text-[11px] font-semibold ${dueClass(task.dueDate)}`}>
            {dueLabel(task.dueDate)}
          </span>
        </div>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#7C6FFF] text-[10px] font-bold text-white">
          {initials(task.assignee?.name)}
        </span>
      </div>
    </button>
  );
}

export function TaskBoard({
  tasks,
  sprints,
  onTaskUpdate,
  onTaskCreate,
  onTaskClick,
}: TaskBoardProps) {
  const [selectedSprint, setSelectedSprint] = useState<string>("all");
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [quickCreateStatus, setQuickCreateStatus] = useState<TaskStatus | null>(null);
  const [quickTitle, setQuickTitle] = useState("");
  const [quickPriority, setQuickPriority] = useState<Priority>("MEDIUM");

  const visibleTasks = useMemo(() => {
    if (selectedSprint === "all") return tasks;
    if (selectedSprint === "none") return tasks.filter((task) => !task.sprintId);
    return tasks.filter((task) => task.sprintId === selectedSprint);
  }, [selectedSprint, tasks]);

  async function moveTask(status: TaskStatus) {
    if (!draggedTaskId) return;
    const task = tasks.find((item) => item.id === draggedTaskId);
    if (!task || task.status === status) return;

    onTaskUpdate({ ...task, status });
    setDraggedTaskId(null);

    const response = await fetch(`/api/sde/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (response.ok) {
      const data = (await response.json()) as { task: SdeTask };
      onTaskUpdate(data.task);
    } else {
      onTaskUpdate(task);
    }
  }

  async function createQuickTask(status: TaskStatus) {
    if (!quickTitle.trim()) return;

    const response = await fetch("/api/sde/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: quickTitle,
        priority: quickPriority,
        status,
        sprintId:
          selectedSprint !== "all" && selectedSprint !== "none"
            ? selectedSprint
            : undefined,
      }),
    });

    if (response.ok) {
      const data = (await response.json()) as { task: SdeTask };
      onTaskCreate({ ...data.task, status });
      setQuickTitle("");
      setQuickPriority("MEDIUM");
      setQuickCreateStatus(null);
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-[#0d0d11] p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <select
          value={selectedSprint}
          onChange={(event) => setSelectedSprint(event.target.value)}
          className="rounded-xl border border-white/10 bg-[#13131c] px-3 py-2 text-sm text-white outline-none focus:border-[#7C6FFF]"
        >
          <option value="all">All sprints</option>
          <option value="none">No sprint</option>
          {sprints.map((sprint) => (
            <option key={sprint.id} value={sprint.id}>
              {sprint.name}
            </option>
          ))}
        </select>
      </div>

      {visibleTasks.length === 0 ? (
        <EmptyState
          title="No tasks yet"
          description="Create a task to start organizing engineering work."
        />
      ) : null}

      <div className="flex gap-4 overflow-x-auto pb-2">
        {columns.map((column) => {
          const columnTasks = visibleTasks.filter(
            (task) => task.status === column.status,
          );
          const storyPoints = columnTasks.reduce(
            (sum, task) => sum + task.storyPoints,
            0,
          );

          return (
            <div
              key={column.status}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => void moveTask(column.status)}
              className="w-[280px] shrink-0 rounded-xl border border-white/10 bg-white/[0.02] p-3"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-heading text-sm font-bold text-white">
                    {column.title}
                  </h2>
                  <p className="mt-1 text-xs text-zinc-500">
                    {columnTasks.length} tasks · {storyPoints} pts
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setQuickCreateStatus(column.status)}
                  className="rounded-lg border border-white/10 p-1.5 text-zinc-400 hover:text-white"
                  aria-label={`Add task to ${column.title}`}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {quickCreateStatus === column.status ? (
                <div className="mb-3 rounded-xl border border-[#7C6FFF]/30 bg-[#13131c] p-3">
                  <input
                    value={quickTitle}
                    onChange={(event) => setQuickTitle(event.target.value)}
                    placeholder="Task title"
                    className="w-full rounded-lg border border-white/10 bg-[#070709] px-3 py-2 text-sm text-white outline-none focus:border-[#7C6FFF]"
                  />
                  <select
                    value={quickPriority}
                    onChange={(event) => setQuickPriority(event.target.value as Priority)}
                    className="mt-2 w-full rounded-lg border border-white/10 bg-[#070709] px-3 py-2 text-sm text-white outline-none focus:border-[#7C6FFF]"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => void createQuickTask(column.status)}
                      className="flex-1 rounded-lg bg-[#7C6FFF] px-3 py-2 text-xs font-bold text-white"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickCreateStatus(null)}
                      className="rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="space-y-2">
                {columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => onTaskClick?.(task)}
                    onDragStart={setDraggedTaskId}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
