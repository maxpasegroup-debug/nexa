"use client";

import { useEffect, useState } from "react";

import { BlizzwayBadge, BlizzwayButton, BlizzwayCard, BlizzwayEmptyState, BlizzwayGradientPanel } from "@/components/blizzway";
import { bdpApi, getApiErrorMessage, type BlizzwayBdpResponse, type BlizzwayPublicBdpSettings } from "@/lib/api";
import { BlizzwayDashboardShell } from "../dashboard-shell";

export default function BdpPage() {
  const [data, setData] = useState<BlizzwayBdpResponse | null>(null);
  const [publicProfile, setPublicProfile] = useState<BlizzwayPublicBdpSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [publicBusy, setPublicBusy] = useState("");
  const [error, setError] = useState("");
  const [publicNotice, setPublicNotice] = useState("");
  const [slug, setSlug] = useState("");

  useEffect(() => {
    let active = true;

    Promise.all([bdpApi.getBdp(), bdpApi.getPublicSettings()])
      .then(([bdpResponse, publicResponse]) => {
        if (active) {
          setData(bdpResponse);
          setPublicProfile(publicResponse.profile);
          setSlug(publicResponse.profile.publicSlug);
        }
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
  const publicCompleteness = publicProfile
    ? Math.min(
        100,
        20 +
          (publicProfile.headline ? 15 : 0) +
          (publicProfile.summary ? 15 : 0) +
          (publicProfile.skills.length ? 15 : 0) +
          (publicProfile.projects.length ? 10 : 0) +
          (publicProfile.documentHighlights.length ? 10 : 0) +
          (publicProfile.assessmentHighlights.length ? 10 : 0) +
          (publicProfile.contactVisibility === "email" ? 5 : 0),
      )
    : 0;
  const missingPublicSections = [
    publicProfile?.skills.length ? null : "Add skills",
    publicProfile?.projects.length ? null : "Add projects or portfolio highlights",
    publicProfile?.documentHighlights.length ? null : "Parse documents for proof highlights",
    publicProfile?.contactVisibility === "email" ? null : "Enable recruiter contact when ready",
  ].filter((item): item is string => Boolean(item));
  const metrics = bdp
    ? [
        { label: "IQ", value: bdp.metrics.iq, note: "Aptitude signal" },
        { label: "EQ", value: bdp.metrics.eq, note: "Emotional intelligence" },
        { label: "CQ", value: bdp.metrics.cq, note: "Cultural intelligence" },
        { label: "AQ", value: bdp.metrics.aq, note: "Adaptability quotient" },
        { label: "LQ", value: bdp.metrics.lq, note: "Learning quotient" },
      ]
    : [];

  async function savePublicSettings(changes: Record<string, unknown>) {
    setPublicBusy("settings");
    setPublicNotice("");
    try {
      const response = await bdpApi.updatePublicSettings(changes);
      setPublicProfile(response.profile);
      setSlug(response.profile.publicSlug);
      setPublicNotice("Public BDP settings saved.");
    } catch (caught) {
      setPublicNotice(getApiErrorMessage(caught));
    } finally {
      setPublicBusy("");
    }
  }

  async function publishPublicBdp() {
    setPublicBusy("publish");
    setPublicNotice("");
    try {
      const response = await bdpApi.publishPublicProfile();
      setPublicProfile(response.profile);
      setPublicNotice("Public BDP published.");
    } catch (caught) {
      setPublicNotice(getApiErrorMessage(caught));
    } finally {
      setPublicBusy("");
    }
  }

  async function copyPublicLink() {
    if (!publicProfile) return;
    await navigator.clipboard.writeText(publicProfile.publicUrl);
    setPublicNotice("Public link copied.");
  }

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
          {bdp?.latestAssessment ? (
            <div className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
              <p className="text-sm font-black text-indigo-800">Latest assessment intelligence</p>
              <p className="mt-2 text-2xl font-black text-slate-950">{bdp.latestAssessment.percentage}% · {bdp.latestAssessment.readinessLevel}</p>
              <p className="mt-2 text-sm font-semibold text-indigo-800/80">{bdp.latestAssessment.title}</p>
              <p className="mt-2 text-sm leading-6 c7-muted">{bdp.latestAssessment.insight}</p>
            </div>
          ) : null}
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

      <section className="mt-5 grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <BlizzwayCard as="section" className="c7-magical-glow">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Public BDP controls</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Recruiter-ready profile</h2>
            </div>
            <BlizzwayBadge tone={publicProfile?.isPublic ? "emerald" : "slate"}>{publicProfile?.isPublic ? "Public" : "Private"}</BlizzwayBadge>
          </div>
          <p className="mt-3 text-sm leading-6 c7-muted">
            You choose what becomes public. Soul Vault notes, raw documents, raw assessment answers, wallet data, and admin data stay private.
          </p>
          <div className="mt-5 grid gap-3">
            <label className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Public slug</label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input value={slug} onChange={(event) => setSlug(event.target.value)} className="h-11 min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-indigo-400" />
              <BlizzwayButton type="button" onClick={() => savePublicSettings({ publicSlug: slug })} disabled={Boolean(publicBusy)} variant="secondary">Save slug</BlizzwayButton>
            </div>
            {publicProfile ? (
              <div className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-700">
                {publicProfile.publicUrl}
              </div>
            ) : null}
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <BlizzwayButton type="button" onClick={publishPublicBdp} disabled={Boolean(publicBusy)} variant="dark">
              {publicBusy === "publish" ? "Publishing..." : "Publish BDP"}
            </BlizzwayButton>
            <BlizzwayButton type="button" onClick={() => savePublicSettings({ isPublic: false })} disabled={Boolean(publicBusy)} variant="secondary">
              Unpublish
            </BlizzwayButton>
            <BlizzwayButton type="button" onClick={copyPublicLink} disabled={!publicProfile} variant="secondary">
              Copy public link
            </BlizzwayButton>
            <BlizzwayButton type="button" onClick={() => savePublicSettings({ contactVisibility: publicProfile?.contactVisibility === "email" ? "hidden" : "email" })} disabled={Boolean(publicBusy)} variant="secondary">
              {publicProfile?.contactVisibility === "email" ? "Hide recruiter email" : "Show recruiter email"}
            </BlizzwayButton>
          </div>
          {publicNotice ? <p className="mt-4 rounded-2xl bg-indigo-50 p-4 text-sm font-bold text-indigo-800">{publicNotice}</p> : null}
        </BlizzwayCard>

        <BlizzwayCard as="section">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Recruiter preview</p>
          <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-2xl font-black text-slate-950">{publicProfile?.headline || bdp?.publicPreview.headline || "Blizzway Explorer"}</h3>
                <p className="mt-2 text-sm font-semibold leading-6 c7-muted">{publicProfile?.summary || bdp?.publicPreview.summary || "Your public BDP summary will appear here."}</p>
              </div>
              <div className="rounded-2xl bg-white p-4 text-center">
                <p className="text-3xl font-black text-slate-950">{publicCompleteness}%</p>
                <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Complete</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {(publicProfile?.skills.length ? publicProfile.skills : bdp?.publicPreview.strengths ?? []).slice(0, 10).map((item) => (
                <BlizzwayBadge key={String(item)} tone="cyan">{String(item)}</BlizzwayBadge>
              ))}
            </div>
          </div>
          <div className="mt-5 grid gap-3">
            <p className="font-black text-slate-950">Suggested missing sections</p>
            {missingPublicSections.length ? missingPublicSections.map((item) => (
              <div key={item} className="rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-800">{item}</div>
            )) : <div className="rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-800">Public BDP is recruiter-ready for beta sharing.</div>}
          </div>
        </BlizzwayCard>
      </section>
    </BlizzwayDashboardShell>
  );
}
