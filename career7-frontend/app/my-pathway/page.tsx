import { Career7Badge, Career7Card, Career7GradientPanel } from "@/components/career7";
import { Career7DashboardShell } from "../dashboard-shell";

const timeline = [
  ["Discover", "Career dream map", "Complete", "100%"],
  ["Grow", "Learning Garden sprint", "Active", "72%"],
  ["Prove", "Portfolio proof stack", "Active", "54%"],
  ["Launch", "Opportunity outreach", "Next", "28%"],
];

const milestones = [
  ["Resume story polished", "Warm Gold", "Done"],
  ["English intro practiced", "Soft Cyan", "In progress"],
  ["First portfolio proof note", "Aurora Purple", "Today"],
  ["Five role shortlist", "Midnight Indigo", "Next"],
];

const goals = [
  ["6 months", "Clear role direction, visible proof, and a calm practice habit."],
  ["1 year", "Stronger profile, confident interviews, and first serious opportunity wins."],
  ["3 years", "Premium professional identity with a trusted earning rhythm."],
  ["5 years", "A purpose-led career path with freedom, skill, and confidence."],
];

export default function MyPathwayPage() {
  return (
    <Career7DashboardShell
      activeHref="/my-pathway"
      title="My Pathway"
      description="A visual pathway timeline for your dreams, milestones, proof, and long-term career vision."
    >
      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.72fr]">
        <Career7GradientPanel>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">Visual pathway timeline</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight">Dream to launch, one calm stage at a time.</h2>
          <div className="mt-8 grid gap-4">
            {timeline.map(([stage, title, status, progress]) => (
              <div key={stage} className="rounded-2xl bg-white/14 p-4 ring-1 ring-white/14">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100">{stage}</p>
                    <p className="mt-1 text-lg font-black">{title}</p>
                  </div>
                  <span className="rounded-full bg-white/16 px-3 py-1 text-xs font-black">{status}</span>
                </div>
                <div className="mt-4 h-2 rounded-full bg-white/16">
                  <div className="h-2 rounded-full bg-gradient-to-r from-amber-200 via-cyan-200 to-white" style={{ width: progress }} />
                </div>
              </div>
            ))}
          </div>
        </Career7GradientPanel>

        <Career7Card as="section" className="c7-magical-glow">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">NEXA pathway note</p>
          <h2 className="mt-3 text-2xl font-black text-slate-950">Your proof stage needs one visible win.</h2>
          <p className="mt-3 text-sm leading-6 c7-muted">
            NEXA recommends saving one portfolio proof note today, then linking it to your next role direction.
          </p>
          <div className="mt-6 rounded-2xl bg-cyan-50 p-4">
            <p className="text-sm font-black text-cyan-800">Pathway Score</p>
            <p className="mt-2 text-4xl font-black text-slate-950">86%</p>
          </div>
        </Career7Card>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Career7Card as="section">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Milestones</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">Weekly magical markers</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {milestones.map(([title, tone, status]) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <Career7Badge tone="slate">{status}</Career7Badge>
                <p className="mt-4 font-black text-slate-950">{title}</p>
                <p className="mt-1 text-sm c7-muted">{tone} milestone</p>
              </div>
            ))}
          </div>
        </Career7Card>

        <Career7Card as="section">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Vision goals</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">6 months to 5 years</h2>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {goals.map(([time, description]) => (
              <div key={time} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <p className="text-lg font-black text-slate-950">{time}</p>
                <p className="mt-2 text-sm leading-6 c7-muted">{description}</p>
              </div>
            ))}
          </div>
        </Career7Card>
      </section>
    </Career7DashboardShell>
  );
}
