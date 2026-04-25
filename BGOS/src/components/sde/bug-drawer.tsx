"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import type { BugStatus, SdeBug } from "@/components/sde/types";

type BugDrawerProps = {
  bugId: string | null;
  onClose: () => void;
  bugs?: SdeBug[];
  onBugUpdate?: (bug: SdeBug) => void;
};

const statusOptions: BugStatus[] = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "WONT_FIX"];
const severityClass = {
  CRITICAL: "bg-[#FF6B6B]/20 text-[#FF6B6B] border-[#FF6B6B]/40",
  HIGH: "bg-[#FF6B6B]/10 text-[#FF6B6B] border-[#FF6B6B]/30",
  MEDIUM: "bg-[#F5A623]/10 text-[#F5A623] border-[#F5A623]/30",
  LOW: "bg-white/5 text-zinc-400 border-white/10",
};

export function BugDrawer({ bugId, onClose, bugs = [], onBugUpdate }: BugDrawerProps) {
  const [bug, setBug] = useState<SdeBug | null>(null);
  const [status, setStatus] = useState<BugStatus>("OPEN");
  const [resolution, setResolution] = useState("");
  const [timeline, setTimeline] = useState<Array<{ action: string; createdAt: string }>>([]);

  useEffect(() => {
    const found = bugs.find((item) => item.id === bugId) ?? null;
    setBug(found);
    setStatus(found?.status ?? "OPEN");
    setResolution(found?.resolution ?? "");
    setTimeline(found ? [{ action: `Bug ${found.status}`, createdAt: String(found.createdAt) }] : []);
  }, [bugId, bugs]);

  async function save() {
    if (!bugId) return;
    if (status === "RESOLVED" && !resolution.trim()) return;
    const response = await fetch(`/api/sde/bugs/${bugId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, resolution }),
    });
    if (response.ok) {
      const data = (await response.json()) as { bug: SdeBug };
      setBug(data.bug);
      onBugUpdate?.(data.bug);
    }
  }

  if (!bugId) return null;

  return (
    <>
      <button type="button" className="fixed inset-0 z-40 bg-black/50" onClick={onClose} aria-label="Close bug drawer" />
      <aside className="fixed bottom-0 right-0 top-0 z-50 w-full max-w-[420px] overflow-y-auto border-l border-white/10 bg-[#0d0d11] p-5 text-white">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold">Bug detail</h2>
          <button type="button" onClick={onClose} className="rounded-lg border border-white/10 p-2"><X className="h-4 w-4" /></button>
        </div>
        {bug ? (
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <span className={`rounded-full border px-3 py-1 text-xs font-bold ${severityClass[bug.severity]}`}>{bug.severity}</span>
              <select value={status} onChange={(event) => setStatus(event.target.value as BugStatus)} className="rounded-lg border border-white/10 bg-[#070709] px-3 py-2 text-sm">
                {statusOptions.map((item) => <option key={item}>{item}</option>)}
              </select>
            </div>
            <div>
              <h3 className="text-base font-bold">{bug.title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{bug.description}</p>
            </div>
            <section>
              <h4 className="font-heading text-sm font-bold">Steps to reproduce</h4>
              <p className="mt-2 whitespace-pre-line rounded-xl border border-white/10 bg-[#13131c] p-3 text-sm text-zinc-400">{bug.stepsToRepro ?? "No steps provided."}</p>
            </section>
            {status === "RESOLVED" || bug.resolution ? (
              <section>
                <h4 className="font-heading text-sm font-bold">Resolution</h4>
                <textarea value={resolution} onChange={(event) => setResolution(event.target.value)} rows={4} className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-[#070709] p-3 text-sm outline-none focus:border-[#7C6FFF]" />
              </section>
            ) : null}
            <button type="button" onClick={() => void save()} className="w-full rounded-lg bg-[#7C6FFF] px-3 py-2 text-sm font-bold">Save</button>
            <section>
              <h4 className="font-heading text-sm font-bold">Timeline</h4>
              <div className="mt-3 space-y-2">
                {timeline.map((item, index) => (
                  <div key={`${item.action}-${index}`} className="rounded-lg border border-white/10 bg-[#13131c] p-3 text-xs text-zinc-500">
                    {item.action} · {new Date(item.createdAt).toLocaleString("en-IN")}
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : <p className="text-sm text-zinc-500">Bug not found.</p>}
      </aside>
    </>
  );
}
