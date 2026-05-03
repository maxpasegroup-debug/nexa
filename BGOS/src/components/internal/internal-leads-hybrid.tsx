"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PlayCircle, RefreshCw, Shield, UserPlus } from "lucide-react";

type TeamMember = { id: string; name: string; email: string; role: string };
type InternalLead = {
  id: string;
  name: string;
  company: string | null;
  phone: string | null;
  email: string | null;
  status: string;
  bdmStatus: string;
  score: number;
  value: number;
  notes: string | null;
  managementNotes: string | null;
  assignedTo: string | null;
  assignee: TeamMember | null;
  onboardingSession: { id: string; status: string; completenessScore: number } | null;
  updatedAt: string;
};

export function InternalLeadsHybrid() {
  const [leads, setLeads] = useState<InternalLead[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<InternalLead | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    assignedTo: "",
    status: "NEW",
    bdmStatus: "NEW",
    value: "0",
    notes: "",
    managementNotes: "",
  });

  const load = useCallback(async function load() {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    const response = await fetch(`/api/internal/leads?${params.toString()}`, { cache: "no-store" });
    if (!response.ok) return;
    const data = (await response.json()) as { leads: InternalLead[]; team: TeamMember[] };
    setLeads(data.leads);
    setTeam(data.team);
  }, [search]);

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
      status: lead.status,
      bdmStatus: lead.bdmStatus,
      value: String(lead.value ?? 0),
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
        note: bossMode ? "Boss mode started from internal leads hybrid table." : "Boss updated lead from internal leads hybrid table.",
      }),
    });
    setSaving(false);
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
    await load();
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-[#13131c] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-lg font-bold">Hybrid leads control</h2>
          <p className="mt-1 text-sm text-zinc-500">Boss can edit, assign, status-update, and start onboarding on behalf of BDM.</p>
        </div>
        <button onClick={() => void load()} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-zinc-300">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>
      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search leads..."
        className="mt-4 w-full rounded-xl border border-white/10 bg-[#0d0d12] px-4 py-3 text-sm text-white outline-none focus:border-[#7C6FFF]"
      />

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[1040px] text-left text-sm">
          <thead className="text-xs uppercase text-zinc-500">
            <tr className="border-b border-white/10">
              <th className="px-4 py-3">Company</th>
              <th>Contact</th>
              <th>BDM</th>
              <th>Lead status</th>
              <th>BDM status</th>
              <th>Onboarding</th>
              <th>Value</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead) => (
              <tr key={lead.id} className="border-b border-white/5">
                <td className="px-4 py-4 font-bold text-white">{lead.company ?? "-"}</td>
                <td className="text-zinc-300">{lead.name}<br /><span className="text-xs text-zinc-500">{lead.phone ?? lead.email ?? "-"}</span></td>
                <td className="text-zinc-400">{lead.assignee?.name ?? "Unassigned"}</td>
                <td>{lead.status}</td>
                <td>{lead.bdmStatus}</td>
                <td className="text-zinc-400">{lead.onboardingSession?.status ?? "Not started"}</td>
                <td>₹{Number(lead.value || 0).toLocaleString("en-IN")}</td>
                <td>
                  <div className="flex gap-2">
                    <button onClick={() => open(lead)} className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold">Edit</button>
                    <button onClick={() => void startOnboarding(lead)} className="inline-flex items-center gap-1 rounded-lg bg-[#7C6FFF]/20 px-3 py-1.5 text-xs font-bold text-[#c6c1ff]"><PlayCircle className="h-3 w-3" />Onboard</button>
                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length ? <tr><td colSpan={8} className="py-10 text-center text-zinc-500">No leads found.</td></tr> : null}
          </tbody>
        </table>
      </div>

      {selected ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-5">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#101016] p-6 text-white">
            <h3 className="font-heading text-xl font-bold">Manage lead</h3>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company" className="rounded-xl border border-white/10 bg-[#13131c] px-3 py-2 text-sm" />
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Contact" className="rounded-xl border border-white/10 bg-[#13131c] px-3 py-2 text-sm" />
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="rounded-xl border border-white/10 bg-[#13131c] px-3 py-2 text-sm" />
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="rounded-xl border border-white/10 bg-[#13131c] px-3 py-2 text-sm" />
              <select value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} className="rounded-xl border border-white/10 bg-[#13131c] px-3 py-2 text-sm">
                <option value="">Unassigned</option>
                {team.filter((member) => member.role === "BDM").map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
              </select>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="rounded-xl border border-white/10 bg-[#13131c] px-3 py-2 text-sm">
                {["NEW", "CONTACTED", "DEMO", "PROPOSAL", "WON", "LOST"].map((item) => <option key={item}>{item}</option>)}
              </select>
              <select value={form.bdmStatus} onChange={(e) => setForm({ ...form, bdmStatus: e.target.value })} className="rounded-xl border border-white/10 bg-[#13131c] px-3 py-2 text-sm">
                {["NEW", "CONTACTED", "FOLLOW_UP", "ONBOARDING", "LOST"].map((item) => <option key={item}>{item}</option>)}
              </select>
              <input value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} type="number" placeholder="Value" className="rounded-xl border border-white/10 bg-[#13131c] px-3 py-2 text-sm" />
            </div>
            <textarea value={form.managementNotes} onChange={(e) => setForm({ ...form, managementNotes: e.target.value })} placeholder="Boss notes" className="mt-3 min-h-24 w-full rounded-xl border border-white/10 bg-[#13131c] px-3 py-2 text-sm" />
            <div className="mt-5 flex flex-wrap justify-end gap-3">
              <button onClick={() => setSelected(null)} className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-zinc-300">Cancel</button>
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
