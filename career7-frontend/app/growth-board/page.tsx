import {
  Career7Badge,
  Career7Button,
  Career7Card,
  Career7GradientPanel,
  Career7ProgressTracker,
} from "@/components/career7";
import { Career7DashboardShell } from "../dashboard-shell";

type BoardAgent = {
  name: string;
  focus: string;
  progress: number;
  status: string;
  tone: "indigo" | "cyan" | "emerald" | "purple";
};

const learningAgents: BoardAgent[] = [
  {
    name: "English Teacher",
    focus: "Daily fluency drills and workplace vocabulary.",
    progress: 68,
    status: "Active",
    tone: "indigo",
  },
  {
    name: "IELTS Coach",
    focus: "Speaking bands, writing structure, and mock tests.",
    progress: 44,
    status: "Practice",
    tone: "cyan",
  },
  {
    name: "Resume Architect",
    focus: "Sharper bullets, proof points, and role fit.",
    progress: 81,
    status: "Review",
    tone: "purple",
  },
];

const earningAgents: BoardAgent[] = [
  {
    name: "Freelance Finder",
    focus: "Finds quick projects matched to your skill stack.",
    progress: 52,
    status: "Scouting",
    tone: "emerald",
  },
  {
    name: "Job Match AI",
    focus: "Shortlists roles with strong fit and faster action.",
    progress: 73,
    status: "Matching",
    tone: "cyan",
  },
  {
    name: "Money Discipline Coach",
    focus: "Keeps earning goals, savings, and spending visible.",
    progress: 36,
    status: "Habit",
    tone: "indigo",
  },
];

const toneClasses: Record<BoardAgent["tone"], string> = {
  indigo: "from-indigo-500 to-purple-500",
  cyan: "from-cyan-500 to-indigo-500",
  emerald: "from-emerald-500 to-cyan-500",
  purple: "from-purple-500 to-fuchsia-500",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs font-black text-slate-500">
        <span>Progress</span>
        <span>{value}%</span>
      </div>
      <div className="mt-2 h-3 rounded-full bg-slate-200">
        <div
          className="h-3 rounded-full bg-gradient-to-r from-indigo-600 via-purple-500 to-cyan-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function AgentCard({ agent }: { agent: BoardAgent }) {
  return (
    <article className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-sm font-black text-white shadow-lg shadow-indigo-500/15 ${toneClasses[agent.tone]}`}
        >
          {initials(agent.name)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3 className="font-black text-slate-950">{agent.name}</h3>
              <p className="mt-1 text-sm leading-6 c7-muted">{agent.focus}</p>
            </div>
            <Career7Badge tone="slate" className="self-start">{agent.status}</Career7Badge>
          </div>
          <div className="mt-4">
            <ProgressBar value={agent.progress} />
          </div>
        </div>
      </div>
    </article>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-[22px] border border-dashed border-slate-300 bg-slate-50/70 p-5 text-center">
      <p className="font-black text-slate-950">{label}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 c7-muted">
        Add another specialist when NEXA finds a gap in this lane.
      </p>
      <Career7Button type="button" variant="secondary" size="sm" className="mt-4 w-full sm:w-auto">
        Add Agent
      </Career7Button>
    </div>
  );
}

function BoardColumn({
  title,
  description,
  agents,
  emptyLabel,
}: {
  title: string;
  description: string;
  agents: BoardAgent[];
  emptyLabel: string;
}) {
  const averageProgress = Math.round(
    agents.reduce((total, agent) => total + agent.progress, 0) / agents.length,
  );

  return (
    <Career7Card as="section" className="flex min-h-full flex-col">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">
            Growth lane
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">{title}</h2>
          <p className="mt-2 text-sm leading-6 c7-muted">{description}</p>
        </div>
        <Career7Button type="button" variant="dark" size="sm" className="shrink-0">
          Add Agent
        </Career7Button>
      </div>

      <div className="mt-5 rounded-2xl bg-slate-50 p-4">
        <ProgressBar value={averageProgress} />
      </div>

      <div className="mt-5 grid gap-3">
        {agents.map((agent) => (
          <AgentCard key={agent.name} agent={agent} />
        ))}
        <EmptyState label={emptyLabel} />
      </div>
    </Career7Card>
  );
}

export default function GrowthBoardPage() {
  return (
    <Career7DashboardShell
      activeHref="/growth-board"
      eyebrow="Growth Board"
      title="Growth Board"
      description="Your visual command board for learning, earning, agents, and career momentum."
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Growth Board" }]}
    >
      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.72fr]">
        <Career7GradientPanel>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">
                NEXA recommendation
              </p>
              <h2 className="mt-3 max-w-2xl text-[1.65rem] font-black leading-tight tracking-tight sm:text-4xl">
                Balance one learning sprint with one earning action today.
              </h2>
              <p className="mt-4 max-w-2xl leading-7 text-white/72">
                NEXA recommends finishing Resume Architect review, then letting Job Match
                AI shortlist three roles before your evening practice block.
              </p>
            </div>
            <div className="rounded-[24px] bg-white/14 p-5 ring-1 ring-white/14 lg:min-w-56">
              <p className="text-sm font-bold text-white/70">Board health</p>
              <p className="mt-2 text-4xl font-black sm:text-5xl">72%</p>
              <p className="mt-2 text-sm text-white/66">Momentum is active</p>
            </div>
          </div>
        </Career7GradientPanel>

        <Career7Card as="section">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">
            Active agents
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">6 running</h2>
          <p className="mt-2 text-sm leading-6 c7-muted">
            Dummy agent stack split across learning and earning lanes.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {[
              ["Learning", "64%"],
              ["Earning", "54%"],
              ["Tasks", "9"],
              ["Open slots", "2"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
                  {label}
                </p>
                <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
              </div>
            ))}
          </div>
        </Career7Card>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-2">
        <BoardColumn
          title="Learning"
          description="Agents that build communication, test readiness, and career assets."
          agents={learningAgents}
          emptyLabel="Learning slot available"
        />
        <BoardColumn
          title="Earning"
          description="Agents that turn skills into roles, freelance leads, and money habits."
          agents={earningAgents}
          emptyLabel="Earning slot available"
        />
      </section>

      <Career7ProgressTracker />
    </Career7DashboardShell>
  );
}
