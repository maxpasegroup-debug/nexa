"use client";

import { FormEvent, useState } from "react";
import { X } from "lucide-react";

import type { BdmLead } from "@/components/bdm/my-pipeline";
import { useToast } from "@/components/ui/toast";

type NewLeadFormProps = {
  currentUser: {
    id: string;
    name: string;
  };
  onSuccess: (lead: BdmLead) => void;
  onClose: () => void;
};

type Tab = "quick" | "full";
type QuickSource = "COLD_CALL" | "REFERRAL" | "OTHER" | "INSTAGRAM";

const quickSources: Array<{ label: string; value: QuickSource }> = [
  { label: "Cold Call", value: "COLD_CALL" },
  { label: "Referral", value: "REFERRAL" },
  { label: "Walk-in", value: "OTHER" },
  { label: "Social Media", value: "INSTAGRAM" },
];

const allSources = [
  "MANUAL",
  "WEBSITE",
  "REFERRAL",
  "INSTAGRAM",
  "WHATSAPP",
  "EMAIL",
  "COLD_CALL",
  "OTHER",
] as const;

function initialFullState() {
  return {
    name: "",
    phone: "",
    email: "",
    company: "",
    source: "MANUAL",
    value: "",
    followUpDate: "",
    notes: "",
  };
}

export function NewLeadForm({
  currentUser,
  onSuccess,
  onClose,
}: NewLeadFormProps) {
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("quick");
  const [loading, setLoading] = useState(false);
  const [quick, setQuick] = useState({
    name: "",
    phone: "",
    source: "COLD_CALL" as QuickSource,
    note: "",
  });
  const [full, setFull] = useState(initialFullState);

  function normalizeLead(lead: BdmLead): BdmLead {
    return {
      ...lead,
      assignee: lead.assignee ?? {
        id: currentUser.id,
        name: currentUser.name,
        role: "BDM",
      },
      activitiesCount: lead.activitiesCount ?? 0,
      lastActivityDate: lead.lastActivityDate ?? null,
    };
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const body =
      tab === "quick"
        ? {
            name: quick.name,
            phone: quick.phone,
            source: quick.source,
            notes: quick.note,
            assignedTo: currentUser.id,
          }
        : {
            name: full.name,
            phone: full.phone,
            email: full.email,
            company: full.company,
            source: full.source,
            value: full.value ? Number(full.value) : 0,
            assignedTo: currentUser.id,
            followUpDate: full.followUpDate || undefined,
            notes: full.notes,
          };

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        toast(data.error ?? "Could not create lead", "error");
        return;
      }

      const data = (await response.json()) as { lead: BdmLead };
      onSuccess(normalizeLead(data.lead));
      toast("Lead added. NEXA is scoring them now.", "success");

      if (tab === "quick") {
        setQuick({ name: "", phone: "", source: "COLD_CALL", note: "" });
        return;
      }

      setFull(initialFullState());
      onClose();
    } catch {
      toast("Could not create lead", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80]">
      <button
        type="button"
        aria-label="Close new lead drawer"
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[400px] flex-col border-l border-white/10 bg-[#0d0d11] shadow-2xl shadow-black/50">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5">
          <div>
            <h2 className="font-heading text-lg font-bold text-white">New Lead</h2>
            <p className="mt-1 text-sm text-zinc-500">Capture a new prospect</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 p-2 text-zinc-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="border-b border-white/10 p-4">
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#13131c] p-1">
            {[
              ["quick", "Quick capture"],
              ["full", "Full profile"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setTab(value as Tab)}
                className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
                  tab === value
                    ? "bg-[#2ECC8A] text-[#0A0F0D]"
                    : "text-zinc-500 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={submit} className="flex-1 overflow-y-auto p-5">
          {tab === "quick" ? (
            <div className="space-y-4">
              <input
                value={quick.name}
                onChange={(event) => setQuick({ ...quick, name: event.target.value })}
                required
                placeholder="Name"
                className="w-full rounded-xl border border-white/10 bg-[#13131c] px-4 py-4 text-lg text-white outline-none focus:border-[#2ECC8A]"
              />
              <input
                value={quick.phone}
                onChange={(event) => setQuick({ ...quick, phone: event.target.value })}
                required
                placeholder="Phone"
                className="w-full rounded-xl border border-white/10 bg-[#13131c] px-4 py-3 text-sm text-white outline-none focus:border-[#2ECC8A]"
              />
              <div className="grid grid-cols-2 gap-2">
                {quickSources.map((source) => (
                  <button
                    key={source.value}
                    type="button"
                    onClick={() => setQuick({ ...quick, source: source.value })}
                    className={`rounded-xl border px-3 py-4 text-sm font-bold transition ${
                      quick.source === source.value
                        ? "border-[#2ECC8A] bg-[#2ECC8A] text-[#0A0F0D]"
                        : "border-white/10 bg-[#13131c] text-zinc-400"
                    }`}
                  >
                    {source.label}
                  </button>
                ))}
              </div>
              <textarea
                value={quick.note}
                onChange={(event) => setQuick({ ...quick, note: event.target.value })}
                placeholder="Quick note"
                rows={2}
                className="w-full resize-none rounded-xl border border-white/10 bg-[#13131c] px-4 py-3 text-sm text-white outline-none focus:border-[#2ECC8A]"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input value={full.name} onChange={(event) => setFull({ ...full, name: event.target.value })} required placeholder="Name" className="rounded-xl border border-white/10 bg-[#13131c] px-4 py-3 text-sm text-white outline-none focus:border-[#2ECC8A]" />
                <input value={full.phone} onChange={(event) => setFull({ ...full, phone: event.target.value })} required placeholder="Phone" className="rounded-xl border border-white/10 bg-[#13131c] px-4 py-3 text-sm text-white outline-none focus:border-[#2ECC8A]" />
              </div>
              <input value={full.email} onChange={(event) => setFull({ ...full, email: event.target.value })} type="email" placeholder="Email" className="w-full rounded-xl border border-white/10 bg-[#13131c] px-4 py-3 text-sm text-white outline-none focus:border-[#2ECC8A]" />
              <input value={full.company} onChange={(event) => setFull({ ...full, company: event.target.value })} placeholder="Company name" className="w-full rounded-xl border border-white/10 bg-[#13131c] px-4 py-3 text-sm text-white outline-none focus:border-[#2ECC8A]" />
              <select value={full.source} onChange={(event) => setFull({ ...full, source: event.target.value })} className="w-full rounded-xl border border-white/10 bg-[#13131c] px-4 py-3 text-sm text-white outline-none focus:border-[#2ECC8A]">
                {allSources.map((source) => <option key={source}>{source}</option>)}
              </select>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-zinc-500">₹</span>
                <input value={full.value} onChange={(event) => setFull({ ...full, value: event.target.value })} type="number" min="0" placeholder="Estimated value" className="w-full rounded-xl border border-white/10 bg-[#13131c] py-3 pl-8 pr-4 text-sm text-white outline-none focus:border-[#2ECC8A]" />
              </div>
              <select value={currentUser.id} disabled className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-[#13131c] px-4 py-3 text-sm text-zinc-400 outline-none">
                <option>{currentUser.name}</option>
              </select>
              <input value={full.followUpDate} onChange={(event) => setFull({ ...full, followUpDate: event.target.value })} type="date" className="w-full rounded-xl border border-white/10 bg-[#13131c] px-4 py-3 text-sm text-white outline-none focus:border-[#2ECC8A]" />
              <textarea value={full.notes} onChange={(event) => setFull({ ...full, notes: event.target.value })} placeholder="Notes" rows={4} className="w-full resize-none rounded-xl border border-white/10 bg-[#13131c] px-4 py-3 text-sm text-white outline-none focus:border-[#2ECC8A]" />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full rounded-xl bg-[#2ECC8A] px-4 py-3 text-sm font-bold text-[#0A0F0D] transition hover:bg-[#55ddb0] disabled:opacity-60"
          >
            {loading
              ? "Saving..."
              : tab === "quick"
                ? "Save lead →"
                : "Save and score →"}
          </button>
        </form>
      </aside>
    </div>
  );
}
