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
  assignee?: { name: string } | null;
  managementNotes?: string | null;
};

function daysSince(date: string) {
  return Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
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
              <th className="pb-3">Assigned to</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Days assigned</th>
              <th className="pb-3">Last contact</th>
              <th className="pb-3">Signal</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => {
              const age = daysSince(lead.createdAt);
              const tone = lead.slaBreached
                ? "text-[#FF6B6B]"
                : lead.bdmStatus === "ONBOARDING"
                  ? "text-[#22D9A0]"
                  : !lead.lastContactedAt && age >= 3
                    ? "text-[#F5A623]"
                    : "text-zinc-300";
              return (
                <tr key={lead.id} className="border-b border-white/5">
                  <td className="py-3 font-bold text-white">{lead.company ?? lead.name}</td>
                  <td className="text-zinc-400">{lead.assignee?.name ?? "Unassigned"}</td>
                  <td>{lead.bdmStatus}</td>
                  <td>{age}</td>
                  <td className="text-zinc-500">{lead.lastContactedAt ? new Date(lead.lastContactedAt).toLocaleDateString("en-IN") : "No contact"}</td>
                  <td className={tone}>{lead.slaBreached ? "SLA breached" : lead.bdmStatus === "ONBOARDING" ? "Converted" : age === 0 ? "Assigned today" : age >= 3 && !lead.lastContactedAt ? "No contact 3+ days" : "On track"}</td>
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
