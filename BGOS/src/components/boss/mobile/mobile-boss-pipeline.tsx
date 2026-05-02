"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type MobilePipelineLead = {
  id: string;
  name: string;
  company: string | null;
  phone: string | null;
  score: number;
  status: string;
  notes: string | null;
  assignee?: {
    id: string;
    name: string;
    role: string;
  } | null;
};

type MobilePipeline = {
  id: string;
  name: string;
  productName: string;
  color: string;
  stages: string[];
  leads: MobilePipelineLead[];
};

type MobileBossPipelineProps = {
  pipelines: MobilePipeline[];
  leads?: MobilePipelineLead[];
};

function initials(name?: string | null) {
  if (!name) return "BG";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function scoreColor(score: number) {
  if (score >= 70) return "#22D9A0";
  if (score >= 40) return "#F5A623";
  return "#FF6B6B";
}

function normalizeStage(value: string) {
  return value.toUpperCase().replace(/\s+/g, "_");
}

export function MobileBossPipeline({ pipelines, leads = [] }: MobileBossPipelineProps) {
  const fallbackPipeline = useMemo<MobilePipeline>(
    () => ({
      id: "default",
      name: "Sales pipeline",
      productName: "Sales",
      color: "#7C6FFF",
      stages: ["NEW", "CONTACTED", "DEMO", "PROPOSAL", "WON"],
      leads,
    }),
    [leads],
  );
  const allPipelines = pipelines.length > 0 ? pipelines : [fallbackPipeline];
  const [activePipelineId, setActivePipelineId] = useState(allPipelines[0]?.id ?? "default");
  const activePipeline = allPipelines.find((item) => item.id === activePipelineId) ?? allPipelines[0];
  const stages = activePipeline.stages.length > 0 ? activePipeline.stages : ["NEW", "CONTACTED", "DEMO", "PROPOSAL", "WON"];
  const [activeStage, setActiveStage] = useState(stages[0]);
  const normalizedActive = normalizeStage(activeStage);
  const visibleLeads = activePipeline.leads.filter((lead) => lead.status === normalizedActive || lead.status === activeStage);
  const nextStage = stages[Math.min(stages.findIndex((stage) => stage === activeStage) + 1, stages.length - 1)] ?? activeStage;

  return (
    <main className="mobile-page min-h-screen bg-[var(--bg)] px-4 pt-4 text-[var(--text)]">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-lg font-extrabold">Pipeline</h1>
          <p className="mt-1 text-[11px] text-[var(--muted)]">Move deals before they go cold.</p>
        </div>
        <Link href="/boss/leads?add=1" className="touch-target rounded-full bg-[#22D9A0] px-4 py-2 font-heading text-xs font-bold text-[#070709]">
          Add
        </Link>
      </header>

      {allPipelines.length > 1 ? (
        <div className="mt-4 flex gap-2 overflow-x-auto scroll-x-hidden">
          {allPipelines.map((pipeline) => (
            <button
              key={pipeline.id}
              type="button"
              onClick={() => {
                setActivePipelineId(pipeline.id);
                setActiveStage(pipeline.stages[0] ?? "NEW");
              }}
              className="shrink-0 rounded-full border px-4 py-2 text-xs font-semibold"
              style={{
                borderColor: pipeline.id === activePipeline.id ? pipeline.color : "rgba(255,255,255,0.1)",
                background: pipeline.id === activePipeline.id ? `${pipeline.color}26` : "transparent",
                color: pipeline.id === activePipeline.id ? pipeline.color : "var(--muted)",
              }}
            >
              {pipeline.productName || pipeline.name}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-4 flex gap-2 overflow-x-auto scroll-x-hidden">
        {stages.map((stage) => {
          const count = activePipeline.leads.filter((lead) => lead.status === normalizeStage(stage) || lead.status === stage).length;
          const active = stage === activeStage;
          return (
            <button
              key={stage}
              type="button"
              onClick={() => setActiveStage(stage)}
              className="shrink-0 rounded-full border px-3 py-2 text-[11px] font-semibold"
              style={{
                borderColor: active ? "#7C6FFF" : "rgba(255,255,255,0.1)",
                background: active ? "rgba(124,111,255,0.16)" : "transparent",
                color: active ? "#c9c4ff" : "var(--muted)",
              }}
            >
              {stage.replace(/_/g, " ")} · {count}
            </button>
          );
        })}
      </div>

      <section className="mt-4 space-y-3">
        {visibleLeads.length > 0 ? (
          visibleLeads.map((lead) => (
            <article key={lead.id} className="rounded-[16px] border border-white/10 bg-[var(--card)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate font-heading text-[13px] font-bold">{lead.company || lead.name}</h2>
                  <p className="mt-1 truncate text-[11px] text-[var(--muted)]">{lead.name} · India</p>
                </div>
                <span
                  className="rounded-full px-2.5 py-1 font-heading text-xs font-extrabold"
                  style={{ background: `${scoreColor(lead.score)}1f`, color: scoreColor(lead.score) }}
                >
                  {lead.score}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#7C6FFF]/20 text-[10px] font-bold text-[#c9c4ff]">
                  {initials(lead.assignee?.name)}
                </span>
                <p className="line-clamp-1 text-[11px] text-zinc-500">{lead.notes || "No notes yet. Add context after the next call."}</p>
              </div>
              <div className="mt-4 flex gap-2">
                <button type="button" className="h-10 flex-1 rounded-xl bg-[#7C6FFF] font-heading text-xs font-bold text-white">
                  Move to {nextStage.replace(/_/g, " ")} →
                </button>
                <a
                  href={lead.phone ? `https://wa.me/${lead.phone.replace(/\D/g, "")}` : "#"}
                  className="flex h-10 w-11 items-center justify-center rounded-xl border border-white/10 text-sm"
                >
                  💬
                </a>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-[16px] border border-white/10 bg-[var(--card)] p-5 text-center text-xs text-zinc-500">
            No leads in this stage yet.
          </div>
        )}
      </section>

      <Link href="/boss/leads?add=1" className="fixed bottom-[92px] right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#22D9A0] font-heading text-2xl font-bold text-[#070709] shadow-lg shadow-[#22D9A0]/20">
        +
      </Link>
    </main>
  );
}
