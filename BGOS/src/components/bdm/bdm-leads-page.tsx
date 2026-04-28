"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";

import { MyPipeline, type BdmLead } from "@/components/bdm/my-pipeline";
import { NewLeadForm } from "@/components/bdm/new-lead-form";
import { NexaPanel } from "@/components/boss/nexa-panel";
import { LeadDrawer } from "@/components/crm/lead-drawer";
import type { CrmLead, LeadStatus, TeamMember } from "@/components/crm/types";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { useToast } from "@/components/ui/toast";

type BdmLeadsPageProps = {
  user: {
    id: string;
    name: string;
    role: string;
    businessId: string;
    businessName: string;
  };
  initialLeads: BdmLead[];
};

export function BdmLeadsPage({ user, initialLeads }: BdmLeadsPageProps) {
  const { toast } = useToast();
  const [leads, setLeads] = useState(initialLeads);
  const [search, setSearch] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [newLeadOpen, setNewLeadOpen] = useState(false);
  const teamMembers = useMemo<TeamMember[]>(
    () => [{ id: user.id, name: user.name, role: user.role }],
    [user.id, user.name, user.role],
  );

  const filteredLeads = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) return leads;

    return leads.filter((lead) =>
      [lead.name, lead.email, lead.phone, lead.company]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedSearch)),
    );
  }, [leads, search]);

  function upsertLead(lead: CrmLead | BdmLead) {
    setLeads((current) =>
      current.some((item) => item.id === lead.id)
        ? current.map((item) => (item.id === lead.id ? { ...item, ...lead } : item))
        : [lead as BdmLead, ...current],
    );
  }

  async function changeStatus(lead: BdmLead, status: LeadStatus) {
    setLeads((current) =>
      current.map((item) => (item.id === lead.id ? { ...item, status } : item)),
    );

    const response = await fetch(`/api/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      setLeads((current) =>
        current.map((item) =>
          item.id === lead.id ? { ...item, status: lead.status } : item,
        ),
      );
      toast("Could not update lead", "error");
      return;
    }

    const data = (await response.json()) as { lead: CrmLead };
    upsertLead(data.lead);
  }

  return (
    <div className="min-h-screen bg-[#070709] pl-[240px] text-white md:pr-[320px]">
      <Sidebar role="BDM" userName={user.name} businessName={user.businessName} />
      <Navbar title="My Leads" userName={user.name} />

      <main className="pt-[60px]">
        <div className="space-y-6 p-8">
          <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="font-heading text-2xl font-bold">My Leads</h1>
              <p className="mt-1 text-sm text-zinc-500">
                Work the leads assigned to you and keep every follow-up moving.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 md:max-w-xl md:flex-row md:items-center md:justify-end">
              <div className="relative w-full md:max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search assigned leads..."
                  className="w-full rounded-xl border border-white/10 bg-[#13131c] py-2.5 pl-10 pr-3 text-sm text-white outline-none focus:border-[#7C6FFF]"
                />
              </div>
              <button
                type="button"
                onClick={() => setNewLeadOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2ECC8A] px-4 py-2.5 text-sm font-bold text-[#0A0F0D] transition hover:bg-[#55ddb0]"
              >
                New lead
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </section>

          <MyPipeline
            leads={filteredLeads}
            onLeadClick={(lead) => setSelectedLeadId(lead.id)}
            onStatusChange={(lead, status) => void changeStatus(lead, status)}
          />
        </div>
      </main>

      <LeadDrawer
        leadId={selectedLeadId}
        onClose={() => setSelectedLeadId(null)}
        teamMembers={teamMembers}
        onLeadUpdate={upsertLead}
        allowReassign={false}
      />
      {newLeadOpen ? (
        <NewLeadForm
          currentUser={{ id: user.id, name: user.name }}
          onSuccess={upsertLead}
          onClose={() => setNewLeadOpen(false)}
        />
      ) : null}
      <NexaPanel businessId={user.businessId} initialMessage="bdm_morning_context" />
    </div>
  );
}
