"use client";

import type { DragEvent } from "react";
import { Plus } from "lucide-react";

import { LeadCard } from "@/components/crm/lead-card";
import type { CrmLead, LeadStatus } from "@/components/crm/types";

type PipelineColumnProps = {
  status: LeadStatus;
  title: string;
  leads: CrmLead[];
  color: string;
  onDrop: (status: LeadStatus, leadId: string) => void;
  onLeadClick: (lead: CrmLead) => void;
};

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export function PipelineColumn({
  status,
  title,
  leads,
  color,
  onDrop,
  onLeadClick,
}: PipelineColumnProps) {
  const totalValue = leads.reduce((sum, lead) => sum + (lead.value || 0), 0);

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const leadId = event.dataTransfer.getData("text/plain");

    if (leadId) {
      onDrop(status, leadId);
    }
  }

  function handleDragStart(event: DragEvent<HTMLDivElement>, lead: CrmLead) {
    event.dataTransfer.setData("text/plain", lead.id);
    event.dataTransfer.effectAllowed = "move";
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="w-[260px] flex-shrink-0 rounded-xl bg-[rgba(255,255,255,0.02)] p-3"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: color }}
          />
          <h2 className="truncate font-heading text-sm font-bold text-white">
            {title}
          </h2>
        </div>
        <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs font-semibold text-zinc-400">
          {leads.length}
        </span>
      </div>
      <p className="mt-2 text-xs font-semibold text-[#22D9A0]">
        {formatCurrency(totalValue)} total
      </p>

      <div className="pipeline-scroll mt-4 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
        {leads.length > 0 ? (
          leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onDragStart={handleDragStart}
              onClick={onLeadClick}
            />
          ))
        ) : (
          <div className="flex min-h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-white/10 text-center text-sm text-zinc-500">
            <Plus className="mb-2 h-4 w-4" />
            No leads here
          </div>
        )}
      </div>

      <style jsx>{`
        .pipeline-scroll {
          scrollbar-width: thin;
          scrollbar-color: #7c6fff #0e0e13;
        }

        .pipeline-scroll::-webkit-scrollbar {
          width: 6px;
        }

        .pipeline-scroll::-webkit-scrollbar-track {
          background: #0e0e13;
          border-radius: 9999px;
        }

        .pipeline-scroll::-webkit-scrollbar-thumb {
          background: #7c6fff;
          border-radius: 9999px;
        }
      `}</style>
    </div>
  );
}
