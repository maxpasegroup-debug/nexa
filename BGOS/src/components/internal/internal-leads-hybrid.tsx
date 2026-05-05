"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Filter,
  Pencil,
  PlayCircle,
  RefreshCw,
  Shield,
  Trash2,
  UserPlus,
} from "lucide-react";

type TeamMember = { id: string; name: string; email: string; role: string };
type InternalLead = {
  id: string;
  name: string;
  company: string | null;
  phone: string | null;
  email: string | null;
  bdmStatus: string;
  score: number;
  value: number;
  notes: string | null;
  managementNotes: string | null;
  assignedTo: string | null;
  assignee: TeamMember | null;
  onboardingSession: { id: string; status: string; completenessScore: number } | null;
  callNotes?: Array<{ content: string }>;
  createdAt: string;
  updatedAt: string;
};

type DateMode = "all" | "date" | "week" | "month";

const statuses = ["NEW", "CONTACTED", "FOLLOW_UP", "ONBOARDING", "LOST"];
const editableStatuses = ["NEW", "CONTACTED", "FOLLOW_UP", "LOST"];

function metaValue(lead: InternalLead, label: string) {
  const prefix = `${label}:`;
  const source = [lead.managementNotes, lead.notes, ...(lead.callNotes ?? []).map((note) => note.content)]
    .filter(Boolean)
    .join("\n");
  const line = source.split(/\r?\n/).find((item) => item.toLowerCase().startsWith(prefix.toLowerCase()));
  return line?.slice(prefix.length).trim() ?? "";
}

function statusTone(status: string) {
  if (status === "ONBOARDING" || status === "COLLECTING") return "border-[#7C6FFF]/30 bg-[#7C6FFF]/10 text-[#c6c1ff]";
  if (status === "LOST") return "border-[#FF6B6B]/30 bg-[#FF6B6B]/10 text-[#ffb4b4]";
  if (status === "FOLLOW_UP") return "border-[#F5A623]/30 bg-[#F5A623]/10 text-[#ffd899]";
  if (status === "CONTACTED") return "border-[#22D9A0]/30 bg-[#22D9A0]/10 text-[#8ff0cf]";
  return "border-white/10 bg-white/5 text-zinc-300";
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusTone(status)}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0d0d12] p-4">
      <p className="text-xs font-bold uppercase text-zinc-500">{label}</p>
      <p className="mt-2 font-heading text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

export function InternalLeadsHybrid() {
  const [leads, setLeads] = useState<InternalLead[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [dateMode, setDateMode] = useState<DateMode>("all");
  const [date, setDate] = useState("");
  const [week, setWeek] = useState("");
  const [month, setMonth] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [selected, setSelected] = useState<InternalLead | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    assignedTo: "",
    bdmStatus: "NEW",
    value: "0",
    country: "",
    state: "",
    district: "",
    notes: "",
    managementNotes: "",
  });

  const load = useCallback(async function load() {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (status) params.set("status", status);
    if (dateMode === "date" && date) params.set("date", date);
    if (dateMode === "week" && week) params.set("week", week);
    if (dateMode === "month" && month) params.set("month", month);
    if (country.trim()) params.set("country", country.trim());
    if (state.trim()) params.set("state", state.trim());
    if (district.trim()) params.set("district", district.trim());
    const response = await fetch(`/api/internal/leads?${params.toString()}`, { cache: "no-store" });
    if (!response.ok) return;
    const data = (await response.json()) as { leads: InternalLead[]; team: TeamMember[] };
    setLeads(data.leads);
    setTeam(data.team);
  }, [country, date, dateMode, district, month, search, state, status, week]);

  useEffect(() => {
    void load();
  }, [load]);

  function open(lead: InternalLead) {
    setSelected(lead);
    setForm({
      name: lead.name,
      company: lead.company ?? "",
      phone: lead.phone ?? "",
      email: lead.email ?? "",
      assignedTo: lead.assignedTo ?? "",
      bdmStatus: lead.bdmStatus,
      value: String(lead.value ?? 0),
      country: metaValue(lead, "Country"),
      state: metaValue(lead, "State"),
      district: metaValue(lead, "District"),
      notes: lead.notes ?? "",
      managementNotes: lead.managementNotes ?? "",
    });
  }

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return leads;
    return leads.filter((lead) =>
      [lead.company, lead.name, lead.phone, lead.email].some((value) =>
        String(value ?? "").toLowerCase().includes(query),
      ),
    );
  }, [leads, search]);

  const stats = useMemo(() => {
    const onboarding = leads.filter((lead) => lead.bdmStatus === "ONBOARDING" || lead.onboardingSession).length;
    const unassigned = leads.filter((lead) => !lead.assignedTo).length;
    const fresh = leads.filter((lead) => Date.now() - new Date(lead.createdAt).getTime() <= 86_400_000).length;
    return { total: leads.length, onboarding, unassigned, fresh };
  }, [leads]);

  async function save(bossMode = false) {
    if (!selected) return;
    setSaving(true);
    const response = await fetch(`/api/internal/leads/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        value: Number(form.value) || 0,
        bossMode,
        note: bossMode ? "Boss mode started from BGOS leads management." : "Boss updated lead from BGOS leads management.",
      }),
    });
    setSaving(false);
    if (!response.ok) return;
    setSelected(null);
    await load();
  }

  async function deleteLead() {
    if (!selected) return;
    if (!window.confirm(`Delete ${selected.company ?? selected.name} entirely from BGOS? This removes related notes, activities, onboarding session, and lead records.`)) return;
    const response = await fetch(`/api/internal/leads/${selected.id}`, { method: "DELETE" });
    if (!response.ok) return;
    setSelected(null);
    await load();
  }

  async function startOnboarding(lead: InternalLead) {
    const response = await fetch(`/api/internal/leads/${lead.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "start_onboarding" }),
    });
    if (!response.ok) return;
    window.location.href = `/internal/onboarding/${lead.id}`;
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-[#13131c] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-lg font-bold">Hybrid BGOS leads management</h2>
          <p className="mt-1 text-sm text-zinc-500">Filter, assign, edit, delete, and start onboarding from one Boss control surface.</p>
        </div>
        <button onClick={() => void load()} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-zinc-300">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        <Metric label="Total leads" value={stats.total} />
        <Metric label="Today / 24h" value={stats.fresh} />
        <Metric label="Onboarding" value={stats.onboarding} />
        <Metric label="Unassigned" value={stats.unassigned} />
      </div>

      <div className="mt-5 rounded-xl border border-white/10 bg-[#0d0d12] p-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase text-zinc-500">
          <Filter className="h-4 w-4" /> Lead filters
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-4">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, phone, company..." className="rounded-xl border border-white/10 bg-[#08080c] px-4 py-3 text-sm text-white outline-none focus:border-[#7C6FFF]" />
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-white/10 bg-[#08080c] px-4 py-3 text-sm text-white outline-none focus:border-[#7C6FFF]">
            <option value="">All statuses</option>
            {statuses.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={dateMode} onChange={(event) => setDateMode(event.target.value as DateMode)} className="rounded-xl border border-white/10 bg-[#08080c] px-4 py-3 text-sm text-white outline-none focus:border-[#7C6FFF]">
            <option value="all">All dates</option>
            <option value="date">Single date</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
          </select>
          {dateMode === "date" ? <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="rounded-xl border border-white/10 bg-[#08080c] px-4 py-3 text-sm text-white outline-none focus:border-[#7C6FFF]" /> : null}
          {dateMode === "week" ? <input type="week" value={week} onChange={(event) => setWeek(event.target.value)} className="rounded-xl border border-white/10 bg-[#08080c] px-4 py-3 text-sm text-white outline-none focus:border-[#7C6FFF]" /> : null}
          {dateMode === "month" ? <input type="month" value={month} onChange={(event) => setMonth(event.target.value)} className="rounded-xl border border-white/10 bg-[#08080c] px-4 py-3 text-sm text-white outline-none focus:border-[#7C6FFF]" /> : null}
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <input value={country} onChange={(event) => setCountry(event.target.value)} placeholder="Country" className="rounded-xl border border-white/10 bg-[#08080c] px-4 py-3 text-sm text-white outline-none focus:border-[#7C6FFF]" />
          <input value={state} onChange={(event) => setState(event.target.value)} placeholder="State" className="rounded-xl border border-white/10 bg-[#08080c] px-4 py-3 text-sm text-white outline-none focus:border-[#7C6FFF]" />
          <input value={district} onChange={(event) => setDistrict(event.target.value)} placeholder="District" className="rounded-xl border border-white/10 bg-[#08080c] px-4 py-3 text-sm text-white outline-none focus:border-[#7C6FFF]" />
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="text-xs uppercase text-zinc-500">
            <tr className="border-b border-white/10">
              <th className="px-4 py-3">Date</th>
              <th>Name</th>
              <th>BDM</th>
              <th>Status of the lead</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead) => (
              <tr key={lead.id} className="border-b border-white/5">
                <td className="px-4 py-4 text-zinc-400"><CalendarDays className="mr-2 inline h-4 w-4 text-zinc-600" />{new Date(lead.createdAt).toLocaleDateString("en-IN")}</td>
                <td className="font-bold text-white">{lead.name}<br /><span className="text-xs font-normal text-zinc-500">{lead.company ?? lead.phone ?? lead.email ?? "-"}</span></td>
                <td className="text-zinc-400">{lead.assignee?.name ?? "Unassigned"}</td>
                <td><StatusBadge status={lead.onboardingSession?.status ?? lead.bdmStatus} /></td>
                <td>
                  <div className="flex gap-2">
                    <button onClick={() => open(lead)} className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold"><Pencil className="h-3 w-3" />Edit</button>
                    <button onClick={() => void startOnboarding(lead)} className="inline-flex items-center gap-1 rounded-lg bg-[#7C6FFF]/20 px-3 py-1.5 text-xs font-bold text-[#c6c1ff]"><PlayCircle className="h-3 w-3" />Onboard</button>
                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length ? <tr><td colSpan={5} className="py-10 text-center text-zinc-500">No leads found.</td></tr> : null}
          </tbody>
        </table>
      </div>

      {selected ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-5">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-[#101016] p-6 text-white">
            <h3 className="font-heading text-xl font-bold">Lead form and controls</h3>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company" className="rounded-xl border border-white/10 bg-[#13131c] px-3 py-2 text-sm" />
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Contact" className="rounded-xl border border-white/10 bg-[#13131c] px-3 py-2 text-sm" />
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="rounded-xl border border-white/10 bg-[#13131c] px-3 py-2 text-sm" />
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="rounded-xl border border-white/10 bg-[#13131c] px-3 py-2 text-sm" />
              <select value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} className="rounded-xl border border-white/10 bg-[#13131c] px-3 py-2 text-sm">
                <option value="">Unassigned</option>
                {team.filter((member) => member.role === "BDM").map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
              </select>
              <select value={form.bdmStatus} onChange={(e) => setForm({ ...form, bdmStatus: e.target.value })} className="rounded-xl border border-white/10 bg-[#13131c] px-3 py-2 text-sm">
                {editableStatuses.map((item) => <option key={item}>{item}</option>)}
              </select>
              <input value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} type="number" placeholder="Value" className="rounded-xl border border-white/10 bg-[#13131c] px-3 py-2 text-sm" />
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="Country" className="rounded-xl border border-white/10 bg-[#13131c] px-3 py-2 text-sm" />
              <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="State" className="rounded-xl border border-white/10 bg-[#13131c] px-3 py-2 text-sm" />
              <input value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} placeholder="District" className="rounded-xl border border-white/10 bg-[#13131c] px-3 py-2 text-sm" />
            </div>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Lead notes" className="mt-3 min-h-20 w-full rounded-xl border border-white/10 bg-[#13131c] px-3 py-2 text-sm" />
            <textarea value={form.managementNotes} onChange={(e) => setForm({ ...form, managementNotes: e.target.value })} placeholder="Boss notes" className="mt-3 min-h-24 w-full rounded-xl border border-white/10 bg-[#13131c] px-3 py-2 text-sm" />
            <div className="mt-5 flex flex-wrap justify-end gap-3">
              <button onClick={() => setSelected(null)} className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-zinc-300">Cancel</button>
              <button onClick={() => void deleteLead()} className="inline-flex items-center gap-2 rounded-xl bg-[#FF6B6B] px-4 py-2 text-sm font-bold text-black"><Trash2 className="h-4 w-4" />Delete</button>
              <button onClick={() => void save(false)} disabled={saving} className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-black disabled:opacity-50">Save</button>
              <button onClick={() => void save(true)} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-[#F5A623] px-4 py-2 text-sm font-bold text-black disabled:opacity-50"><Shield className="h-4 w-4" />Save in Boss mode</button>
              <button onClick={() => void startOnboarding(selected)} className="inline-flex items-center gap-2 rounded-xl bg-[#7C6FFF] px-4 py-2 text-sm font-bold text-white"><UserPlus className="h-4 w-4" />Start onboarding</button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
