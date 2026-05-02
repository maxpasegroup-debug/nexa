"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Copy } from "lucide-react";

import { formatSdeOnboardingSummary } from "@/lib/onboarding-summary-format";

export type OnboardingRequestCardSession = {
  id: string;
  sdeId?: string | null;
  companyName: string;
  bdmName?: string | null;
  plan: string | null;
  status: string;
  submittedAt: string;
  completenessScore: number;
  summaryText?: string | null;
  summaryJson?: unknown;
  callNotes: Array<{
    content: string;
    createdAt: string;
    author?: { name?: string | null } | null;
  }>;
  bdmAnalysis?: {
    patterns?: unknown;
    warnings?: unknown;
    tips?: unknown;
    urgentAlerts?: unknown;
    topHooks?: unknown;
    commonPains?: unknown;
  } | null;
  employeeCount: number;
  pipelineCount: number;
};

function complexity(session: OnboardingRequestCardSession) {
  const score = session.employeeCount + session.pipelineCount * 2;
  if (score >= 10) return { label: "Complex", className: "border-red-400/30 bg-red-400/10 text-red-200" };
  if (score >= 5) return { label: "Medium", className: "border-amber-400/30 bg-amber-400/10 text-amber-200" };
  return { label: "Simple", className: "border-[#22D9A0]/30 bg-[#22D9A0]/10 text-[#22D9A0]" };
}

function ringColor(score: number) {
  if (score >= 80) return "#22D9A0";
  if (score >= 55) return "#F5A623";
  return "#FF6B6B";
}

export function OnboardingRequestCard({ session }: { session: OnboardingRequestCardSession }) {
  const [copied, setCopied] = useState(false);
  const complexityBadge = complexity(session);
  const copyText = useMemo(
    () =>
      formatSdeOnboardingSummary({
        companyName: session.companyName,
        selectedPlan: session.plan,
        summaryText: session.summaryText,
        summaryJson: session.summaryJson,
        callNotes: session.callNotes,
        bdmAnalysis: session.bdmAnalysis,
      }),
    [session],
  );

  async function copySummary() {
    await navigator.clipboard.writeText(copyText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <article className="rounded-2xl border border-white/10 bg-[#13131c] p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-white">{session.companyName}</h2>
          <p className="mt-1 text-sm text-zinc-500">
            BDM: {session.bdmName ?? "Unassigned"} · {session.plan ?? "Plan pending"} ·{" "}
            {new Date(session.submittedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className={`rounded-full border px-3 py-1 text-xs font-bold ${complexityBadge.className}`}>
              {complexityBadge.label}
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-bold text-zinc-300">
              {session.status}
            </span>
          </div>
        </div>
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-sm font-extrabold text-black"
          style={{
            background: `conic-gradient(${ringColor(session.completenessScore)} ${session.completenessScore}%, rgba(255,255,255,0.1) 0)`,
          }}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#13131c] text-white">
            {session.completenessScore}%
          </span>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => void copySummary()}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-extrabold text-black"
        >
          <Copy className="h-4 w-4" /> {copied ? "Copied ✓" : "📋 Copy NEXA summary"}
        </button>
        <Link
          href={`/sde/workspaces/${session.id}`}
          className="inline-flex flex-1 items-center justify-center rounded-xl border border-[#7C6FFF]/40 px-4 py-3 text-sm font-bold text-[#c8c2ff]"
        >
          Open workspace builder →
        </Link>
      </div>
    </article>
  );
}
