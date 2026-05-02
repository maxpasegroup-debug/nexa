"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Clock, RefreshCw, UserCog } from "lucide-react";

type Status =
  | "NEW"
  | "BDM_ASSIGNED"
  | "BDM_SUBMITTED"
  | "SDE_BUILDING"
  | "BOSS_PREVIEWING"
  | "TRIAL_ACTIVE";

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: "BDM" | "SDE" | string;
};

type PipelineLead = {
  id: string;
  status: Status;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  employeeCount: string;
  businessType: string;
  source: string;
  challenge: string | null;
  plan: string | null;
  bdmNotes: string | null;
  sdeNotes: string | null;
  createdAt: string;
  updatedAt: string;
  bdmSubmittedAt: string | null;
  sdeDeliveredAt: string | null;
  trialStartedAt: string | null;
  trialEndsAt: string | null;
  convertedAt: string | null;
  assignedBDM: TeamMember | null;
  assignedSDE: TeamMember | null;
  trialAmount: number | null;
};

type PipelineData = {
  grouped: Record<Status, PipelineLead[]>;
  counts: Record<Status, number>;
  metrics: {
    newLeadsToday: number;
    trialsActive: number;
    convertedThisMonth: number;
    averageTimeToDelivery: number;
  };
  team: TeamMember[];
};

const columns: Array<{ status: Status; title: string; hint: string }> = [
  { status: "NEW", title: "NEW", hint: "Captured from landing page" },
  { status: "BDM_ASSIGNED", title: "BDM ASSIGNED", hint: "Discovery call pending" },
  { status: "BDM_SUBMITTED", title: "BDM SUBMITTED", hint: "Brief sent to tech" },
  { status: "SDE_BUILDING", title: "SDE BUILDING", hint: "Workspace in progress" },
  { status: "BOSS_PREVIEWING", title: "BOSS PREVIEWING", hint: "Preview link opened" },
  { status: "TRIAL_ACTIVE", title: "TRIAL ACTIVE", hint: "Autopay trial live" },
];

function hoursSince(value: string) {
  return Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 3_600_000));
}

function timeAgo(value: string) {
  const hours = hoursSince(value);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function countdown(value: string | null) {
  if (!value) return "No due date";
  const hours = Math.ceil((new Date(value).getTime() - Date.now()) / 3_600_000);
  if (hours <= 0) return "Due now";
  if (hours < 24) return `${hours}h left`;
  return `${Math.ceil(hours / 24)}d left`;
}

function inr(value: number | null) {
  if (!value) return "-";
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

function dueFromSubmitted(value: string | null) {
  if (!value) return null;
  const due = new Date(value);
  due.setHours(due.getHours() + 24);
  return due.toISOString();
}

function timeline(lead: PipelineLead) {
  return [
    { label: "Lead captured", value: lead.createdAt },
    lead.assignedBDM ? { label: `Assigned to BDM ${lead.assignedBDM.name}`, value: lead.createdAt } : null,
    lead.bdmSubmittedAt ? { label: "BDM submitted brief", value: lead.bdmSubmittedAt } : null,
    lead.assignedSDE ? { label: `Assigned to SDE ${lead.assignedSDE.name}`, value: lead.bdmSubmittedAt ?? lead.updatedAt } : null,
    lead.sdeDeliveredAt ? { label: "Workspace delivered", value: lead.sdeDeliveredAt } : null,
    lead.status === "BOSS_PREVIEWING" ? { label: "Boss opened preview", value: lead.updatedAt } : null,
    lead.trialStartedAt ? { label: "Trial activated", value: lead.trialStartedAt } : null,
    lead.convertedAt ? { label: "Converted to paid", value: lead.convertedAt } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;
}

function LeadCard({
  lead,
  onOpen,
  onAssign,
}: {
  lead: PipelineLead;
  onOpen: (lead: PipelineLead) => void;
  onAssign: (lead: PipelineLead) => void;
}) {
  const staleNew = lead.status === "NEW" && hoursSince(lead.createdAt) >= 2 && !lead.assignedBDM;

  return (
    <button
      type="button"
      onClick={() => onOpen(lead)}
      className={`w-full rounded-xl border bg-[#0d0d12] p-4 text-left transition hover:border-[#7C6FFF]/50 ${
        staleNew ? "border-red-500/60" : "border-white/10"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold text-white">{lead.companyName}</h3>
          <p className="mt-1 truncate text-xs text-zinc-500">{lead.name} · {lead.phone}</p>
          <span
            className={`mt-2 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${
              lead.source === "marketplace"
                ? "border-[#7C6FFF]/30 bg-[#7C6FFF]/10 text-[#c6c1ff]"
                : "border-[#22D9A0]/30 bg-[#22D9A0]/10 text-[#22D9A0]"
            }`}
          >
            {lead.source === "marketplace" ? "Marketplace" : "Website"}
          </span>
        </div>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onAssign(lead);
          }}
          className="rounded-lg border border-white/10 p-2 text-zinc-400 hover:text-white"
          title="Manually assign"
        >
          <UserCog className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 space-y-2 text-xs text-zinc-400">
        {lead.status === "NEW" ? <p>Captured {timeAgo(lead.createdAt)}</p> : null}
        {lead.status === "BDM_ASSIGNED" ? <p>BDM: {lead.assignedBDM?.name ?? "Unassigned"} · {timeAgo(lead.updatedAt)}</p> : null}
        {lead.status === "BDM_SUBMITTED" ? <p>{lead.plan ?? "Plan pending"} · {lead.bdmSubmittedAt ? timeAgo(lead.bdmSubmittedAt) : timeAgo(lead.updatedAt)}</p> : null}
        {lead.status === "SDE_BUILDING" ? <p>SDE: {lead.assignedSDE?.name ?? "Unassigned"} · {countdown(dueFromSubmitted(lead.bdmSubmittedAt))}</p> : null}
        {lead.status === "BOSS_PREVIEWING" ? <p>Last viewed {timeAgo(lead.updatedAt)}</p> : null}
        {lead.status === "TRIAL_ACTIVE" ? <p>{lead.plan ?? "Plan"} · {inr(lead.trialAmount)} · ends {lead.trialEndsAt ? new Date(lead.trialEndsAt).toLocaleDateString("en-IN") : "-"}</p> : null}
      </div>
    </button>
  );
}

export function OnboardingPipeline({
  initialSourceFilter,
}: {
  initialSourceFilter?: "marketplace";
}) {
  const [data, setData] = useState<PipelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PipelineLead | null>(null);
  const [assigning, setAssigning] = useState<PipelineLead | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ assignedBDMId: "", assignedSDEId: "", status: "", note: "" });

  const load = useCallback(async function load() {
    setLoading(true);
    const query = initialSourceFilter ? `?source=${initialSourceFilter}` : "";
    const response = await fetch(`/api/internal/onboarding-pipeline${query}`, { cache: "no-store" });
    setLoading(false);
    if (!response.ok) return;
    setData((await response.json()) as PipelineData);
  }, [initialSourceFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const liveCount = useMemo(
    () => columns.reduce((sum, column) => sum + (data?.counts[column.status] ?? 0), 0),
    [data],
  );

  async function saveAssignment() {
    if (!assigning) return;
    setSaving(true);
    const payload: Record<string, string> = {};
    if (form.assignedBDMId !== "") payload.assignedBDMId = form.assignedBDMId;
    if (form.assignedSDEId !== "") payload.assignedSDEId = form.assignedSDEId;
    if (form.status) payload.status = form.status;
    if (form.note.trim()) payload.note = form.note.trim();

    const response = await fetch(`/api/internal/onboarding-pipeline/${assigning.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!response.ok) return;
    setAssigning(null);
    setForm({ assignedBDMId: "", assignedSDEId: "", status: "", note: "" });
    await load();
  }

  const bdms = data?.team.filter((member) => member.role === "BDM") ?? [];
  const sdes = data?.team.filter((member) => member.role === "SDE") ?? [];

  return (
    <section className="rounded-2xl border border-white/10 bg-[#13131c] p-6">
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-heading text-lg font-bold">Onboarding pipeline</h2>
            <span className="rounded-full bg-[#7C6FFF]/15 px-3 py-1 text-xs font-bold text-[#c6c1ff]">
              {liveCount} live
            </span>
          </div>
          <p className="mt-1 text-sm text-zinc-500">Track every captured lead from NEXA chat to trial activation.</p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-zinc-300"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="mb-5 grid gap-4 md:grid-cols-4">
        {[
          ["New leads today", data?.metrics.newLeadsToday ?? 0],
          ["Trials active", data?.metrics.trialsActive ?? 0],
          ["Converted this month", data?.metrics.convertedThisMonth ?? 0],
          ["Avg delivery", `${data?.metrics.averageTimeToDelivery ?? 0}h`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-white/10 bg-[#0d0d12] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{label}</p>
            <p className="mt-3 font-heading text-2xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {columns.map((column) => (
          <div key={column.status} className="w-[280px] shrink-0 rounded-xl border border-white/10 bg-[#09090d] p-3">
            <div className="mb-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xs font-bold tracking-[0.16em] text-white">{column.title}</h3>
                <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-zinc-400">
                  {data?.counts[column.status] ?? 0}
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-600">{column.hint}</p>
            </div>
            <div className="space-y-3">
              {loading ? (
                <div className="h-28 animate-pulse rounded-xl bg-white/10" />
              ) : (data?.grouped[column.status] ?? []).length > 0 ? (
                data!.grouped[column.status].map((lead) => (
                  <LeadCard key={lead.id} lead={lead} onOpen={setSelected} onAssign={(item) => {
                    setAssigning(item);
                    setForm({
                      assignedBDMId: item.assignedBDM?.id ?? "",
                      assignedSDEId: item.assignedSDE?.id ?? "",
                      status: item.status,
                      note: "",
                    });
                  }} />
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-white/10 p-5 text-center text-sm text-zinc-600">
                  No leads
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {selected ? (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-white/10 bg-[#101016] p-6 text-white shadow-2xl">
          <button onClick={() => setSelected(null)} className="float-right text-sm text-zinc-500 hover:text-white">Close</button>
          <h3 className="font-heading text-xl font-bold">{selected.companyName}</h3>
          <p className="mt-1 text-sm text-zinc-500">{selected.name} · {selected.email} · {selected.phone}</p>
          <div className="mt-6 space-y-4">
            {timeline(selected).map((item) => (
              <div key={`${item.label}-${item.value}`} className="flex gap-3">
                <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#7C6FFF]/15 text-[#c6c1ff]">
                  <Clock className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  <p className="mt-1 text-xs text-zinc-500">{new Date(item.value).toLocaleString("en-IN")}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-zinc-400">
            <p><span className="text-zinc-200">Challenge:</span> {selected.challenge ?? "-"}</p>
            <p className="mt-2"><span className="text-zinc-200">BDM notes:</span> {selected.bdmNotes ?? "-"}</p>
            <p className="mt-2"><span className="text-zinc-200">SDE notes:</span> {selected.sdeNotes ?? "-"}</p>
          </div>
        </div>
      ) : null}

      {assigning ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#13131c] p-6 text-white">
            <h3 className="font-heading text-xl font-bold">Manual intervention</h3>
            <p className="mt-1 text-sm text-zinc-500">{assigning.companyName}</p>
            <div className="mt-5 grid gap-4">
              <label className="text-sm text-zinc-300">
                BDM
                <select value={form.assignedBDMId} onChange={(event) => setForm({ ...form, assignedBDMId: event.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-[#0d0d12] px-4 py-3 text-white">
                  <option value="">Unassigned</option>
                  {bdms.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
                </select>
              </label>
              <label className="text-sm text-zinc-300">
                SDE
                <select value={form.assignedSDEId} onChange={(event) => setForm({ ...form, assignedSDEId: event.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-[#0d0d12] px-4 py-3 text-white">
                  <option value="">Unassigned</option>
                  {sdes.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
                </select>
              </label>
              <label className="text-sm text-zinc-300">
                Status
                <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-[#0d0d12] px-4 py-3 text-white">
                  {["NEW", "BDM_ASSIGNED", "BDM_CONTACTED", "BDM_SUBMITTED", "SDE_BUILDING", "SDE_DELIVERED", "BOSS_PREVIEWING", "TRIAL_ACTIVE", "CONVERTED", "CANCELLED", "LOST"].map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </label>
              <textarea value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} placeholder="Owner note..." className="min-h-24 rounded-xl border border-white/10 bg-[#0d0d12] px-4 py-3 text-sm text-white outline-none" />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setAssigning(null)} className="rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-zinc-300">Cancel</button>
              <button onClick={() => void saveAssignment()} disabled={saving} className="rounded-xl bg-[#7C6FFF] px-4 py-3 text-sm font-bold text-white disabled:opacity-60">
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
