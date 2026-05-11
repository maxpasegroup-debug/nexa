"use client";

import { useEffect, useState } from "react";

import { BlizzwayBadge, BlizzwayButton, BlizzwayCard, BlizzwayEmptyState, BlizzwayGradientPanel } from "@/components/blizzway";
import { bdpApi, getApiErrorMessage, type BlizzwayBdpResponse } from "@/lib/api";
import { BlizzwayDashboardShell } from "../dashboard-shell";

export default function BdpPage() {
  const [data, setData] = useState<BlizzwayBdpResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    bdpApi.getBdp()
      .then((response) => {
        if (active) setData(response);
      })
      .catch((caught) => {
        if (active) setError(getApiErrorMessage(caught));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const bdp = data?.bdp;
  const metrics = bdp
    ? [
        { label: "IQ", value: bdp.metrics.iq, note: "Aptitude signal" },
        { label: "EQ", value: bdp.metrics.eq, note: "Emotional intelligence" },
        { label: "CQ", value: bdp.metrics.cq, note: "Cultural intelligence" },
        { label: "AQ", value: bdp.metrics.aq, note: "Adaptability quotient" },
        { label: "LQ", value: bdp.metrics.lq, note: "Learning quotient" },
      ]
    : [];

  return (
    <BlizzwayDashboardShell
      activeHref="/bdp"
      title="Blizzway Digital Profile"
      description="Your living career identity, powered by assessments, proof, pathway progress, and NEXA guidance."
    >
      {error ? (
        <BlizzwayCard as="section" className="mt-5">
          <p className="text-sm font-black text-rose-700">Unable to load BDP</p>
          <p className="mt-2 text-sm leading-6 c7-muted">{error}</p>
        </BlizzwayCard>
      ) : null}

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.05fr_0.75fr]">
        <BlizzwayGradientPanel>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">Living Career Identity</p>
          <h2 className="mt-3 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">
            A richer identity than a static resume.
          </h2>
          <p className="mt-4 max-w-2xl leading-7 text-white/72">
            BDP brings your assessments, confidence, proof, learning style, readiness, and pathway story into one evolving profile.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {loading ? [0, 1, 2].map((item) => <div key={item} className="h-24 animate-pulse rounded-2xl bg-white/14" />) : (
              <>
                <div className="rounded-2xl bg-white/14 p-4 ring-1 ring-white/14">
                  <p className="text-4xl font-black">{bdp?.profileStrength ?? 0}%</p>
                  <p className="mt-1 text-sm text-white/70">Profile strength</p>
                </div>
                <div className="rounded-2xl bg-white/14 p-4 ring-1 ring-white/14">
                  <p className="text-4xl font-black">{bdp?.assessmentsCompleted ?? 0}</p>
                  <p className="mt-1 text-sm text-white/70">Assessments completed</p>
                </div>
                <div className="rounded-2xl bg-white/14 p-4 ring-1 ring-white/14">
                  <p className="text-4xl font-black">{bdp?.walletCredits ?? 0}</p>
                  <p className="mt-1 text-sm text-white/70">Credits</p>
                </div>
              </>
            )}
          </div>
        </BlizzwayGradientPanel>

        <BlizzwayCard as="section" className="c7-magical-glow">
          <BlizzwayBadge tone="cyan">Public profile preview</BlizzwayBadge>
          <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-950">
            {bdp?.publicPreview.headline ?? "Blizzway Explorer"}
          </h2>
          <p className="mt-2 text-sm font-semibold c7-muted">
            {bdp?.publicPreview.summary ?? "Your BDP will grow as real profile signals arrive."}
          </p>
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-black text-slate-950">Profile replaces scattered career assets</p>
            <p className="mt-2 text-sm leading-6 c7-muted">
              BDP is designed to become a richer replacement for resume, LinkedIn summary, portfolio proof, and readiness notes.
            </p>
          </div>
          <BlizzwayButton href="/assessments" className="mt-5 w-full" variant="dark">
            Improve BDP with assessments
          </BlizzwayButton>
        </BlizzwayCard>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[0.78fr_1fr]">
        <BlizzwayCard as="section">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Real BDP metrics</p>
          <div className="mt-5 grid gap-3">
            {loading ? [0, 1, 2, 3, 4].map((item) => <div key={item} className="h-24 animate-pulse rounded-2xl bg-slate-100" />) : metrics.length ? metrics.map((metric) => {
              const value = metric.value ?? 0;
              return (
                <div key={metric.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xl font-black text-slate-950">{metric.label}</p>
                      <p className="mt-1 text-sm font-semibold c7-muted">{metric.note}</p>
                    </div>
                    <p className="text-3xl font-black text-slate-950">{metric.value ?? "--"}</p>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-slate-200">
                    <div className="h-2 rounded-full bg-gradient-to-r from-indigo-700 via-purple-500 to-cyan-400" style={{ width: `${value}%` }} />
                  </div>
                </div>
              );
            }) : <BlizzwayEmptyState title="No BDP metrics yet" description="Complete assessments to populate IQ, EQ, CQ, AQ, and LQ signals." />}
          </div>
        </BlizzwayCard>

        <BlizzwayCard as="section">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">NEXA profile improvement suggestions</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Next upgrades for a stronger BDP</h2>
          <div className="mt-5 grid gap-3">
            {(bdp?.nexaSuggestions ?? []).map((suggestion) => (
              <div key={suggestion} className="rounded-2xl bg-indigo-50 p-4 text-sm font-bold leading-6 text-indigo-800">
                {suggestion}
              </div>
            ))}
          </div>
        </BlizzwayCard>
      </section>

      {bdp ? (
        <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.85fr]">
          <BlizzwayCard as="section">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Admissions Readiness</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Study goals and application strength</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="font-black text-slate-950">Study goals</p>
                <p className="mt-2 text-sm leading-6 c7-muted">
                  {bdp.studyGoals.length ? bdp.studyGoals.join(", ") : "No saved study goals yet."}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="font-black text-slate-950">Country preference</p>
                <p className="mt-2 text-sm leading-6 c7-muted">
                  {bdp.countryPreferences.length ? bdp.countryPreferences.join(", ") : "No country preferences saved yet."}
                </p>
              </div>
            </div>
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-3xl font-black text-slate-950">{bdp.metrics.admissionsReadiness}%</p>
              <p className="mt-1 text-sm font-semibold c7-muted">Admissions readiness</p>
            </div>
          </BlizzwayCard>

          <BlizzwayCard as="section" className="c7-magical-glow">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Documents and scholarships</p>
            <div className="mt-5 grid gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="font-black text-slate-950">Documents readiness</p>
                <p className="mt-2 text-sm leading-6 c7-muted">
                  {bdp.documentsReadiness.completed}/{bdp.documentsReadiness.total} complete · {bdp.documentsReadiness.status}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="font-black text-slate-950">Scholarship readiness</p>
                <p className="mt-2 text-sm leading-6 c7-muted">{bdp.scholarshipReadiness.score}% · {bdp.scholarshipReadiness.status}</p>
              </div>
            </div>
            <BlizzwayButton href="/admissions" className="mt-5 w-full" variant="dark">
              Review admissions readiness
            </BlizzwayButton>
          </BlizzwayCard>
        </section>
      ) : null}
    </BlizzwayDashboardShell>
  );
}
