import Link from "next/link";
import { notFound } from "next/navigation";

import { BlizzwayBadge, BlizzwayButton, BlizzwayCard, BlizzwayGradientPanel } from "@/components/blizzway";
import { assessments, getAssessment } from "@/lib/blizzway/assessments";
import { BlizzwayDashboardShell } from "../../dashboard-shell";

export function generateStaticParams() {
  return assessments.map((assessment) => ({ slug: assessment.slug }));
}

export default async function AssessmentDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const assessment = getAssessment(slug);

  if (!assessment) notFound();

  const related = assessments
    .filter((item) => item.slug !== assessment.slug && item.category !== assessment.category)
    .slice(0, 3);

  return (
    <BlizzwayDashboardShell
      activeHref="/assessments"
      title={assessment.title}
      description={`${assessment.category} assessment preview with dummy result data and no real scoring connected yet.`}
    >
      <section className="mt-5 grid gap-5 xl:grid-cols-[1.08fr_0.72fr]">
        <BlizzwayGradientPanel>
          <div className="flex flex-wrap gap-2">
            <BlizzwayBadge tone="cyan">{assessment.category}</BlizzwayBadge>
            <BlizzwayBadge tone={assessment.creditCost === 0 ? "emerald" : "purple"}>
              {assessment.creditCost === 0 ? "Free" : `${assessment.creditCost} credits`}
            </BlizzwayBadge>
          </div>
          <h2 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">{assessment.title}</h2>
          <p className="mt-4 max-w-2xl leading-7 text-white/72">{assessment.purpose}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/14 p-4 ring-1 ring-white/14">
              <p className="font-black">{assessment.timeRequired}</p>
              <p className="mt-1 text-sm text-white/70">Time required</p>
            </div>
            <div className="rounded-2xl bg-white/14 p-4 ring-1 ring-white/14">
              <p className="font-black">{assessment.creditCost}</p>
              <p className="mt-1 text-sm text-white/70">Credits required</p>
            </div>
            <div className="rounded-2xl bg-white/14 p-4 ring-1 ring-white/14">
              <p className="font-black">{assessment.repeatable ? "Repeatable" : "One-time"}</p>
              <p className="mt-1 text-sm text-white/70">Attempt type</p>
            </div>
          </div>
        </BlizzwayGradientPanel>

        <BlizzwayCard as="section" className="c7-magical-glow">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">NEXA recommendation</p>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">Why this is useful now</h2>
          <p className="mt-3 text-sm leading-6 c7-muted">{assessment.nexaRecommendation}</p>
          <p className="mt-5 rounded-2xl bg-indigo-50 p-4 text-sm font-bold text-indigo-700">
            BDP impact: {assessment.bdpImpact}
          </p>
          <BlizzwayButton href="#sample-result" className="mt-5 w-full" variant="dark">
            Start assessment
          </BlizzwayButton>
        </BlizzwayCard>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[0.8fr_1fr]">
        <BlizzwayCard as="section">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">What it measures</p>
          <div className="mt-5 grid gap-3">
            {assessment.measures.map((measure) => (
              <div key={measure} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 font-black text-slate-950">
                {measure}
              </div>
            ))}
          </div>
        </BlizzwayCard>

        <BlizzwayCard id="sample-result" as="section">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Sample result preview</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Dummy result UI</h2>
            </div>
            <BlizzwayBadge tone="emerald">BDP updated</BlizzwayBadge>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[0.42fr_0.58fr]">
            <div className="rounded-[22px] bg-slate-950 p-5 text-white">
              <p className="text-sm font-bold text-white/62">Score</p>
              <p className="mt-3 text-6xl font-black">{assessment.sampleScore}</p>
              <p className="mt-2 text-sm text-white/64">Preview only, no scoring algorithm connected.</p>
            </div>
            <div className="grid gap-3">
              <div className="rounded-2xl bg-emerald-50 p-4">
                <p className="font-black text-emerald-800">Strengths</p>
                <p className="mt-2 text-sm leading-6 text-emerald-800/75">{assessment.strengths.join(", ")}</p>
              </div>
              <div className="rounded-2xl bg-amber-50 p-4">
                <p className="font-black text-amber-800">Improvement areas</p>
                <p className="mt-2 text-sm leading-6 text-amber-800/75">{assessment.improvementAreas.join(", ")}</p>
              </div>
              <div className="rounded-2xl bg-indigo-50 p-4">
                <p className="font-black text-indigo-800">NEXA insight</p>
                <p className="mt-2 text-sm leading-6 text-indigo-800/75">
                  Your BDP is clearer after this result. NEXA would now tune pathway, learning, and companion recommendations.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="font-black text-slate-950">Recommended next assessments</p>
              <p className="mt-2 text-sm leading-6 c7-muted">{assessment.nextAssessments.join(", ")}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="font-black text-slate-950">Recommended companions</p>
              <p className="mt-2 text-sm leading-6 c7-muted">{assessment.companions.join(", ")}</p>
            </div>
          </div>
        </BlizzwayCard>
      </section>

      <section className="mt-5">
        <BlizzwayCard as="section">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Related assessments</p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {related.map((item) => (
              <Link key={item.slug} href={`/assessments/${item.slug}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-200 hover:bg-white">
                <BlizzwayBadge tone="slate">{item.category}</BlizzwayBadge>
                <p className="mt-3 font-black text-slate-950">{item.title}</p>
                <p className="mt-2 text-sm leading-6 c7-muted">{item.description}</p>
              </Link>
            ))}
          </div>
        </BlizzwayCard>
      </section>
    </BlizzwayDashboardShell>
  );
}
