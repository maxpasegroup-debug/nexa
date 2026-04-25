"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  Bell,
  CalendarClock,
  Check,
  Phone,
  SlidersHorizontal,
} from "lucide-react";

import { useToast } from "@/components/ui/toast";
import type { CrmLead, LeadStatus } from "@/components/crm/types";

type BdmLead = CrmLead & {
  activitiesCount?: number;
  lastActivityDate?: string | Date | null;
};

type MyPipelineProps = {
  leads: BdmLead[];
  onLeadClick: (lead: BdmLead) => void;
  onStatusChange: (lead: BdmLead, status: LeadStatus) => void;
};

type CallOutcome =
  | "ANSWERED_INTERESTED"
  | "ANSWERED_NOT_INTERESTED"
  | "ANSWERED_CALLBACK"
  | "NO_ANSWER"
  | "BUSY"
  | "WRONG_NUMBER";

const statuses: Array<{ value: LeadStatus | "ALL"; label: string }> = [
  { value: "ALL", label: "All" },
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "DEMO", label: "Demo" },
  { value: "PROPOSAL", label: "Proposal" },
  { value: "WON", label: "Won" },
  { value: "LOST", label: "Lost" },
];

const nextStatus: Partial<Record<LeadStatus, LeadStatus>> = {
  NEW: "CONTACTED",
  CONTACTED: "DEMO",
  DEMO: "PROPOSAL",
  PROPOSAL: "WON",
};

const statusLabels: Record<LeadStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  DEMO: "Demo",
  PROPOSAL: "Proposal",
  WON: "Won",
  LOST: "Lost",
};

const callOutcomes: Array<{ value: CallOutcome; label: string }> = [
  { value: "ANSWERED_INTERESTED", label: "Interested" },
  { value: "ANSWERED_NOT_INTERESTED", label: "Not interested" },
  { value: "ANSWERED_CALLBACK", label: "Callback" },
  { value: "NO_ANSWER", label: "No answer" },
  { value: "BUSY", label: "Busy" },
  { value: "WRONG_NUMBER", label: "Wrong number" },
];

function scoreColor(score: number) {
  if (score <= 40) return "#FF6B6B";
  if (score <= 70) return "#F5A623";
  return "#22D9A0";
}

function formatDate(value?: string | Date | null) {
  if (!value) return "No follow-up";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
}

function followUpTone(value?: string | Date | null) {
  if (!value) return "text-zinc-500";
  const date = new Date(value);
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startTomorrow = new Date(startToday);
  startTomorrow.setDate(startTomorrow.getDate() + 1);

  if (date < startToday) return "text-[#FF6B6B]";
  if (date < startTomorrow) return "text-[#F5A623]";
  return "text-zinc-500";
}

function compareFollowUp(a: BdmLead, b: BdmLead) {
  const aTime = a.followUpDate ? new Date(a.followUpDate).getTime() : Number.MAX_SAFE_INTEGER;
  const bTime = b.followUpDate ? new Date(b.followUpDate).getTime() : Number.MAX_SAFE_INTEGER;
  return aTime - bTime;
}

function LeadRow({
  lead,
  onLeadClick,
  onStatusChange,
}: {
  lead: BdmLead;
  onLeadClick: (lead: BdmLead) => void;
  onStatusChange: (lead: BdmLead, status: LeadStatus) => void;
}) {
  const { toast } = useToast();
  const [showCallForm, setShowCallForm] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [outcome, setOutcome] = useState<CallOutcome>("ANSWERED_INTERESTED");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [nextActionValue, setNextActionValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const moveTo = nextStatus[lead.status];

  async function submitCall() {
    setSubmitting(true);
    try {
      const response = await fetch("/api/bdm/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: lead.id,
          outcome,
          duration: duration ? Number(duration) : undefined,
          notes,
          nextAction: nextActionValue,
        }),
      });

      if (!response.ok) {
        throw new Error("Call log failed");
      }

      setShowCallForm(false);
      setDuration("");
      setNotes("");
      setNextActionValue("");
      toast("Call logged", "success");
    } catch {
      toast("Could not log call", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <article className="rounded-xl border border-white/10 bg-[#13131c] p-4 transition hover:border-[#7C6FFF]/30">
      <button
        type="button"
        onClick={() => onLeadClick(lead)}
        className="flex w-full items-start justify-between gap-4 text-left"
      >
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold text-white">{lead.name}</h3>
          <p className="mt-1 truncate text-xs text-zinc-500">
            {lead.company ?? "No company added"}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#7C6FFF]/10 px-2 py-1 text-[10px] font-bold text-[#7C6FFF]">
              {statusLabels[lead.status]}
            </span>
            <span
              className={`flex items-center gap-1 text-xs font-semibold ${followUpTone(
                lead.followUpDate,
              )}`}
            >
              <CalendarClock className="h-3.5 w-3.5" />
              {formatDate(lead.followUpDate)}
            </span>
          </div>
        </div>

        <div className="w-[68px] shrink-0 text-right">
          <p className="text-xs font-bold" style={{ color: scoreColor(lead.score) }}>
            {lead.score}
          </p>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.max(0, Math.min(100, lead.score))}%`,
                backgroundColor: scoreColor(lead.score),
              }}
            />
          </div>
        </div>
      </button>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
        {lead.phone ? (
          <a
            href={`tel:${lead.phone}`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-300 hover:text-white"
          >
            <Phone className="h-4 w-4 text-[#22D9A0]" />
            {lead.phone}
          </a>
        ) : (
          <span className="text-xs text-zinc-600">No phone</span>
        )}

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowCallForm((value) => !value)}
            className="rounded-lg border border-white/10 p-2 text-zinc-400 hover:border-[#7C6FFF]/40 hover:text-white"
            title="Log call"
          >
            <Phone className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent("bdm:set-reminder", { detail: { leadId: lead.id } }),
              )
            }
            className="rounded-lg border border-white/10 p-2 text-zinc-400 hover:border-[#7C6FFF]/40 hover:text-white"
            title="Set reminder"
          >
            <Bell className="h-4 w-4" />
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowStatusMenu((value) => !value)}
              className="rounded-lg border border-white/10 p-2 text-zinc-400 hover:border-[#7C6FFF]/40 hover:text-white"
              title="Update status"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
            {showStatusMenu && moveTo ? (
              <button
                type="button"
                onClick={() => {
                  onStatusChange(lead, moveTo);
                  setShowStatusMenu(false);
                }}
                className="absolute right-0 top-10 z-10 w-40 rounded-xl border border-white/10 bg-[#0d0d11] px-3 py-2 text-left text-xs font-semibold text-white shadow-2xl"
              >
                Move to {statusLabels[moveTo]}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {showCallForm ? (
        <div className="mt-4 rounded-xl border border-white/10 bg-[#0e0e13] p-3">
          <div className="grid grid-cols-2 gap-2">
            {callOutcomes.map((item) => (
              <label
                key={item.value}
                className="flex items-center gap-2 rounded-lg border border-white/10 px-2 py-2 text-[11px] text-zinc-300"
              >
                <input
                  type="radio"
                  checked={outcome === item.value}
                  onChange={() => setOutcome(item.value)}
                  className="accent-[#7C6FFF]"
                />
                {item.label}
              </label>
            ))}
          </div>
          <input
            type="number"
            min="0"
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
            placeholder="Duration in minutes"
            className="mt-3 w-full rounded-lg border border-white/10 bg-[#070709] px-3 py-2 text-sm text-white outline-none focus:border-[#7C6FFF]"
          />
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Call notes"
            rows={3}
            className="mt-3 w-full resize-none rounded-lg border border-white/10 bg-[#070709] px-3 py-2 text-sm text-white outline-none focus:border-[#7C6FFF]"
          />
          <input
            value={nextActionValue}
            onChange={(event) => setNextActionValue(event.target.value)}
            placeholder="Next action"
            className="mt-3 w-full rounded-lg border border-white/10 bg-[#070709] px-3 py-2 text-sm text-white outline-none focus:border-[#7C6FFF]"
          />
          <button
            type="button"
            onClick={submitCall}
            disabled={submitting}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#7C6FFF] px-3 py-2 text-sm font-bold text-white disabled:opacity-60"
          >
            <Check className="h-4 w-4" />
            {submitting ? "Logging..." : "Log call"}
          </button>
        </div>
      ) : null}
    </article>
  );
}

export function MyPipeline({ leads, onLeadClick, onStatusChange }: MyPipelineProps) {
  const [activeStatus, setActiveStatus] = useState<LeadStatus | "ALL">("ALL");
  const [sortBy, setSortBy] = useState<"followUp" | "score">("followUp");

  const counts = useMemo(
    () =>
      statuses.reduce<Record<string, number>>((acc, status) => {
        acc[status.value] =
          status.value === "ALL"
            ? leads.length
            : leads.filter((lead) => lead.status === status.value).length;
        return acc;
      }, {}),
    [leads],
  );

  const grouped = useMemo(() => {
    const visible = leads
      .filter((lead) => activeStatus === "ALL" || lead.status === activeStatus)
      .sort((a, b) =>
        sortBy === "score" ? b.score - a.score : compareFollowUp(a, b),
      );

    return statuses
      .filter((status): status is { value: LeadStatus; label: string } => status.value !== "ALL")
      .map((status) => ({
        ...status,
        leads: visible.filter((lead) => lead.status === status.value),
      }))
      .filter((group) => activeStatus === "ALL" || group.value === activeStatus);
  }, [activeStatus, leads, sortBy]);

  return (
    <section className="rounded-2xl border border-white/10 bg-[#0d0d11] p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {statuses.map((status) => (
            <button
              key={status.value}
              type="button"
              onClick={() => setActiveStatus(status.value)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                activeStatus === status.value
                  ? "bg-[#7C6FFF] text-white"
                  : "bg-white/5 text-zinc-500 hover:text-white"
              }`}
            >
              {status.label} {counts[status.value] ?? 0}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() =>
            setSortBy((value) => (value === "followUp" ? "score" : "followUp"))
          }
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-zinc-300 hover:text-white"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {sortBy === "followUp" ? "By follow-up date" : "By score"}
        </button>
      </div>

      <div className="mt-5 space-y-5">
        {grouped.map((group) => (
          <div key={group.value}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-heading text-sm font-bold text-white">
                {group.label}
              </h2>
              <span className="rounded-full bg-white/5 px-2 py-1 text-[11px] text-zinc-500">
                {group.leads.length}
              </span>
            </div>
            <div className="space-y-3">
              {group.leads.length > 0 ? (
                group.leads.map((lead) => (
                  <LeadRow
                    key={lead.id}
                    lead={lead}
                    onLeadClick={onLeadClick}
                    onStatusChange={onStatusChange}
                  />
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-white/10 py-8 text-center text-sm text-zinc-600">
                  No leads here
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export type { BdmLead };
