"use client";

import { useState } from "react";

import { MobileSheet } from "@/components/mobile/mobile-sheet";
import type { SdeBug } from "@/components/sde/types";

type MobileSDEBugsProps = {
  bugs: SdeBug[];
};

function severityColor(severity: string) {
  if (severity === "CRITICAL") return "#FF3B30";
  if (severity === "HIGH") return "#F5A623";
  if (severity === "MEDIUM") return "#7C6FFF";
  return "#6B6878";
}

function timeAgo(value: string | Date) {
  const mins = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / 60000));
  if (mins < 60) return `${mins}m`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.round(hours / 24)}d`;
}

export function MobileSDEBugs({ bugs }: MobileSDEBugsProps) {
  const [selected, setSelected] = useState<SdeBug | null>(null);
  const critical = bugs.filter((bug) => bug.severity === "CRITICAL" && !["RESOLVED", "CLOSED"].includes(bug.status));

  return (
    <main className="mobile-page min-h-screen bg-[var(--bg)] px-4 pt-4 text-[var(--text)]">
      <header>
        <h1 className="font-heading text-lg font-extrabold">Bugs</h1>
        <p className="mt-1 text-[11px] text-[var(--muted)]">{bugs.length} reported issues</p>
      </header>

      {critical.length > 0 ? (
        <button className="mt-4 w-full rounded-2xl border border-[#FF3B30]/30 bg-[#FF3B30]/15 px-4 py-3 text-left text-xs font-bold text-[#ff8f8a]">
          {critical.length} critical bugs need immediate attention.
        </button>
      ) : null}

      <section className="mt-4 space-y-3">
        {bugs.map((bug) => (
          <button
            key={bug.id}
            type="button"
            onClick={() => setSelected(bug)}
            className="w-full rounded-[16px] border border-white/10 bg-[var(--card)] p-4 text-left"
            style={{ borderLeft: `3px solid ${severityColor(bug.severity)}` }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="line-clamp-2 font-heading text-[13px] font-bold">{bug.title}</h2>
                <p className="mt-2 text-[11px] text-[var(--muted)]">Reported by {bug.reporter?.name ?? "Team"} · {timeAgo(bug.createdAt)} ago</p>
              </div>
              <span className="rounded-full px-2 py-1 text-[10px] font-bold" style={{ background: `${severityColor(bug.severity)}22`, color: severityColor(bug.severity) }}>
                {bug.severity}
              </span>
            </div>
          </button>
        ))}
      </section>

      <MobileSheet isOpen={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.title ?? "Bug"} height="full">
        {selected ? (
          <div className="space-y-4 text-sm text-zinc-300">
            <p className="leading-6">{selected.description}</p>
            <div className="rounded-xl bg-white/[0.03] p-3">
              <p className="text-[10px] text-zinc-500">Steps to reproduce</p>
              <p className="mt-2 text-xs leading-5">{selected.stepsToRepro || "No steps supplied."}</p>
            </div>
            <select className="h-11 w-full rounded-xl border border-white/10 bg-[#0f0f14] px-3 text-sm">
              {["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((status) => (
                <option key={status} value={status}>{status.replace(/_/g, " ")}</option>
              ))}
            </select>
            <button className="h-11 w-full rounded-xl bg-[#7C6FFF] font-heading text-sm font-bold text-white">Update bug</button>
          </div>
        ) : null}
      </MobileSheet>
    </main>
  );
}
