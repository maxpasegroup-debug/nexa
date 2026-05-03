"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MessageCircle, PhoneCall } from "lucide-react";

import { SimpleLead } from "./simple-lead-types";

function timeLabel(value?: string | null) {
  if (!value) return "Recently";
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return "Today";
  if (hours < 24) {
    return `Today ${date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}`;
  }
  if (hours < 48) return "Yesterday";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

function industry(lead: SimpleLead) {
  return lead.agentInterest ?? lead.leadSource ?? lead.source ?? "Business workspace";
}

function location(lead: SimpleLead) {
  return lead.email?.split("@")[1] ?? "Location pending";
}

function sessionState(lead: SimpleLead) {
  const status = lead.onboardingSession?.status ?? "COLLECTING";
  const score = lead.onboardingSession?.completenessScore ?? 0;

  if (["DELIVERED", "SDE_APPROVED"].includes(status) || lead.onboardingSession?.buildStatus === "PREVIEW") {
    return {
      icon: "🎉",
      started: "Workspace delivered!",
      body: (
        <>
          <p>Status: Awaiting trial activation</p>
          <p>Preview link sent to boss</p>
        </>
      ),
      actions: (
        <>
          <a
            href={lead.phone ? `tel:${lead.phone.replace(/[^\d+]/g, "")}` : undefined}
            className="flex-1 rounded-xl border border-[#22D9A0]/30 px-3 py-2 text-center text-xs font-bold text-[#22D9A0]"
          >
            Call boss to activate
          </a>
          <Link
            href="/workspace-preview"
            className="flex-1 rounded-xl bg-[#22D9A0] px-3 py-2 text-center text-xs font-extrabold text-black"
          >
            View preview
          </Link>
        </>
      ),
    };
  }

  if (["SUBMITTED", "SDE_BUILDING", "CLARIFICATION_NEEDED"].includes(status)) {
    return {
      icon: "✅",
      started: `Submitted to SDE: ${timeLabel(lead.onboardingSession?.submittedAt)}`,
      body: (
        <>
          <p>Status: SDE building workspace</p>
          <p>Expected delivery: Within 24 hours</p>
        </>
      ),
      actions: (
        <>
          <Link
            href={`/bdm/onboarding/${lead.id}`}
            className="flex-1 rounded-xl border border-white/10 px-3 py-2 text-center text-xs font-bold text-zinc-200"
          >
            View summary
          </Link>
          <button
            type="button"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#7C6FFF]/30 px-3 py-2 text-xs font-bold text-[#a89fff]"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Message SDE
          </button>
        </>
      ),
    };
  }

  return {
    icon: "🧠",
    started: `Started onboarding: ${timeLabel(lead.onboardingSession?.createdAt ?? lead.updatedAt)}`,
    body: (
      <>
        <div className="flex items-center gap-3">
          <span>Completeness:</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.08]">
            <div className="h-full rounded-full bg-[#7C6FFF]" style={{ width: `${Math.min(100, score)}%` }} />
          </div>
          <span>{score}%</span>
        </div>
        <p>Status: Session in progress</p>
      </>
    ),
    actions: (
      <Link
        href={`/bdm/onboarding/${lead.id}`}
        className="w-full rounded-xl bg-[#7C6FFF] px-3 py-2 text-center text-xs font-extrabold text-white"
      >
        Continue onboarding →
      </Link>
    ),
  };
}

export function OnboardingList() {
  const [leads, setLeads] = useState<SimpleLead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLeads() {
      setLoading(true);
      const response = await fetch("/api/bdm/leads?status=ONBOARDING", { cache: "no-store" });
      setLoading(false);
      if (!response.ok) return;
      const data = (await response.json()) as { leads: SimpleLead[] };
      setLeads(data.leads);
    }

    void loadLeads();
  }, []);

  const activeCount = useMemo(() => leads.length, [leads]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#13131c] p-8 text-sm text-zinc-400">
        Loading onboarding sessions...
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#13131c] p-8 text-center">
        <p className="text-sm text-zinc-400">No active onboarding sessions yet.</p>
        <Link href="/bdm/leads" className="mt-4 inline-flex rounded-xl bg-[#7C6FFF] px-4 py-2 text-sm font-bold text-white">
          Go to leads
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">{activeCount} active onboarding sessions</p>
      </div>
      <section className="grid gap-4 lg:grid-cols-2">
        {leads.map((lead) => {
          const state = sessionState(lead);
          return (
            <article key={lead.id} className="rounded-2xl border border-white/10 bg-[#13131c] p-5">
              <div>
                <h3 className="font-heading text-base font-bold text-white">
                  <span className="mr-2">{state.icon}</span>
                  {lead.company || lead.name}
                </h3>
                <p className="mt-1 text-sm text-zinc-500">
                  {industry(lead)} · {location(lead)}
                </p>
                <p className="mt-2 text-xs text-zinc-400">{state.started}</p>
              </div>
              <div className="my-4 border-t border-white/10" />
              <div className="space-y-2 text-sm text-zinc-300">{state.body}</div>
              <div className="my-4 border-t border-white/10" />
              <div className="flex flex-wrap gap-2">
                {state.actions}
                {lead.phone ? (
                  <a
                    href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`}
                    className="inline-flex items-center justify-center rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-zinc-300"
                    aria-label="Call lead"
                  >
                    <PhoneCall className="h-3.5 w-3.5" />
                  </a>
                ) : null}
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
