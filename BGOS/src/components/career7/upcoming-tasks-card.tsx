"use client";

import { AlertCircle, CheckCircle2, ChevronRight, Clock } from "lucide-react";
import { priorityColors } from "./theme";

type CareerTask = {
  id: string;
  title: string;
  dueDate: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  category: string;
  completed: boolean;
  credits?: number;
};

type UpcomingTasksCardProps = {
  tasks?: CareerTask[];
};

export function UpcomingTasksCard({
  tasks = [
    {
      id: "1",
      title: "Complete Advanced JavaScript Course",
      dueDate: "Today",
      priority: "HIGH",
      category: "Learning",
      completed: false,
      credits: 100,
    },
    {
      id: "2",
      title: "Build a Project with React",
      dueDate: "Tomorrow",
      priority: "MEDIUM",
      category: "Hands-on",
      completed: false,
      credits: 200,
    },
    {
      id: "3",
      title: "Network with 5 Industry Professionals",
      dueDate: "This Week",
      priority: "MEDIUM",
      category: "Networking",
      completed: false,
      credits: 50,
    },
  ],
}: UpcomingTasksCardProps) {
  const getPriorityIcon = (priority: CareerTask["priority"]) => {
    if (priority === "HIGH") return <AlertCircle size={14} />;
    if (priority === "MEDIUM") return <Clock size={14} />;
    return <CheckCircle2 size={14} />;
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-slate-950">Upcoming Tasks</h3>
        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
          {tasks.filter((task) => !task.completed).length} Active
        </span>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`rounded-2xl border p-4 transition-all ${
              task.completed
                ? "border-slate-100 bg-slate-50 opacity-70"
                : "border-slate-100 bg-slate-50 hover:border-indigo-100 hover:bg-white"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-1">
                {task.completed ? (
                  <CheckCircle2 className="text-green-600" size={20} />
                ) : (
                  <div className="h-5 w-5 rounded-md border-2 border-slate-300" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                  <h4 className={`text-sm font-semibold ${task.completed ? "text-slate-500 line-through" : "text-slate-950"}`}>
                    {task.title}
                  </h4>
                  <div className={`flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium ${priorityColors[task.priority]}`}>
                    {getPriorityIcon(task.priority)}
                    {task.priority}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-3 text-xs text-slate-600">
                    <span className="rounded-full border border-slate-200 bg-white px-2 py-1">
                      {task.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {task.dueDate}
                    </span>
                  </div>
                  {task.credits && (
                    <span className="rounded-full bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-1 text-xs font-semibold text-purple-700">
                      +{task.credits} Credits
                    </span>
                  )}
                </div>
              </div>

              <ChevronRight className="mt-1 shrink-0 text-slate-400" size={18} />
            </div>
          </div>
        ))}
      </div>

      <button className="mt-6 w-full rounded-xl border-2 border-dashed border-slate-300 px-4 py-3 font-semibold text-slate-700 transition-colors hover:border-indigo-400 hover:bg-indigo-50">
        View All Tasks
      </button>
    </div>
  );
}
