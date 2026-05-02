"use client";

import { FormEvent, useState } from "react";
import { X } from "lucide-react";

import { useToast } from "@/components/ui/toast";
import { SimpleLead } from "./simple-lead-types";

type AddLeadFormProps = {
  onSuccess: (lead: SimpleLead) => void;
  onClose?: () => void;
};

const companyTypes = [
  "Solar EPC",
  "Channel partner",
  "Rooftop solar",
  "Commercial solar",
  "Solar manufacturer",
];

const sources = [
  { label: "Cold call", value: "COLD_CALL" },
  { label: "WhatsApp", value: "WHATSAPP" },
  { label: "Referral", value: "REFERRAL" },
  { label: "Instagram", value: "INSTAGRAM" },
  { label: "LinkedIn", value: "OTHER" },
  { label: "Other", value: "OTHER" },
];

export function AddLeadForm({ onSuccess, onClose }: AddLeadFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [email, setEmail] = useState("");
  const [callNotes, setCallNotes] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpTime, setFollowUpTime] = useState("");
  const [source, setSource] = useState("COLD_CALL");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!companyName.trim() || !contactName.trim() || !phone.trim()) return;

    setLoading(true);
    const details = [
      location ? `Location: ${location}` : "",
      companyType ? `Company type: ${companyType}` : "",
      teamSize ? `Team size: ${teamSize}` : "",
      callNotes ? `Call notes: ${callNotes}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company: companyName,
        name: contactName,
        phone,
        email: email || undefined,
        source,
        bdmStatus: "NEW",
        initialNotes: details,
        followUpDate: followUpDate || undefined,
        followUpTime: followUpTime || undefined,
      }),
    });
    setLoading(false);

    const data = (await response.json().catch(() => ({}))) as { lead?: SimpleLead; error?: string };
    if (!response.ok || !data.lead) {
      toast(data.error ?? "Could not add lead", "error");
      return;
    }

    onSuccess(data.lead);
    toast(
      followUpDate
        ? `Lead added. NEXA will remind you on ${new Date(followUpDate).toLocaleDateString("en-IN")}.`
        : "Lead added.",
      "success",
    );
    onClose?.();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm">
      <aside className="ml-auto flex h-full w-full max-w-[420px] flex-col border-l border-white/10 bg-[#101016] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="font-heading text-xl font-bold text-white">Add new lead</h2>
          <button type="button" onClick={onClose} className="rounded-full border border-white/10 p-2 text-zinc-400">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 space-y-4 overflow-y-auto p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="text-xs font-bold text-zinc-400">Company name</span>
              <input required value={companyName} onChange={(event) => setCompanyName(event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-[#0e0e13] px-4 py-3 text-base text-white outline-none focus:border-[#7C6FFF]" />
            </label>
            <label className="sm:col-span-2">
              <span className="text-xs font-bold text-zinc-400">Owner/contact name</span>
              <input required value={contactName} onChange={(event) => setContactName(event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-[#0e0e13] px-4 py-3 text-sm text-white outline-none focus:border-[#7C6FFF]" />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label>
              <span className="text-xs font-bold text-zinc-400">Phone number</span>
              <input required value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-[#0e0e13] px-4 py-3 text-sm text-white outline-none focus:border-[#7C6FFF]" />
            </label>
            <label>
              <span className="text-xs font-bold text-zinc-400">Location</span>
              <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="City, district" className="mt-1 w-full rounded-xl border border-white/10 bg-[#0e0e13] px-4 py-3 text-sm text-white outline-none focus:border-[#7C6FFF]" />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label>
              <span className="text-xs font-bold text-zinc-400">Company type</span>
              <input list="company-types" value={companyType} onChange={(event) => setCompanyType(event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-[#0e0e13] px-4 py-3 text-sm text-white outline-none focus:border-[#7C6FFF]" />
              <datalist id="company-types">
                {companyTypes.map((item) => <option key={item} value={item} />)}
              </datalist>
            </label>
            <label>
              <span className="text-xs font-bold text-zinc-400">Team size</span>
              <input type="number" min="1" value={teamSize} onChange={(event) => setTeamSize(event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-[#0e0e13] px-4 py-3 text-sm text-white outline-none focus:border-[#7C6FFF]" />
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-bold text-zinc-400">Email</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-[#0e0e13] px-4 py-3 text-sm text-white outline-none focus:border-[#7C6FFF]" />
          </label>

          <label className="block">
            <span className="text-xs font-bold text-zinc-400">Call notes — what did they say? What is their pain?</span>
            <textarea
              value={callNotes}
              onChange={(event) => setCallNotes(event.target.value)}
              placeholder="e.g. Owner Rajan — Solar EPC, 8 employees. Managing 12 installations. Team coordination is biggest pain. Uses WhatsApp groups. No CRM. Interested but busy this week. Call Thursday 9am."
              className="mt-1 min-h-20 w-full resize-none rounded-xl border border-white/10 bg-[#0e0e13] px-4 py-3 text-sm leading-6 text-white outline-none focus:border-[#7C6FFF]"
            />
            <span className="mt-2 block rounded-xl border border-[#22D9A0]/20 bg-[#22D9A0]/10 px-3 py-2 text-xs text-[#22D9A0]">
              💡 NEXA reads these notes to coach you. The more detail the better.
            </span>
          </label>

          <div>
            <p className="mb-2 text-xs font-bold text-zinc-400">Set follow-up reminder.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <input type="date" value={followUpDate} onChange={(event) => setFollowUpDate(event.target.value)} className="rounded-xl border border-white/10 bg-[#0e0e13] px-4 py-3 text-sm text-white outline-none focus:border-[#7C6FFF]" />
              <input type="time" value={followUpTime} onChange={(event) => setFollowUpTime(event.target.value)} className="rounded-xl border border-white/10 bg-[#0e0e13] px-4 py-3 text-sm text-white outline-none focus:border-[#7C6FFF]" />
            </div>
          </div>

          <label className="block">
            <span className="text-xs font-bold text-zinc-400">Source</span>
            <select value={source} onChange={(event) => setSource(event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-[#0e0e13] px-4 py-3 text-sm text-white outline-none focus:border-[#7C6FFF]">
              {sources.map((item) => <option key={`${item.label}-${item.value}`} value={item.value}>{item.label}</option>)}
            </select>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#22D9A0] px-5 py-3 text-sm font-extrabold text-black disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save lead + set reminder →"}
          </button>
        </form>
      </aside>
    </div>
  );
}
