import Link from "next/link";
import { notFound } from "next/navigation";

import { BlizzwayBadge, BlizzwayButton, BlizzwayCard, BlizzwayGradientPanel } from "@/components/blizzway";
import { admissionPathways, getAdmissionPathway } from "@/lib/blizzway/admissions";
import { BlizzwayDashboardShell } from "../../dashboard-shell";

export function generateStaticParams() {
  return admissionPathways.map((pathway) => ({ slug: pathway.slug }));
}

export default async function AdmissionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pathway = getAdmissionPathway(slug);

  if (!pathway) notFound();

  const related = admissionPathways.filter((item) => item.slug !== pathway.slug).slice(0, 3);

  return (
    <BlizzwayDashboardShell
      activeHref="/admissions"
      title={pathway.title}
      description={`${pathway.mode} admissions pathway guidance for ${pathway.location}.`}
    >
      <section className="mt-5 grid gap-5 xl:grid-cols-[1.08fr_0.72fr]">
        <BlizzwayGradientPanel>
          <div className="flex flex-wrap gap-2">
            <BlizzwayBadge tone={pathway.mode === "International" ? "purple" : "cyan"}>{pathway.mode}</BlizzwayBadge>
            <BlizzwayBadge tone="slate">{pathway.level}</BlizzwayBadge>
          </div>
          <h2 className="mt-5 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">{pathway.title}</h2>
          <p className="mt-4 max-w-2xl leading-7 text-white/72">{pathway.eligibilitySummary}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/14 p-4 ring-1 ring-white/14">
              <p className="font-black">{pathway.location}</p>
              <p className="mt-1 text-sm text-white/70">Location</p>
            </div>
            <div className="rounded-2xl bg-white/14 p-4 ring-1 ring-white/14">
              <p className="font-black">{pathway.eligibilityStatus}</p>
              <p className="mt-1 text-sm text-white/70">Eligibility</p>
            </div>
            <div className="rounded-2xl bg-white/14 p-4 ring-1 ring-white/14">
              <p className="font-black">{pathway.budget}</p>
              <p className="mt-1 text-sm text-white/70">Estimated budget</p>
            </div>
          </div>
        </BlizzwayGradientPanel>

        <BlizzwayCard as="section" className="c7-magical-glow">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">NEXA advice</p>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">Before you apply</h2>
          <p className="mt-3 text-sm leading-6 c7-muted">{pathway.nexaAdvice}</p>
          <p className="mt-5 rounded-2xl bg-indigo-50 p-4 text-sm font-bold text-indigo-700">
            BDP readiness improves when assessment results, documents, and proof stories are complete.
          </p>
          <BlizzwayButton href="/my-pathway" className="mt-5 w-full" variant="dark">
            Add to My Pathway
          </BlizzwayButton>
        </BlizzwayCard>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[0.85fr_1fr]">
        <BlizzwayCard as="section">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Required documents</p>
          <div className="mt-5 grid gap-3">
            {pathway.documents.map((document) => (
              <div key={document} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 font-black text-slate-950">
                {document}
              </div>
            ))}
          </div>
        </BlizzwayCard>

        <BlizzwayCard as="section">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Deadlines and scholarship options</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="font-black text-slate-950">Deadlines</p>
              <div className="mt-3 space-y-2">
                {pathway.deadlines.map((deadline) => (
                  <p key={deadline} className="text-sm font-semibold c7-muted">{deadline}</p>
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="font-black text-emerald-800">Scholarships</p>
              <div className="mt-3 space-y-2">
                {pathway.scholarships.map((scholarship) => (
                  <p key={scholarship} className="text-sm font-semibold text-emerald-800/75">{scholarship}</p>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="font-black text-slate-950">Recommended assessments</p>
              <p className="mt-2 text-sm leading-6 c7-muted">{pathway.recommendedAssessments.join(", ")}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="font-black text-slate-950">Recommended companions</p>
              <p className="mt-2 text-sm leading-6 c7-muted">{pathway.recommendedCompanions.join(", ")}</p>
            </div>
          </div>
        </BlizzwayCard>
      </section>

      <section className="mt-5">
        <BlizzwayCard as="section">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Related admissions pathways</p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {related.map((item) => (
              <Link key={item.slug} href={`/admissions/${item.slug}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-200 hover:bg-white">
                <BlizzwayBadge tone="slate">{item.countryRegion}</BlizzwayBadge>
                <p className="mt-3 font-black text-slate-950">{item.title}</p>
                <p className="mt-2 text-sm leading-6 c7-muted">{item.location} · {item.level} · {item.mode}</p>
              </Link>
            ))}
          </div>
        </BlizzwayCard>
      </section>
    </BlizzwayDashboardShell>
  );
}
