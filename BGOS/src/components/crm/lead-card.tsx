"use client";

import type { DragEvent } from "react";

import type { CrmLead } from "@/components/crm/types";

type LeadCardProps = {
  lead: CrmLead;
  onDragStart: (event: DragEvent<HTMLDivElement>, lead: CrmLead) => void;
  onClick: (lead: CrmLead) => void;
};

function scoreColor(score: number) {
  if (score <= 40) return "#FF6B6B";
  if (score <= 70) return "#F5A623";
  return "#22D9A0";
}

function initials(name?: string | null) {
  if (!name) return "?";

  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

function getFollowUpMeta(lead: CrmLead) {
  if (!lead.followUpDate) {
    return null;
  }

  const date = new Date(lead.followUpDate);
  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const startOfFollowUp = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const isClosed = lead.status === "WON" || lead.status === "LOST";
  const isOverdue = startOfFollowUp < startOfToday && !isClosed;
  const isToday = startOfFollowUp.getTime() === startOfToday.getTime();

  return {
    label: date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    }),
    className: isOverdue
      ? "text-[#FF6B6B]"
      : isToday
        ? "text-[#F5A623]"
        : "text-zinc-500",
    isOverdue,
  };
}

export function LeadCard({ lead, onDragStart, onClick }: LeadCardProps) {
  const color = scoreColor(lead.score);
  const followUp = getFollowUpMeta(lead);
  const contact = lead.phone || lead.email;

  return (
    <div
      data-lead-id={lead.id}
      draggable
      onDragStart={(event) => onDragStart(event, lead)}
      onClick={() => onClick(lead)}
      className={`mb-2 cursor-grab rounded-[10px] border border-[rgba(255,255,255,0.07)] bg-[#13131c] p-[14px] transition duration-200 hover:-translate-y-px hover:border-[rgba(124,111,255,0.3)] active:cursor-grabbing ${
        followUp?.isOverdue ? "border-l-4 border-l-[#FF6B6B]" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 flex-1 truncate text-[13px] font-bold text-white">
          {lead.name}
        </h3>
        <div className="w-12 shrink-0 text-right">
          <span
            className="text-xs font-bold"
            style={{ color }}
            title={lead.scoreReason ?? undefined}
          >
            {lead.score}
          </span>
          <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full"
              style={{ width: `${lead.score}%`, backgroundColor: color }}
            />
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-1">
        {lead.company ? (
          <p className="truncate text-xs text-zinc-500">{lead.company}</p>
        ) : null}
        {contact ? <p className="truncate text-xs text-zinc-500">{contact}</p> : null}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-zinc-400">
          {lead.source}
        </span>
        {lead.value > 0 ? (
          <span className="text-xs font-semibold text-[#22D9A0]">
            {formatCurrency(lead.value)}
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#7C6FFF] text-[9px] font-bold text-white">
            {initials(lead.assignee?.name)}
          </span>
          <span className="truncate text-[11px] text-zinc-500">
            {lead.assignee?.name ?? "Unassigned"}
          </span>
        </div>
        {followUp ? (
          <span className={`shrink-0 text-[11px] font-medium ${followUp.className}`}>
            {followUp.label}
          </span>
        ) : null}
      </div>
    </div>
  );
}
