"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Archive,
  ExternalLink,
  Forward,
  Loader2,
  MailOpen,
  Send,
  Sparkles,
  Star,
  Tag,
  Trash2,
} from "lucide-react";

import { LeadDrawer } from "@/components/crm/lead-drawer";
import type { TeamMember } from "@/components/crm/types";

type EmailDetails = {
  id: string;
  accountId: string;
  from: string;
  fromName: string | null;
  to: string;
  subject: string;
  body: string;
  label: string;
  isStarred: boolean;
  nexaSummary: string | null;
  nexaReplyDraft: string | null;
  receivedAt: string;
  lead: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  } | null;
};

type EmailReaderProps = {
  emailId: string | null;
};

type Template = {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
};

const labelStyles: Record<string, string> = {
  LEAD: "border-[#22D9A0]/30 bg-[#22D9A0]/10 text-[#22D9A0]",
  SUPPORT: "border-[#7C6FFF]/30 bg-[#7C6FFF]/10 text-[#c6c1ff]",
  SPAM: "border-zinc-500/30 bg-zinc-500/10 text-zinc-400",
  INTERNAL: "border-[#F5A623]/30 bg-[#F5A623]/10 text-[#F5A623]",
  IMPORTANT: "border-[#FF6B6B]/30 bg-[#FF6B6B]/10 text-[#FF6B6B]",
  UNCATEGORIZED: "border-white/10 bg-white/[0.03] text-zinc-400",
};

function sanitizeHtml(html: string) {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/\son\w+=\S+/gi, "");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function iconButtonClass() {
  return "group relative rounded-lg border border-white/10 p-2 text-zinc-400 transition hover:border-[#7C6FFF]/40 hover:text-white";
}

function Tooltip({ label }: { label: string }) {
  return (
    <span className="pointer-events-none absolute -bottom-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-black px-2 py-1 text-[10px] font-semibold text-white group-hover:block">
      {label}
    </span>
  );
}

export function EmailReader({ emailId }: EmailReaderProps) {
  const [email, setEmail] = useState<EmailDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [sending, setSending] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [leadDrawerId, setLeadDrawerId] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const safeBody = useMemo(() => sanitizeHtml(email?.body ?? ""), [email?.body]);

  async function loadEmail(id: string) {
    setLoading(true);
    const response = await fetch(`/api/email/${id}`, { cache: "no-store" });
    setLoading(false);

    if (!response.ok) return;

    const data = (await response.json()) as { email: EmailDetails };
    setEmail(data.email);
    setReplyBody(data.email.nexaReplyDraft ?? "");
  }

  async function loadTemplates() {
    const response = await fetch("/api/email/templates", { cache: "no-store" });
    if (!response.ok) return;
    const data = (await response.json()) as { templates: Template[] };
    setTemplates(data.templates);
  }

  useEffect(() => {
    if (emailId) void loadEmail(emailId);
    if (!emailId) setEmail(null);
  }, [emailId]);

  useEffect(() => {
    void loadTemplates();
    void fetch("/api/team", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { users?: TeamMember[] } | null) => {
        setTeamMembers(data?.users ?? []);
      });
  }, []);

  async function toggleStar() {
    if (!email) return;
    const next = !email.isStarred;
    setEmail({ ...email, isStarred: next });
    await fetch(`/api/email/${email.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isStarred: next }),
    });
  }

  async function updateLabel(label: string) {
    if (!email) return;
    const response = await fetch(`/api/email/${email.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label }),
    });
    if (!response.ok) return;
    const data = (await response.json()) as { email: EmailDetails };
    setEmail(data.email);
  }

  async function generateSummary() {
    if (!email) return;
    setSummaryLoading(true);
    await loadEmail(email.id);
    setSummaryLoading(false);
  }

  async function getDraft() {
    if (!email) return;
    setDraftLoading(true);
    const response = await fetch(`/api/email/${email.id}/draft`, {
      method: "POST",
    });
    setDraftLoading(false);
    if (!response.ok) return;
    const data = (await response.json()) as { draft: string };
    setReplyBody(data.draft);
    setReplyOpen(true);
  }

  async function sendReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email || !replyBody.trim()) return;
    setSending(true);
    const response = await fetch(`/api/email/${email.id}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: replyBody }),
    });
    setSending(false);
    if (!response.ok) return;
    setReplyOpen(false);
    setReplyBody("");
  }

  if (!emailId) {
    return (
      <div className="flex h-full min-h-[420px] flex-col items-center justify-center px-8 text-center">
        <svg
          width="120"
          height="96"
          viewBox="0 0 120 96"
          fill="none"
          aria-hidden="true"
        >
          <rect
            x="18"
            y="20"
            width="84"
            height="56"
            rx="12"
            fill="#13131c"
            stroke="rgba(255,255,255,0.08)"
          />
          <path
            d="M24 30l36 26 36-26"
            stroke="#7C6FFF"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h2 className="mt-5 font-heading text-lg font-bold text-white">
          Select an email to read
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          NEXA summaries and reply drafts will appear here.
        </p>
      </div>
    );
  }

  if (loading || !email) {
    return (
      <div className="space-y-4 p-6">
        <div className="h-7 w-3/4 animate-pulse rounded bg-white/[0.06]" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-white/[0.04]" />
        <div className="h-48 animate-pulse rounded-xl bg-white/[0.04]" />
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-[680px] flex-col">
      <header className="shrink-0 border-b border-white/10 p-5">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="font-heading text-lg font-bold leading-7 text-white">
              {email.subject}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                  labelStyles[email.label] ?? labelStyles.UNCATEGORIZED
                }`}
              >
                {email.label}
              </span>
              {email.lead ? (
                <span className="rounded-full border border-[#22D9A0]/30 bg-[#22D9A0]/10 px-2.5 py-1 text-[10px] font-bold text-[#22D9A0]">
                  Linked lead
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="text-sm text-zinc-400">
          <span className="font-bold text-white">
            {email.fromName ?? email.from}
          </span>{" "}
          <span className="text-zinc-500">&lt;{email.from}&gt;</span>
          <span className="mx-2 text-zinc-700">to</span>
          <span>{email.to}</span>
        </div>
        <p className="mt-1 text-xs text-zinc-500">{formatDate(email.receivedAt)}</p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setReplyOpen(true)}
            className={iconButtonClass()}
            aria-label="Reply"
          >
            <MailOpen className="h-4 w-4" />
            <Tooltip label="Reply" />
          </button>
          <button type="button" className={iconButtonClass()} aria-label="Forward">
            <Forward className="h-4 w-4" />
            <Tooltip label="Forward" />
          </button>
          <button
            type="button"
            onClick={() => void toggleStar()}
            className={iconButtonClass()}
            aria-label="Toggle starred"
          >
            <Star
              className={`h-4 w-4 ${
                email.isStarred ? "fill-[#F5A623] text-[#F5A623]" : ""
              }`}
            />
            <Tooltip label="Star" />
          </button>
          <div className="relative">
            <select
              value={email.label}
              onChange={(event) => void updateLabel(event.target.value)}
              className="h-9 rounded-lg border border-white/10 bg-[#0e0e13] px-3 text-xs font-bold text-zinc-300 outline-none focus:border-[#7C6FFF]"
              aria-label="Label"
            >
              {[
                "LEAD",
                "SUPPORT",
                "SPAM",
                "INTERNAL",
                "IMPORTANT",
                "UNCATEGORIZED",
              ].map((label) => (
                <option key={label} value={label}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <button type="button" className={iconButtonClass()} aria-label="Archive">
            <Archive className="h-4 w-4" />
            <Tooltip label="Archive" />
          </button>
          <button type="button" className={iconButtonClass()} aria-label="Delete">
            <Trash2 className="h-4 w-4" />
            <Tooltip label="Delete" />
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        <section className="mb-4 rounded-xl border-l-2 border-[#7C6FFF] bg-[#7C6FFF]/[0.06] p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#7C6FFF]" />
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-6 text-[#F0EEF8]">
                {email.nexaSummary ??
                  "NEXA can summarize this email and draft a reply when you need one."}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {!email.nexaSummary ? (
                  <button
                    type="button"
                    onClick={() => void generateSummary()}
                    disabled={summaryLoading}
                    className="rounded-lg border border-[#7C6FFF]/30 px-3 py-2 text-xs font-bold text-[#c6c1ff] transition hover:bg-[#7C6FFF]/10"
                  >
                    {summaryLoading ? "Generating..." : "Generate summary"}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => void getDraft()}
                  disabled={draftLoading}
                  className="rounded-lg bg-[#7C6FFF] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#9186FF]"
                >
                  {draftLoading ? "Drafting..." : "Get reply draft"}
                </button>
              </div>
            </div>
          </div>
        </section>

        {email.lead ? (
          <section className="mb-4 rounded-xl border border-[#22D9A0]/20 bg-[#22D9A0]/[0.06] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-[#d9fff0]">
                This email is from lead{" "}
                <span className="font-bold">{email.lead.name}</span>.
              </p>
              <button
                type="button"
                onClick={() => setLeadDrawerId(email.lead?.id ?? null)}
                className="inline-flex items-center gap-2 rounded-lg border border-[#22D9A0]/30 px-3 py-2 text-xs font-bold text-[#22D9A0]"
              >
                View lead profile
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>
          </section>
        ) : null}

        <article
          className="mx-auto max-w-[640px] rounded-xl bg-white p-5 text-sm leading-7 text-zinc-900"
          dangerouslySetInnerHTML={{ __html: safeBody || "<p>No body.</p>" }}
        />
      </div>

      {replyOpen ? (
        <form
          onSubmit={sendReply}
          className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-[#0d0d11]/95 p-4 shadow-2xl shadow-black/40 backdrop-blur"
        >
          <textarea
            value={replyBody}
            onChange={(event) => setReplyBody(event.target.value)}
            rows={8}
            className="w-full resize-none rounded-xl border border-white/10 bg-[#13131c] p-3 text-sm leading-6 text-white outline-none transition placeholder:text-zinc-600 focus:border-[#7C6FFF]"
            placeholder="Write your reply..."
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowTemplates((value) => !value)}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-zinc-300 transition hover:bg-white/5"
              >
                <Tag className="h-3.5 w-3.5" />
                Use template
              </button>
              {showTemplates ? (
                <div className="absolute bottom-11 left-0 z-10 max-h-72 w-72 overflow-auto rounded-xl border border-white/10 bg-[#13131c] p-2 shadow-2xl">
                  {templates.length > 0 ? (
                    templates.map((template) => (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => {
                          setReplyBody(template.body);
                          setShowTemplates(false);
                        }}
                        className="block w-full rounded-lg px-3 py-2 text-left transition hover:bg-white/5"
                      >
                        <span className="block text-sm font-bold text-white">
                          {template.name}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {template.category}
                        </span>
                      </button>
                    ))
                  ) : (
                    <p className="px-3 py-2 text-sm text-zinc-500">
                      No templates yet.
                    </p>
                  )}
                </div>
              ) : null}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-500">
                {replyBody.length} chars
              </span>
              <button
                type="button"
                onClick={() => {
                  setReplyOpen(false);
                  setReplyBody("");
                }}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm font-bold text-zinc-300 transition hover:bg-white/5"
              >
                Discard
              </button>
              <button
                type="submit"
                disabled={sending || !replyBody.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-[#7C6FFF] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#9186FF] disabled:opacity-60"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Send
              </button>
            </div>
          </div>
        </form>
      ) : null}

      <LeadDrawer
        leadId={leadDrawerId}
        onClose={() => setLeadDrawerId(null)}
        teamMembers={teamMembers}
      />
    </div>
  );
}
