import { BlizzwayBadge, BlizzwayButton, BlizzwayCard, BlizzwayGradientPanel } from "@/components/blizzway";
import { BlizzwayDashboardShell } from "../dashboard-shell";

const shelves = [
  ["Resume Cocoa", "Resume", "A rich resume polish in one focused pass.", "120"],
  ["Interview Truffle", "Interview", "A compact mock interview with warm feedback.", "180"],
  ["Language Bar", "Language", "Quick fluency practice for career conversations.", "90"],
  ["Migration Mint", "Migration", "Document and pathway readiness checklist.", "160"],
  ["Finance Fudge", "Finance", "Money habit and earning goal mini-plan.", "110"],
  ["Portfolio Praline", "Resume", "Turn one project into proof-of-work.", "140"],
];

export default function QuickBoostsPage() {
  return (
    <BlizzwayDashboardShell
      activeHref="/quick-boosts"
      title="Quick Boosts"
      description="Chocolate shelf style career tools for fast, happy, premium progress."
    >
      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.72fr]">
        <BlizzwayGradientPanel>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">Chocolate shelf tools</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight">Pick a small boost. Feel better today.</h2>
          <p className="mt-4 max-w-2xl leading-7 text-white/72">
            Dummy boosts are arranged like a premium shelf: clear, delightful, and easy to choose.
          </p>
        </BlizzwayGradientPanel>
        <BlizzwayCard as="section" className="c7-magical-glow">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">NEXA boost note</p>
          <h2 className="mt-3 text-2xl font-black text-slate-950">Choose the boost that removes friction.</h2>
          <p className="mt-3 text-sm leading-6 c7-muted">Resume, interview, language, migration, or finance. One bite-sized improvement is enough.</p>
        </BlizzwayCard>
      </section>

      <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {shelves.map(([name, category, description, credits]) => (
          <BlizzwayCard key={name} as="article" className="c7-lift-card bg-gradient-to-b from-white to-amber-50/50">
            <div className="flex items-start justify-between gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 via-purple-400 to-cyan-300 text-sm font-black text-white">
                {name.split(" ").map((part) => part[0]).join("").slice(0, 2)}
              </span>
              <BlizzwayBadge tone="slate">{category}</BlizzwayBadge>
            </div>
            <h3 className="mt-5 text-xl font-black text-slate-950">{name}</h3>
            <p className="mt-3 text-sm leading-6 c7-muted">{description}</p>
            <div className="mt-5 flex items-center justify-between">
              <p className="text-lg font-black text-slate-950">{credits} credits</p>
              <BlizzwayButton type="button" size="sm">Preview</BlizzwayButton>
            </div>
          </BlizzwayCard>
        ))}
      </section>
    </BlizzwayDashboardShell>
  );
}
