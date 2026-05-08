import { Career7Badge, Career7Card, Career7GradientPanel } from "@/components/career7";
import { Career7DashboardShell } from "../dashboard-shell";

const opportunities = [
  ["Junior Product Assistant", "Job", "High fit", "$42k path"],
  ["Resume Rewrite Sprint", "Freelance", "Fast start", "$120 project"],
  ["Campus Ambassador", "Internship", "Confidence", "$300 stipend"],
];

const pipeline = [
  ["Saved", "8"],
  ["Applied", "3"],
  ["Interviewing", "1"],
  ["Offer ideas", "4"],
];

const trackers = [
  ["Money discipline", "68%", "Weekly savings and spending awareness."],
  ["Earning goal", "54%", "First $1,000 project pathway."],
  ["Opportunity rhythm", "76%", "Three reviews every week."],
];

export default function EarningUniversePage() {
  return (
    <Career7DashboardShell
      activeHref="/earning-universe"
      title="Earning Universe"
      description="Dummy opportunity boards for jobs, freelance work, money discipline, and earning goals."
    >
      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.72fr]">
        <Career7GradientPanel>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">Opportunity pipeline</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight">Turn proof into earning momentum.</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            {pipeline.map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-white/14 p-4 ring-1 ring-white/14">
                <p className="text-sm text-white/70">{label}</p>
                <p className="mt-2 text-3xl font-black">{value}</p>
              </div>
            ))}
          </div>
        </Career7GradientPanel>

        <Career7Card as="section" className="c7-magical-glow">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">NEXA earning note</p>
          <h2 className="mt-3 text-2xl font-black text-slate-950">Package one skill into one small offer.</h2>
          <p className="mt-3 text-sm leading-6 c7-muted">
            Start with a simple service idea before chasing every opportunity.
          </p>
        </Career7Card>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.8fr]">
        <Career7Card as="section">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Job and freelance opportunities</p>
          <div className="mt-6 grid gap-3">
            {opportunities.map(([title, type, fit, value]) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-black text-slate-950">{title}</p>
                    <p className="mt-1 text-sm c7-muted">{type} - {value}</p>
                  </div>
                  <Career7Badge tone="emerald">{fit}</Career7Badge>
                </div>
              </div>
            ))}
          </div>
        </Career7Card>

        <div className="grid gap-4">
          {trackers.map(([title, value, description]) => (
            <Career7Card key={title} as="section">
              <p className="font-black text-slate-950">{title}</p>
              <p className="mt-2 text-sm c7-muted">{description}</p>
              <div className="mt-4 h-3 rounded-full bg-slate-200">
                <div className="h-3 rounded-full bg-gradient-to-r from-amber-300 via-cyan-300 to-purple-500" style={{ width: value }} />
              </div>
              <p className="mt-2 text-sm font-black text-slate-700">{value}</p>
            </Career7Card>
          ))}
        </div>
      </section>
    </Career7DashboardShell>
  );
}
