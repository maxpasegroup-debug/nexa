"use client";

import { useEffect, useState } from "react";

import { AddManagementLead } from "@/components/internal/add-management-lead";

type ManagementLead = {
  id: string;
  company?: string | null;
  name: string;
  bdmStatus: string;
  slaBreached: boolean;
  createdAt: string;
  lastContactedAt?: string | null;
  assignee?: { name: string; bdmSubType?: string | null; bdmCode?: string | null } | null;
  managementNotes?: string | null;
  callNotes?: Array<{ content: string }>;
};

function hoursSince(date: string) {
  return Math.floor((Date.now() - new Date(date).getTime()) / 3_600_000);
}

function noteValue(lead: ManagementLead, label: string) {
  const prefix = `${label}:`;
  const text = lead.callNotes?.map((note) => note.content).join("\n") ?? "";
  const line = text.split(/\r?\n/).find((item) => item.toLowerCase().startsWith(prefix.toLowerCase()));
  return line?.slice(prefix.length).trim() ?? "-";
}

function assigneeBadge(assignee: ManagementLead["assignee"]) {
  if (!assignee) return null;
  const isMf = assignee.bdmSubType === "MF";
  return (
    <span className={`mt-1 inline-flex w-fit rounded-full border px-2 py-0.5 text-[10px] font-bold ${
      isMf
        ? "border-[#F59E0B]/30 bg-[#F59E0B]/10 text-[#F59E0B]"
        : "border-[#7C6FFF]/30 bg-[#7C6FFF]/10 text-[#c8c2ff]"
    }`}
    >
      {isMf ? "MF Owner" : "BDM"}
      {assignee.bdmCode ? ` · ${assignee.bdmCode}` : ""}
    </span>
  );
}

export function ManagementLeadsSection() {
  const [leads, setLeads] = useState<ManagementLead[]>([]);

  async function load() {
    const response = await fetch("/api/leads?leadType=MANAGEMENT&limit=50", {
      cache: "no-store",
    });
    const data = (await response.json().catch(() => ({}))) as {
      leads?: ManagementLead[];
    };
    setLeads(data.leads ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <section className="rounded-2xl border border-white/10 bg-[#13131c] p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-lg font-bold">Management leads</h2>
          <p className="mt-1 text-sm text-zinc-500">Owner-supplied leads with 1-hour SLA.</p>
        </div>
        <AddManagementLead onCreated={() => void load()} />
      </div>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="text-xs uppercase text-zinc-500">
            <tr className="border-b border-white/10">
              <th className="pb-3">Company</th>
              <th className="pb-3">Industry</th>
              <th className="pb-3">Assigned BDM</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">SLA</th>
              <th className="pb-3">Last contact logged</th>
              <th className="pb-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => {
              const hours = hoursSince(lead.createdAt);
              const contacted = Boolean(lead.lastContactedAt);
              const tone = contacted && hours <= 1 ? "text-[#22D9A0]" : hours >= 4 ? "text-[#FF6B6B]" : "text-[#F5A623]";
              return (
                <tr key={lead.id} className="border-b border-white/5">
                  <td className="py-3 font-bold text-white">{lead.company ?? lead.name}</td>
                  <td className="text-zinc-400">{noteValue(lead, "Industry")}</td>
                  <td>
                    <div className="flex flex-col text-zinc-400">
                      <span>{lead.assignee?.name ?? "Unassigned"}</span>
                      {assigneeBadge(lead.assignee)}
                    </div>
                  </td>
                  <td>{lead.bdmStatus}</td>
                  <td className={tone}>{hours < 1 ? "<1h" : `${hours}h`}</td>
                  <td className="text-zinc-500">{lead.lastContactedAt ? new Date(lead.lastContactedAt).toLocaleDateString("en-IN") : "No contact"}</td>
                  <td><button type="button" onClick={() => alert(`${lead.company ?? lead.name}\n\n${lead.managementNotes ?? "No management notes."}`)} className="text-[#7C6FFF]">Open</button></td>
                </tr>
              );
            })}
            {!leads.length ? (
              <tr><td colSpan={6} className="py-8 text-center text-zinc-500">No management leads yet.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
