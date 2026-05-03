"use client";

import { useState } from "react";
import { Check, Clipboard } from "lucide-react";

export type AgentIntegrationJob = {
  id: string;
  status: string;
  updatedAt: string;
  customConfig: Record<string, unknown>;
  agent: {
    slug: string;
    name: string;
    icon: string;
    colorPrimary: string;
  };
  business: {
    id: string;
    clientId?: string | null;
    name: string;
    plan: string;
  };
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function timeAgo(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return "Payment received just now";
  if (hours < 24) return `Payment received ${hours}h ago`;
  return `Payment received ${Math.floor(hours / 24)}d ago`;
}

function requirements(config: Record<string, unknown>) {
  return asRecord(config.collectedData);
}

function briefFor(job: AgentIntegrationJob) {
  const rows = Object.entries(requirements(job.customConfig))
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join("\n");

  return `AGENT INTEGRATION JOB
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Client ID:    ${job.business.clientId ?? `CLT-${job.business.id.slice(-6).toUpperCase()}`}
Business:     ${job.business.name}
Agent:        ${job.agent.name} (${job.agent.slug})
Plan:         ${job.business.plan}
Payment:      Confirmed ✅

INTEGRATION REQUIREMENTS (from NEXA session):
${rows || "No structured requirements found. Check the session notes."}

TASK:
Add the ${job.agent.name} module to this customer's existing
workspace. This is NOT a new workspace build.
Do not touch any existing data or routes.
Only ADD the agent module files.

Say GO when you understand the scope.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
}

export function AgentIntegrationCard({
  job,
  onComplete,
}: {
  job: AgentIntegrationJob;
  onComplete: (id: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const data = requirements(job.customConfig);

  async function copyBrief() {
    await navigator.clipboard.writeText(briefFor(job));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function markComplete() {
    setLoading(true);
    const response = await fetch(`/api/sde/agent-integrations/${job.id}/complete`, {
      method: "POST",
    });
    setLoading(false);
    if (response.ok) onComplete(job.id);
  }

  return (
    <article className="rounded-2xl border border-white/10 bg-[#13131c] p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl"
            style={{ backgroundColor: `${job.agent.colorPrimary}22`, color: job.agent.colorPrimary }}
          >
            {job.agent.icon}
          </div>
          <div>
            <h2 className="font-heading text-xl font-extrabold text-white">{job.agent.name}</h2>
            <p className="mt-1 text-sm text-zinc-400">
              {job.business.name} · {job.business.plan}
            </p>
            <span className="mt-3 inline-flex rounded-full border border-[#F5A623]/30 bg-[#F5A623]/10 px-3 py-1 text-[11px] font-bold text-[#F5A623]">
              Integration job — not a new workspace build
            </span>
          </div>
        </div>
        <p className="text-xs font-bold text-zinc-500">{timeAgo(job.updatedAt)}</p>
      </div>

      <div className="mt-5 rounded-xl border border-white/10 bg-[#0e0e13] p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">Collected data</p>
        <div className="mt-3 grid gap-2 text-sm">
          {Object.entries(data).length ? (
            Object.entries(data).map(([key, value]) => (
              <div key={key} className="grid gap-1 rounded-lg bg-white/[0.03] px-3 py-2 md:grid-cols-[180px_1fr]">
                <span className="text-zinc-500">{key}</span>
                <span className="text-zinc-200">{String(value)}</span>
              </div>
            ))
          ) : (
            <p className="text-zinc-500">No structured data attached.</p>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void copyBrief()}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-bold text-zinc-200"
        >
          <Clipboard className="h-4 w-4" />
          {copied ? "Copied" : "Copy integration brief"}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => void markComplete()}
          className="inline-flex items-center gap-2 rounded-xl bg-[#22D9A0] px-4 py-2.5 text-sm font-extrabold text-black disabled:opacity-60"
        >
          <Check className="h-4 w-4" />
          {loading ? "Completing..." : "Mark complete"}
        </button>
      </div>
    </article>
  );
}
