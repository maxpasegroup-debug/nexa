"use client";

import { useEffect, useMemo, useState } from "react";
import { KanbanSquare, List, Pencil, Plus, Trash2, Upload } from "lucide-react";

import { AddLeadForm } from "@/components/crm/add-lead-form";
import { CsvImport } from "@/components/crm/csv-import";
import { LeadDrawer } from "@/components/crm/lead-drawer";
import { PipelineBoard } from "@/components/crm/pipeline-board";
import type { CrmLead, LeadStatus, TeamMember } from "@/components/crm/types";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { NexaPanel } from "@/components/boss/nexa-panel";
import { useToast } from "@/components/ui/toast";

type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  businessId: string;
  businessName: string;
};

type LeadsPageProps = {
  initialLeads: CrmLead[];
  teamMembers: TeamMember[];
  currentUser: CurrentUser;
};

type Filter = "ALL" | LeadStatus | "HOT";
type SortKey =
  | "name"
  | "company"
  | "phone"
  | "status"
  | "score"
  | "assignee"
  | "followUpDate"
  | "value";

const filters: Array<{ label: string; value: Filter }> = [
  { label: "All", value: "ALL" },
  { label: "New", value: "NEW" },
  { label: "Contacted", value: "CONTACTED" },
  { label: "Demo", value: "DEMO" },
  { label: "Proposal", value: "PROPOSAL" },
  { label: "Won", value: "WON" },
  { label: "Lost", value: "LOST" },
];

const statusClass: Record<string, string> = {
  NEW: "bg-zinc-500/10 text-zinc-300 border-zinc-500/20",
  CONTACTED: "bg-[#7C6FFF]/10 text-[#b8b2ff] border-[#7C6FFF]/30",
  DEMO: "bg-[#F5A623]/10 text-[#F5A623] border-[#F5A623]/30",
  PROPOSAL: "bg-[#22D9A0]/10 text-[#22D9A0] border-[#22D9A0]/30",
  WON: "bg-[#22D9A0]/10 text-[#22D9A0] border-[#22D9A0]/30",
  LOST: "bg-[#FF6B6B]/10 text-[#FF6B6B] border-[#FF6B6B]/30",
};

function scoreColor(score: number) {
  if (score <= 40) return "#FF6B6B";
  if (score <= 70) return "#F5A623";
  return "#22D9A0";
}

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

function getComparableValue(lead: CrmLead, key: SortKey) {
  if (key === "assignee") return lead.assignee?.name ?? "";
  if (key === "followUpDate") return lead.followUpDate ? new Date(lead.followUpDate).getTime() : 0;
  return lead[key] ?? "";
}

export function LeadsPage({
  initialLeads,
  teamMembers,
  currentUser,
}: LeadsPageProps) {
  const { toast } = useToast();
  const [leads, setLeads] = useState(initialLeads);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [view, setView] = useState<"pipeline" | "list">("pipeline");
  const [activeFilter, setActiveFilter] = useState<Filter>("ALL");
  const [search, setSearch] = useState("");
  const [showAddLead, setShowAddLead] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const filter = new URLSearchParams(window.location.search).get("filter");
      if (filter === "hot") {
        setActiveFilter("HOT");
      }
    }
  }, []);

  const filteredLeads = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return leads.filter((lead) => {
      const matchesStatus =
        activeFilter === "ALL" ||
        (activeFilter === "HOT" ? lead.score > 70 : lead.status === activeFilter);
      const matchesSearch =
        !normalizedSearch ||
        [lead.name, lead.email, lead.phone, lead.company]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedSearch));

      return matchesStatus && matchesSearch;
    });
  }, [activeFilter, leads, search]);

  const sortedLeads = useMemo(() => {
    return [...filteredLeads].sort((a, b) => {
      const aValue = getComparableValue(a, sortKey);
      const bValue = getComparableValue(b, sortKey);
      const result =
        typeof aValue === "number" && typeof bValue === "number"
          ? aValue - bValue
          : String(aValue).localeCompare(String(bValue));

      return sortDirection === "asc" ? result : -result;
    });
  }, [filteredLeads, sortDirection, sortKey]);

  function upsertLead(lead: CrmLead) {
    setLeads((current) => {
      const exists = current.some((item) => item.id === lead.id);
      return exists
        ? current.map((item) => (item.id === lead.id ? { ...item, ...lead } : item))
        : [lead, ...current];
    });
  }

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection("asc");
  }

  async function deleteLead(leadId: string) {
    const response = await fetch(`/api/leads/${leadId}`, { method: "DELETE" });

    if (!response.ok) {
      toast("Unable to delete lead", "error");
      return;
    }

    setLeads((current) => current.filter((lead) => lead.id !== leadId));
    toast("Lead deleted", "success");
  }

  function askNexa() {
    window.dispatchEvent(
      new CustomEvent("nexa:send-message", {
        detail: {
          message:
            "You have 12 leads that have not been contacted in 7 days. Want me to assign them to your BDMs?",
        },
      }),
    );
  }

  return (
    <div className="min-h-screen bg-[#070709] pl-[240px] text-white md:pr-[320px]">
      <Sidebar
        role={currentUser.role}
        userName={currentUser.name}
        businessName={currentUser.businessName}
      />
      <Navbar title="Leads" userName={currentUser.name} role={currentUser.role} />

      <main className="pt-[60px]">
        <div className="space-y-6 p-8">
          <section className="flex items-center justify-between gap-4">
            <div>
              <h1 className="font-heading text-2xl font-bold tracking-normal">
                Leads
              </h1>
              <p className="mt-1 text-sm text-zinc-500">
                Manage your pipeline and sales follow-ups.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowImport((value) => !value)}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:border-[#7C6FFF]/50 hover:text-white"
              >
                <Upload className="h-4 w-4" />
                Import CSV
              </button>
              <button
                type="button"
                onClick={() => setShowAddLead(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#7C6FFF] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6b60e8]"
              >
                Add lead <Plus className="h-4 w-4" />
              </button>
              <div className="flex rounded-xl border border-white/10 bg-[#13131c] p-1">
                <button
                  type="button"
                  onClick={() => setView("pipeline")}
                  className={`rounded-lg p-2 ${view === "pipeline" ? "bg-[#7C6FFF] text-white" : "text-zinc-500"}`}
                  aria-label="Pipeline view"
                >
                  <KanbanSquare className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setView("list")}
                  className={`rounded-lg p-2 ${view === "list" ? "bg-[#7C6FFF] text-white" : "text-zinc-500"}`}
                  aria-label="List view"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>

          {showImport ? (
            <CsvImport
              onSuccess={(importedLeads) => {
                setLeads((current) => [...importedLeads, ...current]);
                setShowImport(false);
              }}
            />
          ) : null}

          <section className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setActiveFilter(filter.value)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    activeFilter === filter.value
                      ? "bg-[#7C6FFF] text-white"
                      : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search leads..."
              className="w-full max-w-xs rounded-xl border border-white/10 bg-[#13131c] px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-[#7C6FFF] focus:ring-2 focus:ring-[#7C6FFF]/20"
            />
          </section>

          {bannerVisible ? (
            <section className="rounded-2xl border border-white/10 border-l-4 border-l-[#7C6FFF] bg-[#7C6FFF]/10 p-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-[#e8e5ff]">
                  You have 12 leads that have not been contacted in 7 days. Want
                  me to assign them to your BDMs?
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={askNexa}
                    className="rounded-xl bg-[#7C6FFF] px-4 py-2 text-sm font-semibold text-white"
                  >
                    Ask NEXA
                  </button>
                  <button
                    type="button"
                    onClick={() => setBannerVisible(false)}
                    className="text-sm text-zinc-400 hover:text-white"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </section>
          ) : null}

          {view === "pipeline" ? (
            <PipelineBoard
              leads={filteredLeads}
              teamMembers={teamMembers}
              onLeadUpdate={upsertLead}
              onLeadClick={(lead) => setSelectedLeadId(lead.id)}
            />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#13131c]">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-white/10 text-xs uppercase text-zinc-500">
                  <tr>
                    {[
                      ["name", "Name"],
                      ["company", "Company"],
                      ["phone", "Phone"],
                      ["status", "Status"],
                      ["score", "Score"],
                      ["assignee", "Assigned to"],
                      ["followUpDate", "Follow-up"],
                      ["value", "Value"],
                    ].map(([key, label]) => (
                      <th
                        key={key}
                        className="cursor-pointer px-4 py-3"
                        onClick={() => handleSort(key as SortKey)}
                      >
                        {label}
                      </th>
                    ))}
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedLeads.map((lead) => {
                    const color = scoreColor(lead.score);
                    return (
                      <tr
                        key={lead.id}
                        onClick={() => setSelectedLeadId(lead.id)}
                        className="cursor-pointer border-b border-white/5 transition hover:bg-white/[0.03]"
                      >
                        <td className="px-4 py-3 font-semibold text-white">
                          {lead.name}
                        </td>
                        <td className="px-4 py-3 text-zinc-400">
                          {lead.company ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-zinc-400">
                          {lead.phone ?? "-"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full border px-2 py-1 text-xs font-bold ${statusClass[lead.status]}`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="w-20">
                            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${lead.score}%`, backgroundColor: color }}
                              />
                            </div>
                            <p className="mt-1 text-xs" style={{ color }}>
                              {lead.score}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-zinc-400">
                          {lead.assignee?.name ?? "Unassigned"}
                        </td>
                        <td className="px-4 py-3 text-zinc-400">
                          {lead.followUpDate
                            ? new Date(lead.followUpDate).toLocaleDateString("en-IN")
                            : "-"}
                        </td>
                        <td className="px-4 py-3 text-[#22D9A0]">
                          {lead.value > 0 ? formatCurrency(lead.value) : "-"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                setSelectedLeadId(lead.id);
                              }}
                              className="rounded-lg border border-white/10 p-2 text-zinc-400 hover:text-white"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                void deleteLead(lead.id);
                              }}
                              className="rounded-lg border border-white/10 p-2 text-[#FF6B6B]"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {showAddLead ? (
        <AddLeadForm
          teamMembers={teamMembers}
          onClose={() => setShowAddLead(false)}
          onSuccess={(lead) => {
            upsertLead(lead);
            setShowAddLead(false);
          }}
        />
      ) : null}
      <LeadDrawer
        leadId={selectedLeadId}
        onClose={() => setSelectedLeadId(null)}
        teamMembers={teamMembers}
        onLeadUpdate={upsertLead}
      />
      <NexaPanel businessId={currentUser.businessId} />
    </div>
  );
}
