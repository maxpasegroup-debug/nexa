"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";

import { useToast } from "@/components/ui/toast";
import { AddLeadForm } from "./add-lead-form";
import { SimpleLeadCard } from "./simple-lead-card";
import { BDMLeadStatus, LeadNoteView, SimpleLead } from "./simple-lead-types";

type LeadListStatus = Exclude<BDMLeadStatus, "ONBOARDING">;
type ActiveFilter = "ALL" | LeadListStatus | "COLD";

type LeadListProps = {
  sourceFilter?: "marketplace";
  title?: string;
  subtitle?: string;
  bdmName?: string;
};

const STATUS_FILTERS: Array<{ value: LeadListStatus; label: string; color: string }> = [
  { value: "NEW", label: "New", color: "#6B6878" },
  { value: "CONTACTED", label: "Contacted", color: "#7C6FFF" },
  { value: "FOLLOW_UP", label: "Follow Up", color: "#F5A623" },
  { value: "LOST", label: "Lost", color: "#FF6B6B" },
];

function statusLabel(status: BDMLeadStatus) {
  return STATUS_FILTERS.find((item) => item.value === status)?.label ?? "Onboarding";
}

function normalizedSource(lead: SimpleLead) {
  return String(lead.source ?? "").toLowerCase();
}

function SourceBadge({ lead }: { lead: SimpleLead }) {
  const source = normalizedSource(lead);
  if (source === "marketplace") {
    return (
      <span className="mt-2 inline-flex w-fit rounded-full border border-[#7C6FFF]/30 bg-[#7C6FFF]/10 px-2.5 py-1 text-[11px] font-bold text-[#c6c1ff]">
        Marketplace{lead.agentInterest ? ` - ${lead.agentInterest}` : ""}
      </span>
    );
  }
  if (source === "landing_page" || source === "website") {
    return (
      <span className="mt-2 inline-flex w-fit rounded-full border border-[#22D9A0]/30 bg-[#22D9A0]/10 px-2.5 py-1 text-[11px] font-bold text-[#22D9A0]">
        Website enquiry
      </span>
    );
  }
  return null;
}

function isCold(lead: SimpleLead) {
  return (lead.daysSinceContact ?? 0) >= 3 && lead.bdmStatus !== "LOST" && lead.bdmStatus !== "ONBOARDING";
}

function emptyMessage(filter: ActiveFilter) {
  if (filter === "FOLLOW_UP") return "All caught up. No follow-ups pending.";
  if (filter === "LOST") return "No lost leads. Great work!";
  return "No leads yet. Add your first lead →";
}

export function LeadList({
  sourceFilter,
  title = "My leads",
  subtitle,
  bdmName,
}: LeadListProps) {
  const { toast } = useToast();
  const [leads, setLeads] = useState<SimpleLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filter, setFilter] = useState<ActiveFilter>("ALL");
  const [search, setSearch] = useState("");
  const [exitingLeadIds, setExitingLeadIds] = useState<string[]>([]);

  const loadLeads = useCallback(async function loadLeads() {
    setLoading(true);
    const params = new URLSearchParams({ excludeOnboarding: "true" });
    if (sourceFilter) params.set("source", sourceFilter);
    const response = await fetch(`/api/bdm/leads?${params.toString()}`, { cache: "no-store" });
    setLoading(false);
    if (!response.ok) return;
    const data = (await response.json()) as { leads: SimpleLead[] };
    setLeads(data.leads);
  }, [sourceFilter]);

  useEffect(() => {
    void loadLeads();
  }, [loadLeads]);

  const counts = useMemo(() => {
    const visible = leads.filter((lead) => lead.bdmStatus !== "ONBOARDING");
    return {
      all: visible.length,
      NEW: visible.filter((lead) => lead.bdmStatus === "NEW").length,
      CONTACTED: visible.filter((lead) => lead.bdmStatus === "CONTACTED").length,
      FOLLOW_UP: visible.filter((lead) => lead.bdmStatus === "FOLLOW_UP").length,
      LOST: visible.filter((lead) => lead.bdmStatus === "LOST").length,
    };
  }, [leads]);

  const coldCount = useMemo(() => leads.filter(isCold).length, [leads]);

  const visibleLeads = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return leads.filter((lead) => {
      if (lead.bdmStatus === "ONBOARDING") return false;
      const matchesFilter =
        filter === "ALL" ? true : filter === "COLD" ? isCold(lead) : lead.bdmStatus === filter;
      const matchesSearch =
        !normalized ||
        [lead.company, lead.name, lead.phone, lead.email]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalized));
      return matchesFilter && matchesSearch;
    });
  }, [filter, leads, search]);

  function upsertLead(lead: SimpleLead) {
    setLeads((current) =>
      current.some((item) => item.id === lead.id)
        ? current.map((item) => (item.id === lead.id ? { ...item, ...lead } : item))
        : [lead, ...current],
    );
  }

  async function saveStatus(lead: SimpleLead, bdmStatus: BDMLeadStatus, reason?: string) {
    const previous = lead;
    setLeads((current) =>
      current.map((item) =>
        item.id === lead.id
          ? {
              ...item,
              bdmStatus,
              lostReason: bdmStatus === "LOST" ? reason ?? item.lostReason : item.lostReason,
              lastContactedAt:
                bdmStatus === "CONTACTED" || bdmStatus === "FOLLOW_UP"
                  ? new Date().toISOString()
                  : item.lastContactedAt,
            }
          : item,
      ),
    );

    const response = await fetch(`/api/leads/${lead.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bdmStatus, lostReason: reason }),
    });

    if (!response.ok) {
      setLeads((current) => current.map((item) => (item.id === lead.id ? previous : item)));
      toast("Could not update lead status", "error");
      return;
    }

    const data = (await response.json()) as { lead: SimpleLead };
    upsertLead(data.lead);
    toast(`Status updated to ${statusLabel(bdmStatus)}`, "success");
  }

  function handleStatusChange(lead: SimpleLead, status: BDMLeadStatus, reason?: string) {
    void saveStatus(lead, status, reason);
  }

  function handleNoteAdded(leadId: string, note: LeadNoteView) {
    setLeads((current) =>
      current.map((lead) =>
        lead.id === leadId
          ? {
              ...lead,
              lastContactedAt: new Date().toISOString(),
              daysSinceContact: 0,
              callNotes: [note, ...lead.callNotes],
            }
          : lead,
      ),
    );
  }

  async function startOnboarding(lead: SimpleLead) {
    const statusResponse = await fetch(`/api/leads/${lead.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bdmStatus: "ONBOARDING" }),
    });
    if (!statusResponse.ok) {
      toast("Could not move lead to onboarding", "error");
      return;
    }

    if (!lead.onboardingSessionId) {
      const response = await fetch("/api/onboarding/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: lead.id }),
      });
      if (!response.ok) {
        toast("Could not start onboarding", "error");
        return;
      }
    }

    setExitingLeadIds((current) => [...current, lead.id]);
    window.setTimeout(() => {
      setLeads((current) => current.filter((item) => item.id !== lead.id));
      setExitingLeadIds((current) => current.filter((id) => id !== lead.id));
      window.dispatchEvent(new Event("bgos:onboarding-updated"));
    }, 300);
    toast(`${lead.company || lead.name} moved to onboarding. Continue in the Onboarding tab →`, "success", {
      href: "/bdm/onboarding",
      variant: "onboarding",
    });
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="font-heading text-2xl font-bold text-white">{title}</h1>
            {subtitle ? <p className="mt-1 text-sm text-zinc-500">{subtitle}</p> : null}
          </div>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-bold text-zinc-300">
            {counts.all}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#22D9A0] px-4 py-2.5 text-sm font-extrabold text-black"
        >
          Add lead <Plus className="h-4 w-4" />
        </button>
      </section>

      {coldCount > 0 ? (
        <button
          type="button"
          onClick={() => setFilter("COLD")}
          className="w-full rounded-2xl border border-[#F5A623]/30 bg-[#F5A623]/10 px-4 py-3 text-left text-sm font-bold text-[#F5A623]"
        >
          {coldCount} leads need immediate follow-up - you have not contacted them in 3+ days.
        </button>
      ) : null}

      <section className="rounded-2xl border border-white/10 bg-[#13131c] p-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter("ALL")}
            className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
              filter === "ALL" ? "border-white bg-white text-black" : "border-white/10 text-zinc-400"
            }`}
          >
            All ({counts.all})
          </button>
          {STATUS_FILTERS.map((status) => (
            <button
              key={status.value}
              type="button"
              onClick={() => setFilter(status.value)}
              className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
                filter === status.value ? "border-white bg-white text-black" : "border-white/10 text-zinc-400"
              }`}
            >
              <span style={{ color: status.color }}>●</span> {status.label} ({counts[status.value]})
            </button>
          ))}
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by company or contact..."
            className="w-full rounded-xl border border-white/10 bg-[#0e0e13] py-2.5 pl-10 pr-3 text-sm text-white outline-none focus:border-[#7C6FFF]"
          />
        </div>
      </section>

      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-[#13131c] p-8 text-sm text-zinc-400">
          Loading leads...
        </div>
      ) : visibleLeads.length > 0 ? (
        <section className="grid gap-3">
          {visibleLeads.map((lead) => (
            <SimpleLeadCard
              key={lead.id}
              lead={lead}
              onStatusChange={handleStatusChange}
              onNoteAdded={handleNoteAdded}
              onStartOnboarding={(item) => startOnboarding(item)}
              isExiting={exitingLeadIds.includes(lead.id)}
              sourceBadge={<SourceBadge lead={lead} />}
              bdmName={bdmName}
            />
          ))}
        </section>
      ) : (
        <section className="rounded-2xl border border-white/10 bg-[#13131c] p-8 text-center">
          <p className="text-sm text-zinc-400">{emptyMessage(filter)}</p>
          {filter === "ALL" ? (
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="mt-4 rounded-xl bg-[#22D9A0] px-4 py-2 text-sm font-extrabold text-black"
            >
              Add lead
            </button>
          ) : null}
        </section>
      )}

      {drawerOpen ? <AddLeadForm onSuccess={upsertLead} onClose={() => setDrawerOpen(false)} /> : null}

      <style jsx global>{`
        .lead-card-exit {
          animation: slideOut 0.3s ease forwards;
        }

        @keyframes slideOut {
          0% {
            opacity: 1;
            transform: translateX(0);
            max-height: 300px;
          }
          50% {
            opacity: 0;
            transform: translateX(40px);
          }
          100% {
            opacity: 0;
            max-height: 0;
            padding: 0;
            margin: 0;
            overflow: hidden;
          }
        }
      `}</style>
    </div>
  );
}
