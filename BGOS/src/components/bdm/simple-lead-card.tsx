"use client";

import Link from "next/link";
import { KeyboardEvent, useMemo, useState } from "react";

import { BDMLeadStatus, bdmStatuses, LeadNoteView, SimpleLead } from "./simple-lead-types";

type SimpleLeadCardProps = {
  lead: SimpleLead;
  onStatusChange: (lead: SimpleLead, status: BDMLeadStatus) => void;
  onNoteAdded: (leadId: string, note: LeadNoteView) => void;
  onStartOnboarding: (lead: SimpleLead) => void;
  sourceBadge?: React.ReactNode;
  bdmName?: string;
};

const borderColors: Record<BDMLeadStatus, string> = {
  NEW: "#71717a",
  CONTACTED: "#7C6FFF",
  FOLLOW_UP: "#F5A623",
  ONBOARDING: "#22D9A0",
  LOST: "#FF6B6B",
};

function timeAgo(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.max(0, Math.floor(diff / 60_000));
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function phoneHref(phone?: string | null) {
  if (!phone) return "";
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

function whatsappHref(phone?: string | null, text?: string) {
  if (!phone) return "";
  const normalized = phone.replace(/[^\d]/g, "");
  return `https://wa.me/${normalized}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

function followUpClass(value?: string | null) {
  if (!value) return "text-zinc-500";
  const date = new Date(value);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return date <= today ? "text-[#F5A623]" : "text-[#22D9A0]";
}

function contactAgeClass(days?: number | null) {
  if (days == null) return "text-zinc-500";
  if (days >= 3) return "text-[#FF6B6B]";
  if (days >= 2) return "text-[#F5A623]";
  return "text-zinc-500";
}

function formatFollowUp(value?: string | null, time?: string | null) {
  if (!value) return "No follow-up set";
  return `${new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  })}${time ? `, ${time}` : ""}`;
}

export function SimpleLeadCard({
  lead,
  onStatusChange,
  onNoteAdded,
  onStartOnboarding,
  sourceBadge,
  bdmName = "your Business Manager",
}: SimpleLeadCardProps) {
  const [quickNote, setQuickNote] = useState("");
  const [callOpen, setCallOpen] = useState(false);
  const [callNote, setCallNote] = useState(
    `Call at ${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}: `,
  );
  const [saving, setSaving] = useState(false);
  const visibleNotes = lead.callNotes.slice(0, 3);
  const companyName = lead.company || lead.name;
  const contactLine = [lead.name, lead.email].filter(Boolean).join(" · ");
  const isMarketplaceLead = String(lead.source ?? "").toLowerCase() === "marketplace";
  const agentInterest = lead.agentInterest ?? null;
  const marketplaceWhatsappText =
    isMarketplaceLead && agentInterest
      ? `Hello ${lead.name}, I am ${bdmName} from BGOS. I saw your interest in ${agentInterest}. Is this a good time to talk?`
      : undefined;

  async function addNote(content: string, noteType = "call") {
    const trimmed = content.trim();
    if (!trimmed || saving) return;

    setSaving(true);
    const response = await fetch(`/api/leads/${lead.id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: trimmed, noteType }),
    });
    setSaving(false);

    if (!response.ok) return;
    const data = (await response.json()) as { note: LeadNoteView };
    onNoteAdded(lead.id, data.note);
    setQuickNote("");
    setCallNote(
      `Call at ${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}: `,
    );
    setCallOpen(false);
  }

  function handleQuickKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      void addNote(quickNote);
    }
  }

  const canStartOnboarding = lead.bdmStatus !== "LOST" && lead.bdmStatus !== "ONBOARDING";
  const onboardingHref = lead.onboardingSessionId
    ? `/bdm/onboarding/${lead.id}`
    : `/bdm/onboarding/${lead.id}`;

  const meta = useMemo(
    () => [
      lead.phone ? (
        <a key="phone" href={phoneHref(lead.phone)} className="font-bold text-zinc-200 hover:text-white">
          {lead.phone}
        </a>
      ) : (
        <span key="phone" className="text-zinc-500">No phone</span>
      ),
      <span key="followUp" className={followUpClass(lead.followUpDate)}>
        {formatFollowUp(lead.followUpDate, lead.followUpTime)}
      </span>,
      <span key="contactAge" className={contactAgeClass(lead.daysSinceContact)}>
        {lead.daysSinceContact == null ? "Never contacted" : `${lead.daysSinceContact}d since contact`}
      </span>,
    ],
    [lead.daysSinceContact, lead.followUpDate, lead.followUpTime, lead.phone],
  );

  return (
    <article
      className="rounded-2xl border border-white/10 bg-[#13131c] p-4 shadow-xl shadow-black/10"
      style={{ borderLeft: `3px solid ${borderColors[lead.bdmStatus]}` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-heading text-[15px] font-bold text-white">{companyName}</h3>
          <p className="mt-1 text-xs text-zinc-500">{contactLine || "No contact details"}</p>
          {sourceBadge}
        </div>
        <div className="flex shrink-0 gap-1.5">
          {bdmStatuses.map((status) => {
            const active = lead.bdmStatus === status.value;
            return (
              <button
                key={status.value}
                type="button"
                title={status.label}
                onClick={() => onStatusChange(lead, status.value)}
                className="flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-extrabold transition"
                style={{
                  borderColor: active ? status.color : "rgba(255,255,255,0.12)",
                  backgroundColor: active ? status.color : "rgba(255,255,255,0.03)",
                  color: active ? "#070709" : "#a1a1aa",
                }}
              >
                {status.short}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs">
        {meta.map((item, index) => (
          <span key={index} className="inline-flex items-center gap-1">
            {item}
          </span>
        ))}
      </div>

      {isMarketplaceLead && agentInterest ? (
        <div
          className="mt-3 rounded-xl border px-3 py-2 text-sm font-extrabold"
          style={{
            borderColor: `${lead.agentColor ?? "#7C6FFF"}55`,
            color: lead.agentColor ?? "#c6c1ff",
            backgroundColor: `${lead.agentColor ?? "#7C6FFF"}12`,
          }}
        >
          Interested in: ⚡ {agentInterest}
        </div>
      ) : null}

      {lead.bdmStatus === "LOST" && lead.lostReason ? (
        <p className="mt-2 rounded-xl border border-[#FF6B6B]/20 bg-[#FF6B6B]/10 px-3 py-2 text-xs text-red-200">
          Lost reason: {lead.lostReason}
        </p>
      ) : null}

      <div className="mt-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Call notes</p>
        <div className="mt-2 space-y-2">
          {visibleNotes.length > 0 ? (
            visibleNotes.map((note) => (
              <div key={note.id} className="grid grid-cols-[44px_1fr] gap-2 text-left">
                <span className="text-[11px] text-zinc-600">{timeAgo(note.createdAt)}</span>
                <p className="text-xs leading-5 text-zinc-300">{note.content}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-zinc-500">No notes yet.</p>
          )}
        </div>
        {lead.callNotes.length > 3 ? (
          <button type="button" className="mt-2 text-xs font-bold text-[#7C6FFF]">
            View all {lead.callNotes.length} notes →
          </button>
        ) : null}
        <div className="mt-3 flex gap-2">
          <input
            value={quickNote}
            onChange={(event) => setQuickNote(event.target.value)}
            onKeyDown={handleQuickKey}
            placeholder="Add a note from today's call..."
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#0e0e13] px-3 py-2 text-xs text-white outline-none focus:border-[#7C6FFF]"
          />
          <button
            type="button"
            onClick={() => void addNote(quickNote)}
            disabled={saving || !quickNote.trim()}
            className="rounded-xl bg-white px-3 py-2 text-xs font-extrabold text-black disabled:opacity-50"
          >
            + Add
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCallOpen((current) => !current)}
          className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-zinc-200 transition hover:text-white"
        >
          📞 Log call
        </button>
        {lead.phone ? (
          <a
            href={whatsappHref(lead.phone, marketplaceWhatsappText)}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-zinc-200 transition hover:text-white"
          >
            💬 WhatsApp
          </a>
        ) : null}
        {canStartOnboarding ? (
          <button
            type="button"
            onClick={() => onStartOnboarding(lead)}
            className="flex-1 rounded-xl bg-gradient-to-r from-[#7C6FFF] to-[#22D9A0] px-4 py-2 text-xs font-extrabold text-black shadow-lg shadow-[#7C6FFF]/20"
          >
            ⚡ Start onboarding with NEXA →
          </button>
        ) : null}
        {lead.bdmStatus === "ONBOARDING" ? (
          <Link
            href={onboardingHref}
            className="flex-1 rounded-xl border border-[#22D9A0]/30 bg-[#22D9A0]/10 px-4 py-2 text-center text-xs font-extrabold text-[#22D9A0]"
          >
            📋 View onboarding summary →
          </Link>
        ) : null}
      </div>

      {callOpen ? (
        <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3">
          <textarea
            value={callNote}
            onChange={(event) => setCallNote(event.target.value)}
            rows={3}
            className="w-full resize-none rounded-xl border border-white/10 bg-[#0e0e13] p-3 text-sm text-white outline-none focus:border-[#7C6FFF]"
          />
          <button
            type="button"
            onClick={() => void addNote(callNote)}
            disabled={saving || !callNote.trim()}
            className="mt-2 rounded-xl bg-[#22D9A0] px-4 py-2 text-xs font-extrabold text-black disabled:opacity-50"
          >
            Save call note
          </button>
        </div>
      ) : null}
    </article>
  );
}
