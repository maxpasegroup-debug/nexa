"use client";

import { useEffect, useMemo, useState } from "react";

import { AddLeadForm } from "@/components/bdm/add-lead-form";
import { SimpleLeadCard } from "@/components/bdm/simple-lead-card";
import type { BDMLeadStatus, LeadNoteView, SimpleLead } from "@/components/bdm/simple-lead-types";
import { MobileSheet } from "@/components/mobile/mobile-sheet";

type MobileBDMLeadsProps = {
  user: { name: string };
};

const statuses: Array<{ value: BDMLeadStatus | "ALL" | "COLD"; label: string }> = [
  { value: "ALL", label: "All" },
  { value: "CONTACTED", label: "🟣 Contacted" },
  { value: "FOLLOW_UP", label: "🟡 Follow Up" },
  { value: "NEW", label: "🔵 New" },
  { value: "ONBOARDING", label: "🟢 Onboarding" },
  { value: "LOST", label: "🔴 Lost" },
];

function isCold(lead: SimpleLead) {
  return (lead.daysSinceContact ?? 0) >= 3 && lead.bdmStatus !== "LOST" && lead.bdmStatus !== "ONBOARDING";
}

export function MobileBDMLeads({ user }: MobileBDMLeadsProps) {
  const [leads, setLeads] = useState<SimpleLead[]>([]);
  const [filter, setFilter] = useState<BDMLeadStatus | "ALL" | "COLD">("ALL");
  const [sheetOpen, setSheetOpen] = useState(false);

  async function load() {
    const response = await fetch("/api/bdm/leads", { cache: "no-store" });
    if (!response.ok) return;
    const data = (await response.json()) as { leads: SimpleLead[] };
    setLeads(data.leads);
  }

  useEffect(() => {
    void load();
  }, []);

  const counts = useMemo(() => {
    const result: Record<string, number> = { ALL: leads.length };
    statuses.forEach((status) => {
      if (status.value !== "ALL" && status.value !== "COLD") {
        result[status.value] = leads.filter((lead) => lead.bdmStatus === status.value).length;
      }
    });
    return result;
  }, [leads]);

  const coldCount = useMemo(() => leads.filter(isCold).length, [leads]);
  const visible = useMemo(() => {
    if (filter === "ALL") return leads;
    if (filter === "COLD") return leads.filter(isCold);
    return leads.filter((lead) => lead.bdmStatus === filter);
  }, [filter, leads]);

  function upsertLead(lead: SimpleLead) {
    setLeads((current) => current.some((item) => item.id === lead.id) ? current.map((item) => item.id === lead.id ? { ...item, ...lead } : item) : [lead, ...current]);
  }

  async function saveStatus(lead: SimpleLead, bdmStatus: BDMLeadStatus) {
    const response = await fetch(`/api/leads/${lead.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bdmStatus }),
    });
    if (!response.ok) return;
    const data = (await response.json()) as { lead: SimpleLead };
    upsertLead(data.lead);
  }

  function noteAdded(leadId: string, note: LeadNoteView) {
    setLeads((current) => current.map((lead) => lead.id === leadId ? { ...lead, callNotes: [note, ...lead.callNotes] } : lead));
  }

  return (
    <main className="mobile-page min-h-screen bg-[#070709] px-4 py-4 text-white">
      <header className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="font-heading text-xl font-extrabold">My Leads</h1>
          <span className="rounded-full bg-[#7C6FFF]/15 px-2 py-1 text-xs font-bold text-[#c6c1ff]">{leads.length}</span>
        </div>
        <button type="button" onClick={() => setSheetOpen(true)} className="rounded-xl bg-[#22D9A0] px-3 py-2 text-xs font-extrabold text-black">＋ Add</button>
      </header>

      {coldCount > 0 ? <button type="button" onClick={() => setFilter("COLD")} className="mb-3 w-full rounded-xl bg-[#F5A623]/12 px-4 py-3 text-left text-xs font-bold text-[#F5A623]">⚠️ {coldCount} leads need follow-up →</button> : null}
      <div className="scroll-x-hidden mb-4 flex gap-2">
        {statuses.map((status) => <button key={status.value} onClick={() => setFilter(status.value)} className={`shrink-0 rounded-full border px-3 py-2 text-xs font-bold ${filter === status.value ? "border-[#7C6FFF] bg-[#7C6FFF]/15 text-[#c6c1ff]" : "border-white/[0.08] text-[#6B6878]"}`}>{status.label} {status.value === "ALL" ? leads.length : counts[status.value] ?? ""}</button>)}
      </div>
      <div className="space-y-3">{visible.map((lead) => <SimpleLeadCard key={lead.id} lead={lead} bdmName={user.name} onStatusChange={(item, status) => void saveStatus(item, status)} onNoteAdded={noteAdded} onStartOnboarding={() => { window.location.href = `/bdm/onboarding/${lead.id}`; }} />)}</div>
      <button type="button" onClick={() => setSheetOpen(true)} className="fixed bottom-[88px] right-5 z-40 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#22D9A0] text-2xl font-bold text-black shadow-2xl">＋</button>
      <MobileSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)} title="Add lead" height="full">
        <AddLeadForm onSuccess={(lead) => { upsertLead(lead); setSheetOpen(false); }} onClose={() => setSheetOpen(false)} />
      </MobileSheet>
    </main>
  );
}
