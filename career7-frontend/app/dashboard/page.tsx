import {
  AgentAppCard,
  Career7Badge,
  Career7Card,
  Career7GradientPanel,
  Career7SectionTitle,
  Career7StatCard,
} from "@/components/career7";
import { Career7DashboardShell } from "../dashboard-shell";

const stats = [
  { label: "Career readiness", value: "87%", trend: "+12%", tone: "indigo" as const },
  { label: "Wallet credits", value: "2,400", trend: "Active", tone: "cyan" as const },
  { label: "Growth tasks", value: "18", trend: "5 due", tone: "amber" as const },
];

const boardItems = [
  ["Career clarity", "Complete your goal profile", "Done"],
  ["Portfolio proof", "Upload one strong project summary", "Active"],
  ["Interview loop", "Run a 15-minute NEXA mock interview", "Next"],
];

const boosts = ["Resume scan", "Role fit", "Mock interview", "Skill map"];

export default function DashboardPage() {
  return (
    <Career7DashboardShell
      activeHref="/dashboard"
      title="Good morning, Arun"
      description="NEXA has prepared your next best growth actions."
    >
        <section className="mt-5 grid gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <Career7StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              trend={stat.trend}
              tone={stat.tone}
            />
          ))}
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <Career7GradientPanel>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">Today with NEXA</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">Your career momentum is strong.</h2>
            <p className="mt-4 max-w-2xl leading-7 text-white/72">
              Finish one proof task, run one interview loop, and spend credits on the resume scan before applying.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {["Proof task", "Interview drill", "Resume boost"].map((item) => (
                <div key={item} className="rounded-2xl bg-white/14 p-4 ring-1 ring-white/14">
                  <p className="font-black">{item}</p>
                  <p className="mt-2 text-sm text-white/70">Recommended</p>
                </div>
              ))}
            </div>
          </Career7GradientPanel>

          <Career7Card>
            <Career7SectionTitle
              eyebrow="Growth Board"
              title="This week"
              description="Dummy milestones for the dashboard shell."
            />
            <div className="mt-5 space-y-3">
              {boardItems.map(([title, desc, state]) => (
                <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-black text-slate-950">{title}</p>
                    <Career7Badge tone={state === "Active" ? "emerald" : "slate"}>{state}</Career7Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 c7-muted">{desc}</p>
                </div>
              ))}
            </div>
          </Career7Card>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.82fr]">
          <Career7Card>
            <Career7SectionTitle
              eyebrow="Agent Store"
              title="Suggested agents"
              description="Placeholder agent cards for the dashboard home."
            />
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <AgentAppCard
                name="Career Compass"
                category="Strategy"
                description="Turns career ambition into weekly growth actions."
                score="98"
              />
              <AgentAppCard
                name="Interview Studio"
                category="Practice"
                description="Runs focused interview preparation loops."
                score="94"
                accent="cyan"
              />
            </div>
          </Career7Card>

          <Career7Card>
            <Career7SectionTitle
              eyebrow="Quick Boosts"
              title="Tools shelf"
              description="Fast actions to improve one career asset at a time."
            />
            <div className="mt-5 grid grid-cols-2 gap-3">
              {boosts.map((boost) => (
                <a key={boost} href="/quick-boosts" className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-200 hover:bg-indigo-50">
                  <p className="text-sm font-black text-slate-950">{boost}</p>
                  <p className="mt-2 text-xs c7-muted">Placeholder</p>
                </a>
              ))}
            </div>
          </Career7Card>
        </section>
    </Career7DashboardShell>
  );
}
