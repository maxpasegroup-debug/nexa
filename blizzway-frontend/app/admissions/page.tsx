import { BlizzwayBadge, BlizzwayCard, BlizzwayGradientPanel } from "@/components/blizzway";
import { BlizzwayDashboardShell } from "../dashboard-shell";

const admissionTracks = [
  "College shortlist",
  "Application plan",
  "Document checklist",
  "Counsellor notes",
];

export default function AdmissionsPage() {
  return (
    <BlizzwayDashboardShell
      activeHref="/admissions"
      title="Admissions"
      description="A future admissions workspace for shortlists, applications, documents, and guided counselling steps."
    >
      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.7fr]">
        <BlizzwayGradientPanel>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">Coming soon</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight">Turn admission planning into a calm checklist.</h2>
          <p className="mt-4 max-w-2xl leading-7 text-white/72">
            Admissions will connect pathway clarity with college options, application timelines, documents, and next actions.
          </p>
        </BlizzwayGradientPanel>

        <BlizzwayCard as="section" className="c7-magical-glow">
          <BlizzwayBadge tone="indigo">Preview</BlizzwayBadge>
          <h2 className="mt-3 text-2xl font-black text-slate-950">Built for students and families</h2>
          <p className="mt-3 text-sm leading-6 c7-muted">
            This placeholder keeps admissions visible in Blizzway while the real BGOS workflow is being prepared.
          </p>
        </BlizzwayCard>
      </section>

      <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {admissionTracks.map((title) => (
          <BlizzwayCard key={title} as="article" className="c7-lift-card">
            <BlizzwayBadge tone="slate">Soon</BlizzwayBadge>
            <h3 className="mt-5 text-xl font-black text-slate-950">{title}</h3>
            <p className="mt-3 text-sm leading-6 c7-muted">Placeholder area reserved for the upcoming admissions workflow.</p>
          </BlizzwayCard>
        ))}
      </section>
    </BlizzwayDashboardShell>
  );
}
