"use client";

import { FormEvent, useEffect, useState } from "react";

import { toast } from "@/components/ui/toast";

type Bdm = { id: string; name: string; email: string };

const sources = [
  { label: "Management network", value: "MANAGEMENT_NETWORK" },
  { label: "Management referral", value: "MANAGEMENT_REFERRAL" },
  { label: "Management partner", value: "MANAGEMENT_PARTNER" },
];

export function AddManagementLead({ onCreated }: { onCreated?: () => void }) {
  const [open, setOpen] = useState(false);
  const [bdms, setBdms] = useState<Bdm[]>([]);
  const [loading, setLoading] = useState(false);
  const [decision, setDecision] = useState("");

  useEffect(() => {
    if (!open) return;
    void fetch("/api/internal/employees?role=BDM", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { employees?: Bdm[] }) => setBdms(data.employees ?? []))
      .catch(() => setBdms([]));
  }, [open]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leadType: "MANAGEMENT",
        createdByType: "OWNER",
        company: String(form.get("company") ?? ""),
        name: String(form.get("name") ?? ""),
        phone: String(form.get("phone") ?? ""),
        email: String(form.get("email") ?? ""),
        location: String(form.get("location") ?? ""),
        industry: String(form.get("industry") ?? ""),
        companySize: String(form.get("teamSize") ?? ""),
        source: String(form.get("source") ?? "MANAGEMENT_NETWORK"),
        leadSource: String(form.get("source") ?? "MANAGEMENT_NETWORK"),
        assignedTo: String(form.get("assignedTo") ?? "") || undefined,
        managementNotes: String(form.get("managementNotes") ?? ""),
        ownerVisible: true,
        initialNotes: [
          `Location: ${String(form.get("location") ?? "")}`,
          `Industry: ${String(form.get("industry") ?? "")}`,
          `Team size: ${String(form.get("teamSize") ?? "")}`,
        ].join("\n"),
      }),
    });
    setLoading(false);

    const data = (await response.json().catch(() => ({}))) as {
      error?: string;
      assignmentDecision?: { bdmName: string; reason: string };
    };
    if (!response.ok) {
      toast.error(data.error ?? "Could not create management lead");
      return;
    }
    const text = data.assignmentDecision
      ? `Assigned to ${data.assignmentDecision.bdmName} because ${data.assignmentDecision.reason}`
      : "Management lead created.";
    setDecision(text);
    toast.success("Management lead created");
    onCreated?.();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-xl bg-[#22D9A0] px-4 py-2 text-sm font-bold text-black"
      >
        Add management lead
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 bg-black/60">
          <aside className="ml-auto h-full w-full max-w-[520px] overflow-y-auto border-l border-white/10 bg-[#101016] p-5 text-white">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-xl font-bold">Add management lead</h2>
              <button onClick={() => setOpen(false)} className="text-zinc-400">Close</button>
            </div>
            {decision ? (
              <div className="mt-4 rounded-xl border border-[#22D9A0]/25 bg-[#22D9A0]/10 p-3 text-sm text-[#22D9A0]">
                {decision}
              </div>
            ) : null}
            <form onSubmit={submit} className="mt-5 space-y-4">
              {[
                ["company", "Company name"],
                ["name", "Contact name"],
                ["phone", "Phone"],
                ["email", "Email"],
                ["location", "Location"],
                ["industry", "Industry"],
                ["teamSize", "Approx team size"],
              ].map(([name, label]) => (
                <label key={name} className="block">
                  <span className="text-xs font-bold text-zinc-400">{label}</span>
                  <input name={name} required={["company", "name", "phone"].includes(name)} className="mt-1 w-full rounded-xl border border-white/10 bg-[#0e0e13] px-4 py-3 text-sm outline-none focus:border-[#22D9A0]" />
                </label>
              ))}
              <label className="block">
                <span className="text-xs font-bold text-zinc-400">Assignment</span>
                <select name="assignedTo" defaultValue="" className="mt-1 w-full rounded-xl border border-white/10 bg-[#0e0e13] px-4 py-3 text-sm">
                  <option value="">Let NEXA decide</option>
                  {bdms.map((bdm) => <option key={bdm.id} value={bdm.id}>{bdm.name}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-bold text-zinc-400">Source</span>
                <select name="source" className="mt-1 w-full rounded-xl border border-white/10 bg-[#0e0e13] px-4 py-3 text-sm">
                  {sources.map((source) => <option key={source.value} value={source.value}>{source.label}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-bold text-zinc-400">Context for the BDM</span>
                <textarea name="managementNotes" rows={5} className="mt-1 w-full rounded-xl border border-white/10 bg-[#0e0e13] px-4 py-3 text-sm" />
              </label>
              <button disabled={loading} className="w-full rounded-xl bg-[#22D9A0] px-4 py-3 text-sm font-extrabold text-black disabled:opacity-60">
                {loading ? "Creating..." : "Create management lead"}
              </button>
            </form>
          </aside>
        </div>
      ) : null}
    </>
  );
}
