"use client";

import { Check, ChevronDown } from "lucide-react";
import { KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";

import { BDMLeadStatus, LeadNoteView, SimpleLead } from "./simple-lead-types";

type VisibleStatus = Exclude<BDMLeadStatus, "ONBOARDING">;

type SimpleLeadCardProps = {
  lead: SimpleLead;
  onStatusChange: (lead: SimpleLead, status: BDMLeadStatus, reason?: string) => void;
  onNoteAdded: (leadId: string, note: LeadNoteView) => void;
  onStartOnboarding: (lead: SimpleLead) => Promise<void> | void;
  sourceBadge?: React.ReactNode;
  bdmName?: string;
  isExiting?: boolean;
};

const STATUS_OPTIONS = [
  {
    value: "NEW",
    label: "New",
    color: "#6B6878",
    bg: "rgba(107,104,120,0.15)",
    border: "rgba(107,104,120,0.3)",
    dot: "#6B6878",
  },
  {
    value: "CONTACTED",
    label: "Contacted",
    color: "#a89fff",
    bg: "rgba(124,111,255,0.12)",
    border: "rgba(124,111,255,0.35)",
    dot: "#7C6FFF",
  },
  {
    value: "FOLLOW_UP",
    label: "Follow Up",
    color: "#F5A623",
    bg: "rgba(245,166,35,0.12)",
    border: "rgba(245,166,35,0.35)",
    dot: "#F5A623",
  },
  {
    value: "LOST",
    label: "Lost",
    color: "#FF6B6B",
    bg: "rgba(255,107,107,0.1)",
    border: "rgba(255,107,107,0.25)",
    dot: "#FF6B6B",
  },
] satisfies Array<{
  value: VisibleStatus;
  label: string;
  color: string;
  bg: string;
  border: string;
  dot: string;
}>;

const leadTypeBadges = {
  PLATFORM: { label: "Platform lead", color: "#7C6FFF", bg: "rgba(124,111,255,0.1)" },
  MANAGEMENT: { label: "Management lead", color: "#22D9A0", bg: "rgba(34,217,160,0.08)" },
  SELF: { label: "Self-generated", color: "#F5A623", bg: "rgba(245,166,35,0.08)" },
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
  isExiting = false,
}: SimpleLeadCardProps) {
  const [quickNote, setQuickNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [confirmOnboarding, setConfirmOnboarding] = useState(false);
  const [onboardingBusy, setOnboardingBusy] = useState(false);
  const [lostReasonDraft, setLostReasonDraft] = useState(lead.lostReason ?? "");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const visibleNotes = lead.callNotes.slice(0, 3);
  const companyName = lead.company || lead.name;
  const contactLine = [lead.name, lead.email].filter(Boolean).join(" · ");
  const isMarketplaceLead = String(lead.source ?? "").toLowerCase() === "marketplace";
  const leadType = lead.leadType ?? "SELF";
  const leadTypeBadge = leadTypeBadges[leadType];
  const agentInterest = lead.agentInterest ?? null;
  const currentStatus =
    STATUS_OPTIONS.find((status) => status.value === lead.bdmStatus) ?? STATUS_OPTIONS[0];
  const marketplaceWhatsappText =
    isMarketplaceLead && agentInterest
      ? `Hello ${lead.name}, I am ${bdmName} from BGOS. I saw your interest in ${agentInterest}. Is this a good time to talk?`
      : undefined;

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setStatusOpen(false);
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  useEffect(() => {
    setLostReasonDraft(lead.lostReason ?? "");
  }, [lead.lostReason]);

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
  }

  function handleQuickKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      void addNote(quickNote);
    }
  }

  function handleLostReasonKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      onStatusChange(lead, "LOST", lostReasonDraft.trim());
    }
  }

  async function confirmStartOnboarding() {
    if (onboardingBusy) return;
    setOnboardingBusy(true);
    await onStartOnboarding(lead);
    setOnboardingBusy(false);
    setConfirmOnboarding(false);
  }

  const canStartOnboarding = lead.bdmStatus === "CONTACTED" || lead.bdmStatus === "FOLLOW_UP";

  const meta = useMemo(
    () => [
      lead.phone ? (
        <a key="phone" href={phoneHref(lead.phone)} className="font-bold text-zinc-200 hover:text-white">
          {lead.phone}
        </a>
      ) : (
        <span key="phone" className="text-zinc-500">
          No phone
        </span>
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
      className={`rounded-2xl border border-white/10 bg-[#13131c] p-4 shadow-xl shadow-black/10 ${
        isExiting ? "lead-card-exit" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-heading text-[15px] font-bold text-white">{companyName}</h3>
          <p className="mt-1 text-xs text-zinc-500">{contactLine || "No contact details"}</p>
          <span
            className="mt-2 inline-flex rounded-full px-2 py-1 text-[10px] font-extrabold"
            style={{ color: leadTypeBadge.color, backgroundColor: leadTypeBadge.bg }}
          >
            {leadTypeBadge.label}
          </span>
          {sourceBadge}
        </div>
        <div ref={dropdownRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setStatusOpen((current) => !current)}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition"
            style={{
              borderColor: currentStatus.border,
              backgroundColor: currentStatus.bg,
              color: currentStatus.color,
            }}
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: currentStatus.dot }} />
            {currentStatus.label}
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          {statusOpen ? (
            <div className="absolute right-0 top-[calc(100%+8px)] z-50 min-w-[140px] overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--card)] shadow-[0_8px_24px_rgba(0,0,0,0.3)]">
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status.value}
                  type="button"
                  onClick={() => {
                    onStatusChange(lead, status.value);
                    setStatusOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13px] text-zinc-200 transition hover:bg-white/[0.04]"
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: status.dot }} />
                  <span className="flex-1">{status.label}</span>
                  {lead.bdmStatus === status.value ? <Check className="h-3.5 w-3.5" /> : null}
                </button>
              ))}
            </div>
          ) : null}
          {lead.bdmStatus === "LOST" ? (
            <input
              value={lostReasonDraft}
              onChange={(event) => setLostReasonDraft(event.target.value)}
              onBlur={() => onStatusChange(lead, "LOST", lostReasonDraft.trim())}
              onKeyDown={handleLostReasonKey}
              placeholder="Reason for losing this lead? (optional)"
              className="absolute right-0 top-[calc(100%+8px)] z-40 w-[230px] rounded-xl border border-[#FF6B6B]/25 bg-[#0e0e13] px-3 py-2 text-xs text-white outline-none focus:border-[#FF6B6B]"
            />
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs">
        {meta.map((item, index) => (
          <span key={index} className="inline-flex items-center gap-1">
            {item}
          </span>
        ))}
      </div>

      {leadType === "MANAGEMENT" && lead.managementNotes ? (
        <div className="mt-3 rounded-xl border border-[#22D9A0]/25 bg-[#22D9A0]/10 px-3 py-2 text-xs leading-5 text-[#bfffe8]">
          <strong className="text-[#22D9A0]">Context from management:</strong> {lead.managementNotes}
        </div>
      ) : null}

      {leadType === "PLATFORM" ? (
        <div className="mt-3 rounded-xl border border-[#7C6FFF]/25 bg-[#7C6FFF]/10 px-3 py-2 text-xs text-[#c8c2ff]">
          From: {agentInterest ? `${agentInterest} marketplace` : lead.leadSource ?? lead.source ?? "Platform"}
        </div>
      ) : null}

      {isMarketplaceLead && agentInterest ? (
        <div
          className="mt-3 rounded-xl border px-3 py-2 text-sm font-extrabold"
          style={{
            borderColor: `${lead.agentColor ?? "#7C6FFF"}55`,
            color: lead.agentColor ?? "#c6c1ff",
            backgroundColor: `${lead.agentColor ?? "#7C6FFF"}12`,
          }}
        >
          Interested in: {agentInterest}
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
            +
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
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
            onClick={() => setConfirmOnboarding(true)}
            className="w-full rounded-[10px] border border-[rgba(124,111,255,0.4)] bg-[linear-gradient(135deg,rgba(124,111,255,0.2),rgba(34,217,160,0.1))] px-3 py-3 font-heading text-[13px] font-bold text-[#a89fff] transition hover:-translate-y-px hover:border-[rgba(124,111,255,0.6)] hover:bg-[linear-gradient(135deg,rgba(124,111,255,0.3),rgba(34,217,160,0.15))]"
          >
            ⚡ Start onboarding →
          </button>
        ) : null}
      </div>

      {confirmOnboarding ? (
        <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border border-white/10 bg-[#13131c] p-5 shadow-2xl shadow-black/50 md:static md:mt-3 md:rounded-2xl">
          <h4 className="font-heading text-base font-bold text-white">Move {companyName} to onboarding?</h4>
          <div className="mt-3 space-y-1 text-sm text-zinc-300">
            <p>✓ Remove this lead from your leads list</p>
            <p>✓ Start the NEXA onboarding session</p>
            <p>✓ Move it to your Onboarding tab</p>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => setConfirmOnboarding(false)}
              className="flex-1 rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-zinc-300"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={onboardingBusy}
              onClick={() => void confirmStartOnboarding()}
              className="flex-1 rounded-xl bg-[#22D9A0] px-4 py-2 text-sm font-extrabold text-black disabled:opacity-50"
            >
              Start onboarding →
            </button>
          </div>
        </div>
      ) : null}

    </article>
  );
}
