"use client";

import { useState } from "react";

import type { EscalationStatus, EscalationType, Priority, SdeEscalation } from "@/components/sde/types";

type EscalationFeedProps = {
  escalations: SdeEscalation[];
  onEscalationCreate: (escalation: SdeEscalation) => void;
  onEscalationResolve: (escalation: SdeEscalation) => void;
  currentUserId?: string;
};

const priorities: Priority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const types: EscalationType[] = ["BUG", "INTEGRATION", "FEATURE_REQUEST", "SECURITY", "PERFORMANCE", "OTHER"];
const priorityClass = {
  URGENT: "animate-pulse bg-[#FF6B6B]/20 text-[#FF6B6B]",
  HIGH: "bg-[#FF6B6B]/10 text-[#FF6B6B]",
  MEDIUM: "bg-[#F5A623]/10 text-[#F5A623]",
  LOW: "bg-white/5 text-zinc-400",
};

function timeAgo(value: string | Date) {
  const hours = Math.floor((Date.now() - new Date(value).getTime()) / 3600000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours} hours ago`;
  return `${Math.floor(hours / 24)} days ago`;
}

export function EscalationFeed({ escalations, onEscalationCreate, onEscalationResolve, currentUserId }: EscalationFeedProps) {
  const [showForm, setShowForm] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolution, setResolution] = useState("");
  const [form, setForm] = useState({ type: "OTHER" as EscalationType, title: "", description: "", priority: "MEDIUM" as Priority });
  const urgent = escalations.some((item) => item.priority === "URGENT" && item.status !== "RESOLVED" && item.status !== "CLOSED");

  async function create() {
    const response = await fetch("/api/sde/escalations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (response.ok) {
      const data = (await response.json()) as { escalation: SdeEscalation };
      onEscalationCreate(data.escalation);
      setShowForm(false);
    }
  }

  async function patch(item: SdeEscalation, status: EscalationStatus, body: Record<string, unknown> = {}) {
    const response = await fetch(`/api/sde/escalations/${item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, ...body }) });
    if (response.ok) {
      const data = (await response.json()) as { escalation: SdeEscalation };
      onEscalationResolve(data.escalation);
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-[#13131c] p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-heading text-base font-bold text-white">Escalations {urgent ? <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#FF6B6B]" /> : null}</h2>
        <button type="button" onClick={() => setShowForm((value) => !value)} className="rounded-lg bg-[#7C6FFF] px-3 py-2 text-xs font-bold text-white">Raise escalation</button>
      </div>
      {showForm ? <div className="mb-4 rounded-xl border border-white/10 bg-[#0e0e13] p-3"><p className="mb-3 text-xs text-[#F5A623]">This will send an email to the dev team immediately.</p><div className="grid gap-2"><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as EscalationType })} className="rounded-lg border border-white/10 bg-[#070709] px-3 py-2 text-sm text-white">{types.map((item) => <option key={item}>{item}</option>)}</select><select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })} className="rounded-lg border border-white/10 bg-[#070709] px-3 py-2 text-sm text-white">{priorities.map((item) => <option key={item}>{item}</option>)}</select><input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-lg border border-white/10 bg-[#070709] px-3 py-2 text-sm text-white" /><textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-lg border border-white/10 bg-[#070709] px-3 py-2 text-sm text-white" /><button onClick={() => void create()} className="rounded-lg bg-[#7C6FFF] px-3 py-2 text-sm font-bold text-white">Send</button></div></div> : null}
      <div className="space-y-3">
        {escalations.map((item) => (
          <article key={item.id} className="rounded-xl border border-white/10 bg-[#0e0e13] p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap gap-2"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${priorityClass[item.priority]}`}>{item.priority}</span><span className="rounded-full bg-white/5 px-2 py-1 text-[10px] font-bold text-zinc-500">{item.type}</span></div>
                <h3 className="mt-3 text-sm font-bold text-white">{item.title}</h3>
                <p className="mt-1 line-clamp-2 text-[13px] text-zinc-500">{item.description}</p>
                <p className="mt-2 text-xs text-zinc-600">Raised by {item.raiser?.name ?? "User"} · {timeAgo(item.createdAt)}</p>
              </div>
              <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] text-zinc-400">{item.status}</span>
            </div>
            <div className="mt-3">
              {(item.status === "OPEN" || item.status === "ACKNOWLEDGED") ? <button type="button" onClick={() => void patch(item, "IN_PROGRESS")} className="rounded-lg border border-[#7C6FFF]/40 px-3 py-2 text-xs font-bold text-[#b8b2ff]">Take ownership</button> : null}
              {item.status === "IN_PROGRESS" && (!item.resolvedBy || item.resolvedBy === currentUserId) ? <button type="button" onClick={() => setResolvingId(item.id)} className="rounded-lg border border-[#22D9A0]/40 px-3 py-2 text-xs font-bold text-[#22D9A0]">Mark resolved</button> : null}
            </div>
            {resolvingId === item.id ? <div className="mt-3"><textarea value={resolution} onChange={(e) => setResolution(e.target.value)} placeholder="Resolution" className="w-full rounded-lg border border-white/10 bg-[#070709] p-3 text-sm text-white" /><button onClick={() => void patch(item, "RESOLVED", { resolution })} className="mt-2 rounded-lg bg-[#22D9A0] px-3 py-2 text-xs font-bold text-black">Resolve</button></div> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
