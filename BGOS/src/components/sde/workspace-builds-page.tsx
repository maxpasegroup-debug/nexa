"use client";

import { useState } from "react";

import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { WorkspaceBuilder } from "@/components/sde/workspace-builder";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  businessId: string;
  businessName: string;
};

type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  businessType: string;
  employeeCount: string;
  challenge: string | null;
  status: string;
  selectedPlan: string | null;
  bdmNotes: string | null;
  updatedAt: string;
  assignedBDM?: { name: string; email: string } | null;
};

function statusLabel(status: string) {
  if (status === "BDM_SUBMITTED") return { label: "Pending build", className: "bg-amber-400/10 text-amber-300" };
  if (status === "SDE_BUILDING") return { label: "In progress", className: "bg-[#7C6FFF]/10 text-[#c6c1ff]" };
  if (status === "SDE_DELIVERED") return { label: "Delivered", className: "bg-[#22D9A0]/10 text-[#22D9A0]" };
  return { label: status, className: "bg-white/5 text-zinc-400" };
}

export function WorkspaceBuildsPage({ user, initialLeads }: { user: User; initialLeads: Lead[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [selected, setSelected] = useState<Lead | null>(null);

  function markDelivered() {
    if (!selected) return;
    setLeads((current) => current.map((lead) => lead.id === selected.id ? { ...lead, status: "SDE_DELIVERED" } : lead));
  }

  return (
    <div className="min-h-screen bg-[#070709] pl-[240px] text-white">
      <Sidebar role="SDE" userName={user.name} businessName={user.businessName} />
      <Navbar title="Workspace builds" userName={user.name} role={user.role} />
      <main className="pt-[60px]">
        <div className="space-y-6 p-8">
          <section>
            <h1 className="font-heading text-2xl font-bold">Workspace builds</h1>
            <p className="mt-1 text-sm text-zinc-500">Build and deliver BGOS workspaces from BDM briefs.</p>
          </section>

          {selected ? (
            <div className="space-y-4">
              <button onClick={() => setSelected(null)} className="text-sm font-semibold text-[#7C6FFF]">← Back to builds</button>
              <WorkspaceBuilder onboardingLead={selected} onDelivered={markDelivered} />
            </div>
          ) : (
            <div className="grid gap-4">
              {leads.length > 0 ? leads.map((lead) => {
                const label = statusLabel(lead.status);
                return (
                  <button key={lead.id} onClick={() => setSelected(lead)} className="rounded-2xl border border-white/10 bg-[#13131c] p-5 text-left transition hover:border-[#7C6FFF]/40">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h2 className="font-heading text-lg font-bold">{lead.companyName}</h2>
                        <p className="mt-1 text-sm text-zinc-500">{lead.businessType} · {lead.employeeCount} employees · BDM {lead.assignedBDM?.name ?? "-"}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${label.className}`}>{label.label}</span>
                    </div>
                  </button>
                );
              }) : (
                <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-zinc-500">No workspace builds assigned yet.</div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
