import { BlizzwayBadge, BlizzwayCard, BlizzwayGradientPanel } from "@/components/blizzway";
import { BlizzwayDashboardShell } from "../dashboard-shell";

const testTypes = [
  "Interest mapping",
  "Strength discovery",
  "Role-fit signals",
  "Confidence check",
];

export default function CareerTestsPage() {
  return (
    <BlizzwayDashboardShell
      activeHref="/career-tests"
      title="Career Tests"
      description="Guided assessments for interests, strengths, confidence, and next-fit career direction."
    >
      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.7fr]">
        <BlizzwayGradientPanel>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">Coming soon</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight">Know yourself before choosing the next path.</h2>
          <p className="mt-4 max-w-2xl leading-7 text-white/72">
            Career Tests will help Blizzway shape recommendations around personality, strengths, learning style, and role direction.
          </p>
        </BlizzwayGradientPanel>

        <BlizzwayCard as="section" className="c7-magical-glow">
          <BlizzwayBadge tone="indigo">Preview</BlizzwayBadge>
          <h2 className="mt-3 text-2xl font-black text-slate-950">NEXA assessment layer</h2>
          <p className="mt-3 text-sm leading-6 c7-muted">
            Results will feed My Pathway, Learning Garden, and Earning Universe once the BGOS endpoint is ready.
          </p>
        </BlizzwayCard>
      </section>

      <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {testTypes.map((title) => (
          <BlizzwayCard key={title} as="article" className="c7-lift-card">
            <BlizzwayBadge tone="slate">Soon</BlizzwayBadge>
            <h3 className="mt-5 text-xl font-black text-slate-950">{title}</h3>
            <p className="mt-3 text-sm leading-6 c7-muted">Placeholder module reserved for the next Blizzway assessment release.</p>
          </BlizzwayCard>
        ))}
      </section>
    </BlizzwayDashboardShell>
  );
}
