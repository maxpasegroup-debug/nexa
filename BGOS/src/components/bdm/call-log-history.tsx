"use client";

import { useMemo, useState } from "react";
import { PhoneCall } from "lucide-react";

type CallOutcome =
  | "ANSWERED_INTERESTED"
  | "ANSWERED_NOT_INTERESTED"
  | "ANSWERED_CALLBACK"
  | "NO_ANSWER"
  | "BUSY"
  | "WRONG_NUMBER";

type CallLog = {
  id: string;
  leadId: string;
  outcome: CallOutcome;
  duration?: number | null;
  notes?: string | null;
  nextAction?: string | null;
  createdAt: string | Date;
  lead?: {
    id: string;
    name: string;
  } | null;
};

type CallLogHistoryProps = {
  callLogs: CallLog[];
  leadId?: string;
};

const outcomeStyles: Record<CallOutcome, string> = {
  ANSWERED_INTERESTED: "bg-[#22D9A0]/10 text-[#22D9A0]",
  ANSWERED_NOT_INTERESTED: "bg-[#FF6B6B]/10 text-[#FF6B6B]",
  ANSWERED_CALLBACK: "bg-[#F5A623]/10 text-[#F5A623]",
  NO_ANSWER: "bg-white/5 text-zinc-500",
  BUSY: "bg-white/5 text-zinc-500",
  WRONG_NUMBER: "bg-white/5 text-zinc-500",
};

const outcomeLabels: Record<CallOutcome, string> = {
  ANSWERED_INTERESTED: "Interested",
  ANSWERED_NOT_INTERESTED: "Not interested",
  ANSWERED_CALLBACK: "Callback",
  NO_ANSWER: "No answer",
  BUSY: "Busy",
  WRONG_NUMBER: "Wrong number",
};

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function dateLabel(value: string | Date) {
  const date = new Date(value);
  const today = startOfDay(new Date());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const callDay = startOfDay(date);

  if (callDay.getTime() === today.getTime()) return "Today";
  if (callDay.getTime() === yesterday.getTime()) return "Yesterday";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function timeAgo(value: string | Date) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
}

function groupCalls(logs: CallLog[]) {
  return logs.reduce<Array<{ label: string; logs: CallLog[] }>>((acc, log) => {
    const label = dateLabel(log.createdAt);
    const existing = acc.find((group) => group.label === label);
    if (existing) {
      existing.logs.push(log);
    } else {
      acc.push({ label, logs: [log] });
    }
    return acc;
  }, []);
}

export function CallLogHistory({ callLogs, leadId }: CallLogHistoryProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const grouped = useMemo(() => {
    const filtered = leadId
      ? callLogs.filter((call) => call.leadId === leadId)
      : callLogs;
    return groupCalls(
      [...filtered].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    );
  }, [callLogs, leadId]);

  if (grouped.length === 0) {
    return (
      <section className="rounded-2xl border border-white/10 bg-[#13131c] p-8 text-center text-sm text-zinc-500">
        No calls logged yet. Log your first call from any lead card.
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-[#13131c] p-4">
      <div className="space-y-5">
        {grouped.map((group) => (
          <div key={group.label}>
            <div className="mb-3 flex items-center gap-3">
              <span className="h-px flex-1 bg-white/10" />
              <span className="text-[11px] font-bold uppercase text-zinc-600">
                {group.label}
              </span>
              <span className="h-px flex-1 bg-white/10" />
            </div>

            <div className="space-y-3">
              {group.logs.map((call) => {
                const isExpanded = Boolean(expanded[call.id]);
                return (
                  <article
                    key={call.id}
                    className="rounded-xl border border-white/10 bg-[#0e0e13] p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          window.dispatchEvent(
                            new CustomEvent("bdm:open-lead", {
                              detail: { leadId: call.leadId },
                            }),
                          )
                        }
                        className="min-w-0 text-left text-[13px] font-bold text-white hover:text-[#7C6FFF]"
                      >
                        {call.lead?.name ?? "Lead"}
                      </button>
                      <span
                        className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${outcomeStyles[call.outcome]}`}
                      >
                        {outcomeLabels[call.outcome]}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                      <span className="inline-flex items-center gap-1">
                        <PhoneCall className="h-3.5 w-3.5" />
                        {timeAgo(call.createdAt)}
                      </span>
                      {call.duration ? <span>{call.duration} min</span> : null}
                    </div>

                    {call.notes ? (
                      <button
                        type="button"
                        onClick={() =>
                          setExpanded((value) => ({
                            ...value,
                            [call.id]: !isExpanded,
                          }))
                        }
                        className={`mt-2 block w-full text-left text-xs leading-5 text-zinc-400 ${
                          isExpanded ? "" : "truncate"
                        }`}
                      >
                        {call.notes}
                      </button>
                    ) : null}

                    {call.nextAction ? (
                      <p className="mt-2 text-xs font-semibold text-[#7C6FFF]">
                        Next: {call.nextAction}
                      </p>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export type { CallLog };
