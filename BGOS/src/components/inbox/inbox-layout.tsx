"use client";

import { useCallback, useEffect, useState } from "react";
import { Inbox, Loader2, RefreshCw, Search, Star } from "lucide-react";

import { EmailReader } from "@/components/inbox/email-reader";

type EmailItem = {
  id: string;
  from: string;
  fromName: string | null;
  subject: string;
  snippet: string | null;
  isRead: boolean;
  isStarred: boolean;
  label: string;
  receivedAt: string;
  lead: { id: string; name: string } | null;
};

type InboxCounts = {
  all: number;
  unread: number;
  leads: number;
  support: number;
  important: number;
  starred: number;
  spam: number;
};

type InboxResponse = {
  emails: EmailItem[];
  total: number;
  counts: InboxCounts;
};

type Filter = "all" | "unread" | "leads" | "support" | "important";

const FILTERS: Array<{ label: string; value: Filter; countKey: keyof InboxCounts }> = [
  { label: "All", value: "all", countKey: "all" },
  { label: "Unread", value: "unread", countKey: "unread" },
  { label: "Leads", value: "leads", countKey: "leads" },
  { label: "Support", value: "support", countKey: "support" },
  { label: "Important", value: "important", countKey: "important" },
];

const labelDot: Record<string, string> = {
  LEAD: "bg-[#22D9A0]",
  SUPPORT: "bg-[#7C6FFF]",
  SPAM: "bg-zinc-500",
  INTERNAL: "bg-[#F5A623]",
  IMPORTANT: "bg-[#FF6B6B]",
  UNCATEGORIZED: "bg-zinc-700",
};

function relativeTime(value: string) {
  const ms = Date.now() - new Date(value).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

function buildParams(filter: Filter, search: string): string {
  const params = new URLSearchParams();
  if (filter === "unread") params.set("unreadOnly", "true");
  else if (filter !== "all") params.set("label", filter.toUpperCase());
  if (search.trim()) params.set("search", search.trim());
  return params.toString();
}

type InboxLayoutProps = {
  businessId?: string;
  disabled?: boolean;
};

export function InboxLayout({ disabled }: InboxLayoutProps) {
  const [emails, setEmails] = useState<EmailItem[]>([]);
  const [counts, setCounts] = useState<InboxCounts>({
    all: 0,
    unread: 0,
    leads: 0,
    support: 0,
    important: 0,
    starred: 0,
    spam: 0,
  });
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchEmails = useCallback(
    async (currentFilter: Filter, currentSearch: string) => {
      setLoading(true);
      const qs = buildParams(currentFilter, currentSearch);
      const response = await fetch(`/api/email/inbox${qs ? `?${qs}` : ""}`, {
        cache: "no-store",
      });
      setLoading(false);
      if (!response.ok) return;
      const data = (await response.json()) as InboxResponse;
      setEmails(data.emails);
      setCounts(data.counts);
    },
    [],
  );

  useEffect(() => {
    if (!disabled) void fetchEmails(filter, search);
  }, [filter, search, fetchEmails, disabled]);

  async function syncEmails() {
    setSyncing(true);
    await fetch("/api/email/sync", { method: "POST" });
    setSyncing(false);
    void fetchEmails(filter, search);
  }

  function handleSelectEmail(id: string) {
    setSelectedId(id);
    setEmails((prev) =>
      prev.map((email) =>
        email.id === id ? { ...email, isRead: true } : email,
      ),
    );
  }

  return (
    <div
      className={`flex h-[calc(100vh-60px)] overflow-hidden${disabled ? " pointer-events-none" : ""}`}
    >
      {/* Left panel: email list */}
      <div className="flex w-[320px] shrink-0 flex-col border-r border-white/[0.07] bg-[#0d0d11]">
        {/* Header */}
        <div className="border-b border-white/[0.07] px-4 pb-3 pt-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-heading text-base font-bold text-white">
              Inbox
            </h2>
            <button
              type="button"
              onClick={() => void syncEmails()}
              disabled={syncing}
              className="rounded-lg border border-white/10 p-2 text-zinc-400 transition hover:border-[#7C6FFF]/40 hover:text-white disabled:opacity-50"
              aria-label="Sync emails"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`}
              />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-600" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search emails..."
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] py-2 pl-9 pr-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[#7C6FFF]/50"
            />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 overflow-x-auto border-b border-white/[0.07] px-3 py-2 [scrollbar-width:none]">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={`shrink-0 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition ${
                filter === f.value
                  ? "bg-[#7C6FFF] text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {f.label}
              {counts[f.countKey] > 0 ? (
                <span
                  className={`ml-1 ${filter === f.value ? "text-white/70" : "text-zinc-600"}`}
                >
                  {counts[f.countKey]}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Email list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-700" />
            </div>
          ) : emails.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <Inbox className="h-8 w-8 text-zinc-700" />
              <p className="mt-3 text-sm font-semibold text-zinc-500">
                No emails
              </p>
              <p className="mt-1 text-xs text-zinc-600">
                {filter === "all"
                  ? "Sync your Gmail to see emails here"
                  : "No emails match this filter"}
              </p>
            </div>
          ) : (
            emails.map((email) => (
              <button
                key={email.id}
                type="button"
                onClick={() => handleSelectEmail(email.id)}
                className={`w-full border-b border-white/[0.05] px-4 py-3 text-left transition hover:bg-white/[0.03] ${
                  selectedId === email.id
                    ? "bg-[#7C6FFF]/[0.08] border-l-2 border-l-[#7C6FFF]"
                    : ""
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {!email.isRead ? (
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#7C6FFF]" />
                  ) : (
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`truncate text-[13px] ${
                          email.isRead
                            ? "text-zinc-400"
                            : "font-bold text-white"
                        }`}
                      >
                        {email.fromName ?? email.from.split("@")[0]}
                      </span>
                      <span className="shrink-0 text-[10px] text-zinc-600">
                        {relativeTime(email.receivedAt)}
                      </span>
                    </div>
                    <p
                      className={`mt-0.5 truncate text-xs ${
                        email.isRead
                          ? "text-zinc-500"
                          : "font-semibold text-zinc-300"
                      }`}
                    >
                      {email.subject}
                    </p>
                    {email.snippet ? (
                      <p className="mt-0.5 truncate text-[11px] text-zinc-600">
                        {email.snippet}
                      </p>
                    ) : null}
                    <div className="mt-1.5 flex items-center gap-1.5">
                      {email.label !== "UNCATEGORIZED" ? (
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${labelDot[email.label] ?? "bg-zinc-700"}`}
                        />
                      ) : null}
                      {email.lead ? (
                        <span className="rounded bg-[#22D9A0]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#22D9A0]">
                          Lead
                        </span>
                      ) : null}
                      {email.isStarred ? (
                        <Star className="h-3 w-3 fill-[#F5A623] text-[#F5A623]" />
                      ) : null}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right panel: email reader */}
      <div className="min-w-0 flex-1 overflow-y-auto bg-[#0d0d11]">
        <EmailReader emailId={selectedId} />
      </div>
    </div>
  );
}
