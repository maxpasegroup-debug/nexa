import { BlizzwayBadge, BlizzwayButton, BlizzwayCard, BlizzwayGradientPanel } from "@/components/blizzway";
import { BlizzwayDashboardShell } from "../dashboard-shell";

const metrics = [
  { label: "IQ", value: 72, note: "Aptitude signal" },
  { label: "EQ", value: 88, note: "Emotional intelligence" },
  { label: "CQ", value: 69, note: "Cultural intelligence" },
  { label: "AQ", value: 74, note: "Adaptability quotient" },
  { label: "LQ", value: 76, note: "Learning quotient" },
];

const suggestions = [
  "Take Career Compass Starter to sharpen pathway direction.",
  "Complete Academic Readiness and Global Readiness before admissions shortlisting.",
  "Complete Communication Spark to improve interview confidence.",
  "Add two proof stories to Soul Vault for a stronger public profile.",
];

export default function BdpPage() {
  return (
    <BlizzwayDashboardShell
      activeHref="/bdp"
      title="Blizzway Digital Profile"
      description="Your living career identity, powered by assessments, proof, pathway progress, and NEXA guidance."
    >
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
            <div className="rounded-2xl bg-white/14 p-4 ring-1 ring-white/14">
              <p className="text-4xl font-black">78%</p>
              <p className="mt-1 text-sm text-white/70">Profile strength</p>
            </div>
            <div className="rounded-2xl bg-white/14 p-4 ring-1 ring-white/14">
              <p className="text-4xl font-black">6</p>
              <p className="mt-1 text-sm text-white/70">Assessments completed</p>
            </div>
            <div className="rounded-2xl bg-white/14 p-4 ring-1 ring-white/14">
              <p className="text-4xl font-black">12</p>
              <p className="mt-1 text-sm text-white/70">Proof signals</p>
            </div>
          </div>
        </BlizzwayGradientPanel>

        <BlizzwayCard as="section" className="c7-magical-glow">
          <BlizzwayBadge tone="cyan">Public profile preview</BlizzwayBadge>
          <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-950">Blizzway Explorer</h2>
          <p className="mt-2 text-sm font-semibold c7-muted">Creative communicator with strong EQ, global curiosity, and steady learning momentum.</p>
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
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Sample metrics</p>
          <div className="mt-5 grid gap-3">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xl font-black text-slate-950">{metric.label}</p>
                    <p className="mt-1 text-sm font-semibold c7-muted">{metric.note}</p>
                  </div>
                  <p className="text-3xl font-black text-slate-950">{metric.value}</p>
                </div>
                <div className="mt-3 h-2 rounded-full bg-slate-200">
                  <div className="h-2 rounded-full bg-gradient-to-r from-indigo-700 via-purple-500 to-cyan-400" style={{ width: `${metric.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </BlizzwayCard>

        <BlizzwayCard as="section">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">NEXA profile improvement suggestions</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Next upgrades for a stronger BDP</h2>
          <div className="mt-5 grid gap-3">
            {suggestions.map((suggestion) => (
              <div key={suggestion} className="rounded-2xl bg-indigo-50 p-4 text-sm font-bold leading-6 text-indigo-800">
                {suggestion}
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-[22px] bg-slate-950 p-5 text-white">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-cyan-200">BDP status</p>
            <p className="mt-3 text-2xl font-black">Placeholder profile only</p>
            <p className="mt-2 text-sm leading-6 text-white/66">
              No backend profile storage is connected yet. This page uses dummy metrics to establish the Blizzway BDP experience.
            </p>
          </div>
        </BlizzwayCard>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.85fr]">
        <BlizzwayCard as="section">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Admissions Readiness</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Study goals and application strength</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="font-black text-slate-950">Study goals</p>
              <p className="mt-2 text-sm leading-6 c7-muted">Computer Science UG, business diploma, and global data pathways are saved as placeholder interests.</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="font-black text-slate-950">Country preference</p>
              <p className="mt-2 text-sm leading-6 c7-muted">India, Canada, and United Kingdom are marked for comparison.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {[
              ["Academic fit", "74%"],
              ["Global fit", "69%"],
              ["Application confidence", "62%"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-3xl font-black text-slate-950">{value}</p>
                <p className="mt-1 text-sm font-semibold c7-muted">{label}</p>
              </div>
            ))}
          </div>
        </BlizzwayCard>

        <BlizzwayCard as="section" className="c7-magical-glow">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Documents and scholarships</p>
          <div className="mt-5 grid gap-3">
            {[
              ["Documents readiness", "Transcripts ready, SOP/LOR drafts pending"],
              ["Scholarship readiness", "Merit profile started, proof stories need detail"],
              ["NEXA next step", "Take admissions-linked assessments before final shortlist"],
            ].map(([title, description]) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="font-black text-slate-950">{title}</p>
                <p className="mt-2 text-sm leading-6 c7-muted">{description}</p>
              </div>
            ))}
          </div>
          <BlizzwayButton href="/admissions" className="mt-5 w-full" variant="dark">
            Review admissions readiness
          </BlizzwayButton>
        </BlizzwayCard>
      </section>
    </BlizzwayDashboardShell>
  );
}
