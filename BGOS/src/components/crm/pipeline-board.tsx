"use client";

import { useEffect, useState } from "react";

import { PipelineColumn } from "@/components/crm/pipeline-column";
import type { CrmLead, LeadStatus, TeamMember } from "@/components/crm/types";

type PipelineBoardProps = {
  leads: CrmLead[];
  teamMembers: TeamMember[];
  onLeadUpdate: (lead: CrmLead) => void;
  onLeadClick?: (lead: CrmLead) => void;
};

const columns: Array<{
  status: LeadStatus;
  title: string;
  color: string;
}> = [
  { status: "NEW", title: "New Leads", color: "#6B6878" },
  { status: "CONTACTED", title: "Contacted", color: "#7C6FFF" },
  { status: "DEMO", title: "Demo Scheduled", color: "#F5A623" },
  { status: "PROPOSAL", title: "Proposal Sent", color: "#22D9A0" },
  { status: "WON", title: "Won", color: "#22D9A0" },
  { status: "LOST", title: "Lost", color: "#FF6B6B" },
];

export function PipelineBoard({
  leads,
  onLeadUpdate,
  onLeadClick,
}: PipelineBoardProps) {
  const [localLeads, setLocalLeads] = useState(leads);

  useEffect(() => {
    setLocalLeads(leads);
  }, [leads]);

  async function handleDrop(status: LeadStatus, leadId: string) {
    if (!leadId) {
      return;
    }

    const previousLeads = localLeads;
    const lead = localLeads.find((item) => item.id === leadId);

    if (!lead || lead.status === status) {
      return;
    }

    const optimisticLead = { ...lead, status };
    setLocalLeads((currentLeads) =>
      currentLeads.map((item) =>
        item.id === leadId ? optimisticLead : item,
      ),
    );

    const response = await fetch(`/api/leads/${leadId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      setLocalLeads(previousLeads);
      return;
    }

    const data = (await response.json()) as { lead: CrmLead };
    setLocalLeads((currentLeads) =>
      currentLeads.map((item) => (item.id === leadId ? data.lead : item)),
    );
    onLeadUpdate(data.lead);
  }

  function handleLeadClick(lead: CrmLead) {
    onLeadClick?.(lead);
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((column) => (
        <PipelineColumn
          key={column.status}
          status={column.status}
          title={column.title}
          color={column.color}
          leads={localLeads.filter((lead) => lead.status === column.status)}
          onDrop={handleDrop}
          onLeadClick={handleLeadClick}
        />
      ))}
    </div>
  );
}
