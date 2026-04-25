"use client";

import { useMemo, useState } from "react";
import { Bolt } from "lucide-react";

import { NexaAvatar } from "@/components/nexa/nexa-avatar";

type BriefTask = {
  title: string;
  priority: "high" | "medium" | "low";
  leadId: string | null;
  leadName?: string | null;
  type: "follow_up" | "new_lead" | "demo" | "proposal" | "admin";
};

type DailyBriefData = {
  greeting: string;
  tasks: BriefTask[];
  insights: string[];
};

type DailyBriefProps = {
  brief: DailyBriefData | null;
  loading: boolean;
  animateLines?: boolean;
};

const priorityColors = {
  high: "#FF6B6B",
  medium: "#F5A623",
  low: "#6B6878",
};

const typeLabels: Record<BriefTask["type"], string> = {
  follow_up: "Follow-up",
  new_lead: "New Lead",
  demo: "Demo",
  proposal: "Proposal",
  admin: "Admin",
};

export function DailyBrief({ brief, loading, animateLines = false }: DailyBriefProps) {
  const [expanded, setExpanded] = useState(false);
  const [doneTasks, setDoneTasks] = useState<Record<number, boolean>>({});
  const today = useMemo(
    () =>
      new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date()),
    [],
  );

  if (loading) {
    return (
      <section className="rounded-2xl border border-white/10 bg-[#13131c] p-5">
        <div className="h-24 animate-pulse rounded-xl bg-white/5" />
      </section>
    );
  }

  if (!brief) {
    return null;
  }

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[rgba(124,111,255,0.05)] p-5">
      <div className="absolute bottom-0 left-0 top-0 w-1 bg-gradient-to-b from-[#7C6FFF] to-[#22D9A0]" />
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <NexaAvatar size="sm" />
          <div>
            <p className="text-[11px] font-bold uppercase text-zinc-500">
              Good morning brief
            </p>
            <p className="mt-1 text-xs text-zinc-600">Powered by NEXA</p>
          </div>
        </div>
        <p className="text-xs text-zinc-500">{today}</p>
      </div>

      <p
        className={`mb-4 mt-5 text-base italic leading-7 text-white ${
          animateLines ? "bdm-brief-line" : ""
        }`}
        style={{ animationDelay: "0ms" }}
      >
        {brief.greeting}
      </p>

      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="mb-4 text-sm font-semibold text-[#7C6FFF] md:hidden"
      >
        {expanded ? "Hide full brief" : "See full brief"}
      </button>

      <div className={`${expanded ? "block" : "hidden"} space-y-5 md:block`}>
        <div>
          <h3 className="font-heading text-sm font-bold text-white">
            Your tasks today
          </h3>
          <div className="mt-3 space-y-2">
            {brief.tasks.slice(0, 5).map((task, index) => (
              <div
                key={`${task.title}-${index}`}
                className={`flex items-center gap-3 rounded-xl border border-white/10 bg-[#0e0e13] px-3 py-2.5 ${
                  animateLines ? "bdm-brief-line" : ""
                }`}
                style={{ animationDelay: `${(index + 1) * 200}ms` }}
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: priorityColors[task.priority] }}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-[13px] text-white transition ${
                      doneTasks[index] ? "text-zinc-500 line-through" : ""
                    }`}
                  >
                    {task.title}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-zinc-500">
                      {typeLabels[task.type]}
                    </span>
                    {task.leadId ? (
                      <button
                        type="button"
                        onClick={() =>
                          window.dispatchEvent(
                            new CustomEvent("bdm:open-lead", {
                              detail: { leadId: task.leadId },
                            }),
                          )
                        }
                        className="truncate text-[11px] font-semibold text-[#7C6FFF]"
                      >
                        {task.leadName ?? "Open lead"}
                      </button>
                    ) : null}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(doneTasks[index])}
                  onChange={(event) =>
                    setDoneTasks({
                      ...doneTasks,
                      [index]: event.target.checked,
                    })
                  }
                  className="h-4 w-4 accent-[#7C6FFF]"
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-heading text-sm font-bold text-white">
            NEXA tips for today
          </h3>
          <div className="mt-3 space-y-2">
            {brief.insights.slice(0, 3).map((insight) => (
              <div
                key={insight}
                className={`flex gap-2 text-[13px] text-zinc-400 ${
                  animateLines ? "bdm-brief-line" : ""
                }`}
                style={{ animationDelay: `${(brief.tasks.length + 1) * 200}ms` }}
              >
                <Bolt className="mt-0.5 h-4 w-4 shrink-0 text-[#7C6FFF]" />
                {insight}
              </div>
            ))}
          </div>
        </div>
      </div>
      {animateLines ? (
        <style jsx>{`
          .bdm-brief-line {
            opacity: 0;
            transform: translateY(8px);
            animation: bdmBriefFade 500ms ease forwards;
          }

          @keyframes bdmBriefFade {
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      ) : null}
    </section>
  );
}
