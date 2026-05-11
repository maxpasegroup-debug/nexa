"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { BlizzwayBadge, BlizzwayButton, BlizzwayCard, BlizzwayEmptyState, BlizzwayGradientPanel } from "@/components/blizzway";
import { companionsApi, getApiErrorMessage, type BlizzwayAgent, type CompanionRunResponse, type CompanionStructuredOutput } from "@/lib/api";
import { BlizzwayDashboardShell } from "../../dashboard-shell";

function listOrFallback(items: string[] | undefined, fallback: string[]) {
  return items?.length ? items : fallback;
}

function priceLabel(companion: BlizzwayAgent) {
  if (companion.pricingMode === "free" || companion.creditPrice === 0) return "Free";
  if (companion.pricingMode === "premium") return "Premium";
  if (companion.pricingMode === "subscription") return "Subscription";
  return `${companion.creditPrice} credits`;
}

function DetailList({ title, items }: { title: string; items: string[] }) {
  return (
    <BlizzwayCard as="section">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">{title}</p>
      <div className="mt-4 grid gap-3">
        {items.map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold leading-6 text-slate-700">{item}</div>)}
      </div>
    </BlizzwayCard>
  );
}

function OutputList({ title, items, tone = "indigo" }: { title: string; items?: string[]; tone?: "indigo" | "amber" | "emerald" | "slate" }) {
  if (!items?.length) return null;
  const toneClass = {
    indigo: "bg-indigo-50 text-indigo-800",
    amber: "bg-amber-50 text-amber-800",
    emerald: "bg-emerald-50 text-emerald-800",
    slate: "bg-slate-50 text-slate-700",
  }[tone];

  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">{title}</p>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <div key={item} className={`rounded-2xl p-4 text-sm font-bold leading-6 ${toneClass}`}>{item}</div>
        ))}
      </div>
    </div>
  );
}

function StructuredRunOutput({
  output,
  onCopy,
  onPlaceholderAction,
}: {
  output: CompanionStructuredOutput;
  onCopy: () => void;
  onPlaceholderAction: (label: string) => void;
}) {
  const actionSteps = output.actionSteps?.length ? output.actionSteps : output.nextActions;
  const warnings = output.warnings?.length ? output.warnings : output.safetyNote ? [output.safetyNote] : [];

  return (
    <div className="mt-5 grid gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-2xl font-black tracking-tight text-slate-950">{output.title || "Blizzway guidance"}</h3>
          <p className="mt-2 text-sm font-semibold leading-6 c7-muted">{output.summary}</p>
        </div>
        <button type="button" onClick={onCopy} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700">
          Copy output
        </button>
      </div>

      {output.nexaNote ? (
        <div className="rounded-3xl bg-slate-950 p-5 text-white">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">NEXA note</p>
          <p className="mt-3 text-sm font-semibold leading-6 text-white/72">{output.nexaNote}</p>
        </div>
      ) : null}

      {output.sections?.length ? (
        <div className="grid gap-4">
          {output.sections.map((section, index) => (
            <div key={`${section.heading}-${index}`} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="font-black text-slate-950">{section.heading || `Section ${index + 1}`}</p>
              {section.content ? <p className="mt-2 text-sm font-semibold leading-6 c7-muted">{section.content}</p> : null}
              {section.bullets?.length ? (
                <ul className="mt-3 grid gap-2">
                  {section.bullets.map((bullet) => <li key={bullet} className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-700">{bullet}</li>)}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      <OutputList title="Action steps" items={actionSteps} tone="indigo" />
      <OutputList title="Recommended next actions" items={output.recommendedNextActions} tone="emerald" />
      <OutputList title="Warnings and disclaimers" items={warnings} tone="amber" />

      <div className="grid gap-3 md:grid-cols-2">
        {output.bdpImpact ? (
          <div className="rounded-3xl border border-indigo-100 bg-indigo-50 p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-700">BDP impact</p>
            <p className="mt-3 text-sm font-bold leading-6 text-indigo-900">{output.bdpImpact}</p>
          </div>
        ) : null}
        {output.pathwayImpact ? (
          <div className="rounded-3xl border border-cyan-100 bg-cyan-50 p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Pathway impact</p>
            <p className="mt-3 text-sm font-bold leading-6 text-cyan-900">{output.pathwayImpact}</p>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => onPlaceholderAction("Save to BDP")} className="rounded-full bg-indigo-600 px-4 py-2 text-xs font-black text-white transition hover:bg-indigo-700">
          Save to BDP
        </button>
        <button type="button" onClick={() => onPlaceholderAction("Add to My Pathway")} className="rounded-full bg-slate-950 px-4 py-2 text-xs font-black text-white transition hover:bg-slate-800">
          Add to My Pathway
        </button>
        <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-black text-slate-600">
          {output.provider || "provider"} {output.fallbackUsed ? "fallback" : "generated"}
        </span>
      </div>
    </div>
  );
}

export function CompanionDetailClient() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [companion, setCompanion] = useState<BlizzwayAgent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [running, setRunning] = useState(false);
  const [notice, setNotice] = useState("");
  const [runError, setRunError] = useState("");
  const [inputs, setInputs] = useState({ goal: "", currentStatus: "", mainBlocker: "" });
  const [run, setRun] = useState<CompanionRunResponse["run"] | null>(null);

  useEffect(() => {
    let cancelled = false;

    companionsApi
      .getCompanion(slug)
      .then((response) => {
        if (!cancelled) setCompanion(response.companion);
      })
      .catch((caught) => {
        if (!cancelled) setError(getApiErrorMessage(caught));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  function idempotencyKey(prefix: string) {
    return `${prefix}-${slug}-${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;
  }

  async function activate() {
    setBusy(true);
    setNotice("");
    try {
      const response = await companionsApi.activateCompanion(slug, idempotencyKey("activate"));
      setCompanion(response.companion);
      setNotice(response.activation.duplicate ? "Already active. No duplicate activation was created." : "Companion activated and attached to your Blizzway pathway.");
    } catch (caught) {
      setNotice(getApiErrorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  async function runCompanion() {
    setBusy(true);
    setRunning(true);
    setNotice("");
    setRunError("");
    setRun(null);
    try {
      const response = await companionsApi.runCompanion(slug, { inputs, idempotencyKey: idempotencyKey("run") });
      setRun(response.run);
      setNotice(`Run completed. ${response.run.creditsCharged} credits charged.`);
    } catch (caught) {
      setRunError(getApiErrorMessage(caught));
    } finally {
      setBusy(false);
      setRunning(false);
    }
  }

  async function copyOutput() {
    if (!run) return;
    await navigator.clipboard.writeText(JSON.stringify(run.output, null, 2));
    setNotice("Output copied.");
  }

  function placeholderAction(label: string) {
    setNotice(`${label} is queued as a beta placeholder. Your generated output remains saved in run history.`);
  }

  if (loading) {
    return (
      <BlizzwayDashboardShell activeHref="/companions" title="Companion detail" description="Loading companion details from BGOS.">
        <BlizzwayCard as="section" className="mt-5"><p className="text-sm font-black text-slate-950">Loading companion...</p></BlizzwayCard>
      </BlizzwayDashboardShell>
    );
  }

  if (error || !companion) {
    return (
      <BlizzwayDashboardShell activeHref="/companions" title="Companion detail" description="This companion could not be loaded.">
        <div className="mt-5"><BlizzwayEmptyState title="Companion unavailable" description={error || "BGOS did not return this companion."} actionLabel="Back to companions" actionHref="/companions" /></div>
      </BlizzwayDashboardShell>
    );
  }

  const capabilities = listOrFallback(companion.capabilities, ["Guided intake", "Structured action planning", "Pathway-ready checklist"]);
  const expectedOutput = listOrFallback(companion.expectedOutput, ["Summary", "Checklist", "Next actions", "Safety note"]);
  const requiredInputs = listOrFallback(companion.requiredInputs, ["Goal", "Current status", "Main blocker"]);
  const recommendedFor = listOrFallback(companion.recommendedFor, ["Blizzway pathway users"]);
  const gated = companion.pricingMode === "premium" || companion.pricingMode === "subscription";

  return (
    <BlizzwayDashboardShell activeHref="/companions" eyebrow="Companion detail" title={companion.name} description={companion.shortDescription || companion.description} breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Companions", href: "/companions" }, { label: companion.name }]}>
      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.42fr]">
        <BlizzwayGradientPanel>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[22px] bg-white text-xl font-black text-slate-950 shadow-xl">{companion.icon}</span>
            <div>
              <div className="flex flex-wrap gap-2">
                <BlizzwayBadge tone="cyan">{companion.category}</BlizzwayBadge>
                <BlizzwayBadge tone={companion.active ? "emerald" : "slate"}>{companion.active ? "Active" : "Available"}</BlizzwayBadge>
                <BlizzwayBadge tone="purple">{priceLabel(companion)}</BlizzwayBadge>
              </div>
              <h2 className="mt-4 max-w-3xl text-[2rem] font-black leading-tight tracking-tight sm:text-5xl">{companion.name}</h2>
              <p className="mt-4 max-w-3xl text-base leading-7 text-white/72 sm:text-lg">{companion.longDescription || companion.description}</p>
            </div>
          </div>
        </BlizzwayGradientPanel>
        <BlizzwayCard as="section" className="c7-magical-glow">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Activation</p>
          <p className="mt-4 text-5xl font-black text-slate-950">{priceLabel(companion)}</p>
          <p className="mt-3 text-sm leading-6 c7-muted">Credits are deducted on {companion.chargeOn === "activation" ? "activation" : "run"}. Free companions do not deduct credits.</p>
          <BlizzwayButton type="button" onClick={activate} disabled={busy || companion.active} variant={companion.active ? "secondary" : "primary"} className="mt-5 w-full">{companion.active ? "Activated" : "Activate companion"}</BlizzwayButton>
          {notice ? <p className="mt-3 text-sm font-bold text-indigo-700">{notice}</p> : null}
        </BlizzwayCard>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.45fr]">
        <div className="grid gap-5">
          <DetailList title="What it helps with" items={capabilities} />
          <DetailList title="Required inputs" items={requiredInputs} />
          <DetailList title="Expected output" items={expectedOutput} />
        </div>
        <div className="grid gap-5">
          <BlizzwayCard as="section" className="bg-slate-950 text-white"><p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">NEXA recommendation</p><p className="mt-4 text-sm leading-6 text-white/72">{companion.nexaRecommendation}</p></BlizzwayCard>
          <DetailList title="Recommended for" items={recommendedFor} />
          <BlizzwayCard as="section"><p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Safety note</p><p className="mt-3 text-sm leading-6 c7-muted">{companion.safetyNote}</p></BlizzwayCard>
        </div>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[0.52fr_1fr]">
        <BlizzwayCard as="section">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Run companion</p>
          <div className="mt-5 grid gap-3">
            <input value={inputs.goal} onChange={(event) => setInputs((value) => ({ ...value, goal: event.target.value }))} placeholder="Goal" className="h-11 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none focus:border-indigo-400" />
            <input value={inputs.currentStatus} onChange={(event) => setInputs((value) => ({ ...value, currentStatus: event.target.value }))} placeholder="Current status" className="h-11 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none focus:border-indigo-400" />
            <input value={inputs.mainBlocker} onChange={(event) => setInputs((value) => ({ ...value, mainBlocker: event.target.value }))} placeholder="Main blocker" className="h-11 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none focus:border-indigo-400" />
            <BlizzwayButton type="button" onClick={runCompanion} disabled={busy || gated || !companion.active} variant="dark">{running ? "NEXA is crafting..." : gated ? "Premium gated" : companion.active ? "Run companion" : "Activate first"}</BlizzwayButton>
          </div>
        </BlizzwayCard>
        <BlizzwayCard as="section">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Structured output</p>
          {running ? (
            <div className="mt-5 rounded-3xl border border-indigo-100 bg-indigo-50 p-5 text-sm font-black text-indigo-800">
              NEXA is crafting your guidance...
            </div>
          ) : run ? (
            <StructuredRunOutput output={run.output} onCopy={copyOutput} onPlaceholderAction={placeholderAction} />
          ) : runError ? (
            <div className="mt-5 rounded-3xl border border-red-100 bg-red-50 p-5">
              <p className="text-sm font-black text-red-700">{runError}</p>
              <BlizzwayButton type="button" onClick={runCompanion} disabled={busy || gated || !companion.active} variant="secondary" className="mt-4">
                Retry safely
              </BlizzwayButton>
            </div>
          ) : (
            <p className="mt-3 text-sm leading-6 c7-muted">Run history will appear here. Outputs are AI-generated when available, with a safe rule-based fallback preserved by BGOS.</p>
          )}
        </BlizzwayCard>
      </section>
    </BlizzwayDashboardShell>
  );
}
