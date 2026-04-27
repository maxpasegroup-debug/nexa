"use client";

import { useMemo, useState } from "react";

import { BugDrawer } from "@/components/sde/bug-drawer";
import type { BugStatus, SdeBug, SdeUser, Severity } from "@/components/sde/types";
import { EmptyState } from "@/components/ui/EmptyState";

type BugTrackerProps = {
  bugs: SdeBug[];
  teamMembers: SdeUser[];
  onBugUpdate: (bug: SdeBug) => void;
  onBugCreate: (bug: SdeBug) => void;
};

const statusFilters: Array<BugStatus | "ALL"> = ["ALL", "OPEN", "IN_PROGRESS", "RESOLVED"];
const severityFilters: Array<Severity | "ALL"> = ["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"];
const severityClass = {
  CRITICAL: "animate-pulse bg-[#FF6B6B]/20 text-[#FF6B6B] border-[#FF6B6B]/40",
  HIGH: "bg-[#FF6B6B]/10 text-[#FF6B6B] border-[#FF6B6B]/30",
  MEDIUM: "bg-[#F5A623]/10 text-[#F5A623] border-[#F5A623]/30",
  LOW: "bg-white/5 text-zinc-400 border-white/10",
};

export function BugTracker({ bugs, teamMembers, onBugUpdate, onBugCreate }: BugTrackerProps) {
  const [selectedBugId, setSelectedBugId] = useState<string | null>(null);
  const [status, setStatus] = useState<BugStatus | "ALL">("ALL");
  const [severity, setSeverity] = useState<Severity | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    severity: "MEDIUM" as Severity,
    stepsToRepro: "",
    assignedTo: "",
  });

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return bugs.filter((bug) => {
      const matchesStatus = status === "ALL" || bug.status === status;
      const matchesSeverity = severity === "ALL" || bug.severity === severity;
      const matchesSearch = !query || bug.title.toLowerCase().includes(query) || bug.description.toLowerCase().includes(query);
      return matchesStatus && matchesSeverity && matchesSearch;
    });
  }, [bugs, search, severity, status]);
  const critical = bugs.filter((bug) => bug.severity === "CRITICAL" && bug.status !== "RESOLVED" && bug.status !== "CLOSED");

  async function submit() {
    if (form.severity === "CRITICAL" && !window.confirm("This will immediately alert the dev team.")) return;
    const response = await fetch("/api/sde/bugs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (response.ok) {
      const data = (await response.json()) as { bug: SdeBug };
      onBugCreate(data.bug);
      setShowForm(false);
      setForm({ title: "", description: "", severity: "MEDIUM", stepsToRepro: "", assignedTo: "" });
    }
  }

  return (
    <section className="space-y-4">
      {critical.length > 0 ? (
        <div className="rounded-2xl border border-[#FF6B6B]/40 bg-[#FF6B6B]/10 p-4">
          <h3 className="font-heading text-sm font-bold text-[#FF6B6B]">Critical bugs</h3>
          <div className="mt-3 space-y-2">
            {critical.map((bug) => (
              <div key={bug.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-white">{bug.title}</span>
                <button type="button" onClick={() => setSelectedBugId(bug.id)} className="rounded-lg bg-[#FF6B6B] px-3 py-1.5 text-xs font-bold text-white">View</button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((item) => <button key={item} type="button" onClick={() => setStatus(item)} className={`rounded-full px-3 py-1.5 text-xs font-bold ${status === item ? "bg-[#7C6FFF] text-white" : "bg-white/5 text-zinc-500"}`}>{item}</button>)}
          <select value={severity} onChange={(event) => setSeverity(event.target.value as Severity | "ALL")} className="rounded-full border border-white/10 bg-[#13131c] px-3 py-1.5 text-xs text-white">
            {severityFilters.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search bugs..." className="rounded-xl border border-white/10 bg-[#13131c] px-3 py-2 text-sm text-white outline-none focus:border-[#7C6FFF]" />
          <button type="button" onClick={() => setShowForm((value) => !value)} className="rounded-xl bg-[#7C6FFF] px-4 py-2 text-sm font-bold text-white">Report bug</button>
        </div>
      </div>

      {showForm ? (
        <div className="rounded-2xl border border-white/10 bg-[#13131c] p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <input placeholder="Title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="rounded-lg border border-white/10 bg-[#070709] px-3 py-2 text-sm text-white" />
            <select value={form.severity} onChange={(event) => setForm({ ...form, severity: event.target.value as Severity })} className="rounded-lg border border-white/10 bg-[#070709] px-3 py-2 text-sm text-white">{severityFilters.filter((item) => item !== "ALL").map((item) => <option key={item}>{item}</option>)}</select>
            <select value={form.assignedTo} onChange={(event) => setForm({ ...form, assignedTo: event.target.value })} className="rounded-lg border border-white/10 bg-[#070709] px-3 py-2 text-sm text-white"><option value="">Unassigned</option>{teamMembers.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select>
            <textarea placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="min-h-20 rounded-lg border border-white/10 bg-[#070709] px-3 py-2 text-sm text-white md:col-span-2" />
            <textarea placeholder="Steps to reproduce" value={form.stepsToRepro} onChange={(event) => setForm({ ...form, stepsToRepro: event.target.value })} className="min-h-20 rounded-lg border border-white/10 bg-[#070709] px-3 py-2 text-sm text-white md:col-span-2" />
          </div>
          <button type="button" onClick={() => void submit()} className="mt-3 rounded-lg bg-[#7C6FFF] px-4 py-2 text-sm font-bold text-white">Submit bug</button>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#13131c]">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-white/10 text-xs uppercase text-zinc-500"><tr><th className="px-4 py-3">Severity</th><th>Title</th><th>Status</th><th>Reported by</th><th>Assigned to</th><th>Created</th><th>Actions</th></tr></thead>
          <tbody>{filtered.map((bug) => <tr key={bug.id} onClick={() => setSelectedBugId(bug.id)} className="cursor-pointer border-b border-white/5 hover:bg-white/[0.03]"><td className="px-4 py-3"><span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${severityClass[bug.severity]}`}>{bug.severity}</span></td><td className="font-semibold text-white">{bug.title}</td><td className="text-zinc-400">{bug.status}</td><td className="text-zinc-400">{bug.reporter?.name ?? "-"}</td><td className="text-zinc-400">{bug.assignee?.name ?? "Unassigned"}</td><td className="text-zinc-500">{new Date(bug.createdAt).toLocaleDateString("en-IN")}</td><td><button className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-300">Open</button></td></tr>)}</tbody>
        </table>
        {filtered.length === 0 ? (
          <EmptyState
            title="No bugs found"
            description="Reported bugs will appear here with severity, owner, and status."
          />
        ) : null}
      </div>
      <BugDrawer bugId={selectedBugId} onClose={() => setSelectedBugId(null)} bugs={bugs} onBugUpdate={onBugUpdate} />
    </section>
  );
}
