"use client";

import { useEffect, useState } from "react";

import { BlizzwayBadge, BlizzwayButton, BlizzwayCard, BlizzwayEmptyState, BlizzwayGradientPanel } from "@/components/blizzway";
import { admissionsApi, getApiErrorMessage, type BlizzwayAdmissionPathway, type BlizzwayAdmissionsResponse } from "@/lib/api";
import { admissionsCategories } from "@/lib/blizzway/admissions";
import { BlizzwayDashboardShell } from "../dashboard-shell";

const modules = [
  "National Admissions",
  "International Admissions",
  "Course Discovery",
  "College/University Shortlist",
  "Eligibility Checker",
  "Admission Deadline Tracker",
  "Scholarship Finder",
  "SOP/LOR Support",
  "Application Checklist",
];

function AdmissionCard({ pathway }: { pathway: BlizzwayAdmissionPathway }) {
  return (
    <BlizzwayCard as="article" className="c7-lift-card flex min-h-full flex-col">
      <div className="flex flex-wrap items-center gap-2">
        <BlizzwayBadge tone={pathway.mode === "International" ? "purple" : "cyan"}>{pathway.mode}</BlizzwayBadge>
        <BlizzwayBadge tone="slate">{pathway.level}</BlizzwayBadge>
      </div>
      <h3 className="mt-5 text-xl font-black tracking-tight text-slate-950">{pathway.title}</h3>
      <p className="mt-2 text-sm font-bold text-indigo-700">{pathway.countryRegion}</p>
      <p className="mt-3 text-sm leading-6 c7-muted">{pathway.eligibilitySummary}</p>
      <div className="mt-5 grid gap-3 text-sm">
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="font-black text-slate-950">{pathway.intakeDeadline}</p>
          <p className="mt-1 font-semibold c7-muted">Intake/deadline</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-emerald-50 p-3">
            <p className="font-black text-emerald-800">{pathway.eligibilityStatus}</p>
            <p className="mt-1 font-semibold text-emerald-800/70">Eligibility</p>
          </div>
          <div className="rounded-2xl bg-indigo-50 p-3">
            <p className="font-black text-indigo-800">{pathway.credits}</p>
            <p className="mt-1 font-semibold text-indigo-800/70">Credits</p>
          </div>
        </div>
      </div>
      <BlizzwayButton href={`/admissions/${pathway.slug}`} className="mt-5 w-full" variant="dark">
        Explore Pathway
      </BlizzwayButton>
    </BlizzwayCard>
  );
}

export default function AdmissionsPage() {
  const [data, setData] = useState<BlizzwayAdmissionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    admissionsApi.getAdmissions()
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

  const pathways = data?.pathways ?? [];

  return (
    <BlizzwayDashboardShell
      activeHref="/admissions"
      title="Admissions"
      description="Explore, shortlist, and prepare for national and international college pathways with NEXA guidance."
    >
      {error ? (
        <BlizzwayCard as="section" className="mt-5">
          <p className="text-sm font-black text-rose-700">Unable to load admissions</p>
          <p className="mt-2 text-sm leading-6 c7-muted">{error}</p>
        </BlizzwayCard>
      ) : null}

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.08fr_0.72fr]">
        <BlizzwayGradientPanel>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">Admissions ecosystem</p>
          <h2 className="mt-3 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">
            Find your right college pathway with NEXA
          </h2>
          <p className="mt-4 max-w-2xl leading-7 text-white/72">
            Compare national and international options, prepare documents, track deadlines, and use your BDP signals to choose with confidence.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <BlizzwayButton href="/admissions/india-computer-science-ug" variant="secondary" size="lg">
              Explore Pathway
            </BlizzwayButton>
            <BlizzwayButton href="/assessments/global-readiness-scan" variant="ghost" size="lg" className="bg-white/10 text-white hover:bg-white/15 hover:text-white">
              Check readiness
            </BlizzwayButton>
          </div>
        </BlizzwayGradientPanel>

        <BlizzwayCard as="section" className="c7-magical-glow">
          <BlizzwayBadge tone="cyan">NEXA Admission Recommendations</BlizzwayBadge>
          <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-950">Assessments plus BDP make admissions less guessy.</h2>
          <p className="mt-3 text-sm leading-6 c7-muted">
            NEXA combines academic readiness, global readiness, career fit, proof signals, and budget intent to suggest calmer admission pathways.
          </p>
          <div className="mt-5 grid gap-3">
            {[
              data?.nexaRecommendation ?? "Complete readiness assessments before shortlisting.",
              "Use Global Readiness for study-abroad shortlists",
              "Strengthen BDP documents before applications",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-black text-slate-950">
                {item}
              </div>
            ))}
          </div>
        </BlizzwayCard>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[0.78fr_1fr]">
        <BlizzwayCard as="section">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Admissions categories</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Plan by goal, country, and readiness</h2>
            </div>
            <BlizzwayBadge tone="slate">{admissionsCategories.length} categories</BlizzwayBadge>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {admissionsCategories.map((category) => (
              <span key={category} className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-black text-slate-700">
                {category}
              </span>
            ))}
          </div>
        </BlizzwayCard>

        <BlizzwayCard as="section">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">BDP Admissions Readiness Preview</p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {[
              ["Academic fit", `${data?.readiness.academicFit ?? 0}%`],
              ["Document readiness", `${data?.readiness.documents.completed ?? 0}/${data?.readiness.documents.total ?? 0}`],
              ["Scholarship readiness", `${data?.readiness.scholarships.score ?? 0}%`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-slate-50 p-4">
                <p className="text-3xl font-black text-slate-950">{value}</p>
                <p className="mt-1 text-sm font-semibold c7-muted">{label}</p>
              </div>
            ))}
          </div>
        </BlizzwayCard>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.72fr]">
        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-2xl font-black tracking-tight text-slate-950">College and university pathways</h2>
            <BlizzwayBadge tone="purple">Dummy catalogue</BlizzwayBadge>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {loading ? [0, 1, 2, 3].map((item) => <div key={item} className="h-80 animate-pulse rounded-[22px] bg-white" />) : pathways.length ? pathways.map((pathway) => (
              <AdmissionCard key={pathway.slug} pathway={pathway} />
            )) : <BlizzwayEmptyState title="No admissions pathways yet" description="NEXA will show national and international routes here when the backend has data." />}
          </div>
        </div>

        <div className="grid gap-5">
          <BlizzwayCard as="section" className="c7-magical-glow">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Admissions workspace</p>
            <div className="mt-5 grid gap-3">
              {modules.map((module) => (
                <div key={module} className="rounded-2xl border border-slate-200 bg-white p-4 font-black text-slate-950">
                  {module}
                </div>
              ))}
            </div>
          </BlizzwayCard>

          <BlizzwayCard as="section">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Deadline tracker</p>
            <p className="mt-3 text-sm leading-6 c7-muted">
              Shortlist deadlines, entrance windows, scholarship dates, and visa milestones will appear here when backend storage is connected.
            </p>
          </BlizzwayCard>

          <BlizzwayCard as="section">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Application checklist</p>
            <p className="mt-3 text-sm leading-6 c7-muted">
              Academic documents, SOP/LOR drafts, test scores, financial proof, and portfolio links are currently shown as dummy readiness signals.
            </p>
          </BlizzwayCard>

          <BlizzwayCard as="section">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Scholarship finder</p>
            <p className="mt-3 text-sm leading-6 c7-muted">
              NEXA will use BDP strength, assessment results, academic goals, and country preference to recommend scholarship options.
            </p>
          </BlizzwayCard>
        </div>
      </section>
    </BlizzwayDashboardShell>
  );
}
