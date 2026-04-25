"use client";

import { useState } from "react";

import { NexaPanel } from "@/components/boss/nexa-panel";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { SprintPanel } from "@/components/sde/sprint-panel";
import type { SdeSprint, SdeTask, SdeUser } from "@/components/sde/types";

export function SdeSprintPage({ user, initialSprints, activeSprint }: { user: SdeUser & { businessId: string; businessName: string }; initialSprints: SdeSprint[]; activeSprint: (SdeSprint & { tasks?: SdeTask[] }) | null }) {
  const [sprints, setSprints] = useState(initialSprints);
  const [active, setActive] = useState(activeSprint);
  const tasks = active?.tasks ?? [];
  return <div className="min-h-screen bg-[#070709] pl-[240px] text-white md:pr-[320px]"><Sidebar role="SDE" userName={user.name} businessName={user.businessName} /><Navbar title="Sprint" userName={user.name} /><main className="pt-[60px]"><div className="space-y-6 p-8"><SprintPanel sprints={sprints} activeSprint={active} onSprintCreate={(sprint) => setSprints([sprint, ...sprints])} onSprintUpdate={(sprint) => { setActive(sprint.status === "ACTIVE" ? sprint : null); setSprints(sprints.map((item) => item.id === sprint.id ? sprint : item)); }} /><section className="rounded-2xl border border-white/10 bg-[#13131c] p-5"><h2 className="mb-4 font-heading text-lg font-bold">Active sprint tasks</h2><table className="w-full text-left text-sm"><thead className="text-xs uppercase text-zinc-500"><tr><th>Title</th><th>Assignee</th><th>Status</th><th>Priority</th><th>Points</th><th>Due</th></tr></thead><tbody>{tasks.map((task) => <tr key={task.id} className="border-t border-white/10"><td className="py-3 text-white">{task.title}</td><td className="text-zinc-400">{task.assignee?.name ?? "-"}</td><td>{task.status}</td><td>{task.priority}</td><td>{task.storyPoints}</td><td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString("en-IN") : "-"}</td></tr>)}</tbody></table></section></div></main><NexaPanel businessId={user.businessId} initialMessage="sde_morning_context" /></div>;
}
