import Link from "next/link";

import { BlizzwayBadge, BlizzwayButton, BlizzwayCard, BlizzwayGradientPanel } from "@/components/blizzway";
import { assessmentCategories, assessments } from "@/lib/blizzway/assessments";
import { BlizzwayDashboardShell } from "../dashboard-shell";

const recommended = assessments.filter((assessment) =>
  ["academic-readiness-check", "global-readiness-scan", "career-compass-starter"].includes(assessment.slug),
);

function AssessmentCard({ assessment }: { assessment: (typeof assessments)[number] }) {
  return (
    <BlizzwayCard as="article" className="c7-lift-card flex min-h-full flex-col">
      <div className="flex flex-wrap items-center gap-2">
        <BlizzwayBadge tone={assessment.creditCost === 0 ? "emerald" : "purple"}>
          {assessment.creditCost === 0 ? "Free" : "Paid"}
        </BlizzwayBadge>
        <BlizzwayBadge tone="slate">{assessment.repeatable ? "Repeatable" : "One-time"}</BlizzwayBadge>
      </div>
      <p className="mt-5 text-xs font-black uppercase tracking-[0.16em] text-indigo-600">{assessment.category}</p>
      <h3 className="mt-2 text-xl font-black tracking-tight text-slate-950">{assessment.title}</h3>
      <p className="mt-3 text-sm leading-6 c7-muted">{assessment.description}</p>
      <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="font-black text-slate-950">{assessment.timeRequired}</p>
          <p className="mt-1 font-semibold c7-muted">Time required</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="font-black text-slate-950">{assessment.creditCost} credits</p>
          <p className="mt-1 font-semibold c7-muted">Credit cost</p>
        </div>
      </div>
      <p className="mt-4 rounded-2xl bg-indigo-50 p-3 text-sm font-bold text-indigo-700">
        BDP impact: {assessment.bdpImpact}
      </p>
      <BlizzwayButton href={`/assessments/${assessment.slug}`} className="mt-5 w-full" variant="dark">
        Start assessment
      </BlizzwayButton>
    </BlizzwayCard>
  );
}

export default function AssessmentsPage() {
  const featured = assessments.filter((assessment) =>
    ["career-compass-starter", "academic-readiness-check", "global-readiness-scan", "communication-spark"].includes(assessment.slug),
  );

  return (
    <BlizzwayDashboardShell
      activeHref="/assessments"
      title="Assessments"
      description="A grand marketplace of NEXA-powered tests that improve your BDP, pathway accuracy, recommendations, and confidence."
    >
      <section className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.72fr]">
        <BlizzwayGradientPanel>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">NEXA assessment engine</p>
          <h2 className="mt-3 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">
            Discover your potential with NEXA-powered assessments
          </h2>
          <p className="mt-4 max-w-2xl leading-7 text-white/72">
            Use free starter credits to unlock a clearer Blizzway Digital Profile, kinder recommendations, and sharper pathway direction.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <BlizzwayButton href="/assessments/career-compass-starter" variant="secondary" size="lg">
              Use free starter credits
            </BlizzwayButton>
            <BlizzwayButton href="/bdp" variant="ghost" size="lg" className="bg-white/10 text-white hover:bg-white/15 hover:text-white">
              Preview BDP impact
            </BlizzwayButton>
          </div>
        </BlizzwayGradientPanel>

        <BlizzwayCard as="section" className="c7-magical-glow">
          <BlizzwayBadge tone="cyan">BDP improvement</BlizzwayBadge>
          <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-950">Every result makes your living identity smarter.</h2>
          <p className="mt-3 text-sm leading-6 c7-muted">
            Dummy results currently update only this preview, but the intended engine will improve BDP quality, NEXA guidance, pathway fit, admissions recommendations, and user confidence.
          </p>
          <div className="mt-5 grid gap-3">
            {["Profile strength +12%", "Pathway accuracy +9%", "Recommendation confidence +15%"].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 font-black text-slate-950">
                {item}
              </div>
            ))}
          </div>
        </BlizzwayCard>
      </section>

      <section className="mt-5">
        <BlizzwayCard as="section">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Assessment categories</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Choose the signal NEXA should learn next</h2>
            </div>
            <BlizzwayBadge tone="slate">{assessmentCategories.length} categories</BlizzwayBadge>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {assessmentCategories.map((category) => (
              <span key={category} className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-black text-slate-700">
                {category}
              </span>
            ))}
          </div>
        </BlizzwayCard>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.75fr]">
        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-2xl font-black tracking-tight text-slate-950">Featured assessments</h2>
            <BlizzwayBadge tone="purple">Marketplace preview</BlizzwayBadge>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {featured.map((assessment) => (
              <AssessmentCard key={assessment.slug} assessment={assessment} />
            ))}
          </div>
        </div>

        <div className="grid gap-5">
          <BlizzwayCard as="section" className="c7-magical-glow">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Recommended by NEXA</p>
            <div className="mt-5 grid gap-3">
              {recommended.map((assessment) => (
                <Link key={assessment.slug} href={`/assessments/${assessment.slug}`} className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-indigo-200 hover:bg-indigo-50/40">
                  <p className="font-black text-slate-950">{assessment.title}</p>
                  <p className="mt-1 text-sm font-semibold c7-muted">{assessment.nexaRecommendation}</p>
                </Link>
              ))}
            </div>
          </BlizzwayCard>

          <BlizzwayCard as="section">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Recently taken</p>
            <p className="mt-3 text-sm leading-6 c7-muted">No completed assessment activity yet. Your first free assessment will appear here.</p>
          </BlizzwayCard>

          <BlizzwayCard as="section">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Assessment history</p>
            <p className="mt-3 text-sm leading-6 c7-muted">History, retakes, certificate notes, and BDP change logs will live here once backend storage is connected.</p>
          </BlizzwayCard>

          <BlizzwayCard as="section">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">BDP impact preview</p>
            <div className="mt-4 space-y-3">
              {["IQ 72", "EQ 88", "CQ 69", "AQ 74", "LQ 76", "Admissions readiness 74"].map((metric) => (
                <div key={metric} className="rounded-2xl bg-slate-50 p-3 text-sm font-black text-slate-950">{metric}</div>
              ))}
            </div>
          </BlizzwayCard>

          <BlizzwayCard as="section">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Admissions connection</p>
            <p className="mt-3 text-sm leading-6 c7-muted">
              Global Readiness and Academic Readiness results help NEXA recommend colleges, countries, deadlines, documents, and scholarships inside Admissions.
            </p>
            <BlizzwayButton href="/admissions" className="mt-5 w-full" variant="dark">
              Open admissions
            </BlizzwayButton>
          </BlizzwayCard>
        </div>
      </section>
    </BlizzwayDashboardShell>
  );
}
