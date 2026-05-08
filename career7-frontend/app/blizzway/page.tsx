import { Career7Badge, Career7Button, Career7Card } from "@/components/career7";
import { Career7DashboardShell } from "../dashboard-shell";

type RoadmapStage = {
  phase: string;
  title: string;
  description: string;
  progress: number;
  status: string;
};

type Milestone = {
  week: string;
  title: string;
  detail: string;
  complete: boolean;
};

type Outcome = {
  title: string;
  value: string;
  description: string;
  tone: "indigo" | "cyan" | "emerald" | "violet";
};

const roadmap: RoadmapStage[] = [
  {
    phase: "01",
    title: "Clarity Gate",
    description: "Define your premium role, migration, or Earning Universe destination with Guardian Angel AI.",
    progress: 92,
    status: "Almost complete",
  },
  {
    phase: "02",
    title: "Proof Forge",
    description: "Shape resume, portfolio proof, language confidence, and interview stories.",
    progress: 68,
    status: "In motion",
  },
  {
    phase: "03",
    title: "Elite Review",
    description: "Run mentor-grade checks before your public launch or application sprint.",
    progress: 38,
    status: "Preparing",
  },
  {
    phase: "04",
    title: "Launch Passage",
    description: "Move with a sequenced plan, weekly decisions, and visible transformation wins.",
    progress: 18,
    status: "Locked next",
  },
];

const milestones: Milestone[] = [
  {
    week: "Week 1",
    title: "Vision locked",
    detail: "Target pathway, success criteria, and blockers are mapped.",
    complete: true,
  },
  {
    week: "Week 2",
    title: "Proof stack rebuilt",
    detail: "Resume, portfolio notes, and role stories become sharper.",
    complete: true,
  },
  {
    week: "Week 3",
    title: "Confidence rehearsal",
    detail: "Interview, language, and decision drills create calm readiness.",
    complete: false,
  },
  {
    week: "Week 4",
    title: "Premium launch",
    detail: "Applications, outreach, or migration steps begin with guided rhythm.",
    complete: false,
  },
];

const outcomes: Outcome[] = [
  {
    title: "Career clarity",
    value: "94%",
    description: "A cleaner direction for role, income, or migration choices.",
    tone: "indigo",
  },
  {
    title: "Proof readiness",
    value: "8 assets",
    description: "Resume, portfolio, stories, and review notes in one premium track.",
    tone: "cyan",
  },
  {
    title: "Launch confidence",
    value: "4 weeks",
    description: "A guided sprint that turns vague ambition into visible movement.",
    tone: "emerald",
  },
  {
    title: "Elite momentum",
    value: "3 reviews",
    description: "Dummy mentor-grade checkpoints before the next major step.",
    tone: "violet",
  },
];

const toneClass: Record<Outcome["tone"], string> = {
  indigo: "border-indigo-100 bg-indigo-50 text-indigo-700",
  cyan: "border-cyan-100 bg-cyan-50 text-cyan-700",
  emerald: "border-emerald-100 bg-emerald-50 text-emerald-700",
  violet: "border-violet-100 bg-violet-50 text-violet-700",
};

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">{eyebrow}</p>
      <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">{title}</h2>
      {description ? <p className="mt-2 text-sm leading-6 c7-muted">{description}</p> : null}
    </div>
  );
}

function ProgressLine({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-sm">
        <p className="font-black text-slate-700">{label}</p>
        <p className="font-black text-indigo-600">{value}%</p>
      </div>
      <div className="mt-2 h-3 rounded-full bg-slate-200">
        <div
          className="h-3 rounded-full bg-gradient-to-r from-indigo-600 via-cyan-500 to-emerald-400"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function BlizzwayPage() {
  return (
    <Career7DashboardShell
      activeHref="/blizzway"
      eyebrow="Blizzway"
      title="Blizzway Premium Pathway"
      description="A premium guided pathway for ambitious Blizzway users moving from clarity to launch."
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Blizzway" }]}
    >
      <section className="mt-5 overflow-hidden rounded-[30px] bg-slate-950 p-5 text-white shadow-2xl shadow-slate-950/18">
        <div className="grid gap-8 xl:grid-cols-[1fr_0.42fr] xl:items-end">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-cyan-400/14 px-3 py-1 text-xs font-black text-cyan-100 ring-1 ring-cyan-200/20">
                Premium pathway
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white/76 ring-1 ring-white/10">
                Dummy simulation
              </span>
            </div>
            <h2 className="mt-5 max-w-4xl text-[2.2rem] font-black leading-tight tracking-tight sm:text-6xl">
              Cross from scattered ambition into elite career momentum.
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-7 text-white/72 sm:text-lg">
              Blizzway is the premium Blizzway pathway for people ready to turn desire into
              direction, proof, confidence, and launch-grade action.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Career7Button type="button" variant="primary" className="w-full sm:w-auto">
                Unlock Premium Pathway
              </Career7Button>
              <Career7Button type="button" variant="secondary" className="w-full sm:w-auto">
                Preview Roadmap
              </Career7Button>
            </div>
          </div>

          <div className="rounded-[26px] bg-white p-5 text-slate-950 shadow-2xl shadow-slate-950/20">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
              Transformation score
            </p>
            <p className="mt-3 text-6xl font-black">72%</p>
            <p className="mt-2 text-sm leading-6 c7-muted">
              Simulated readiness across clarity, proof, confidence, and launch rhythm.
            </p>
            <div className="mt-5 space-y-4">
              <ProgressLine label="Clarity" value={92} />
              <ProgressLine label="Proof" value={68} />
              <ProgressLine label="Launch" value={42} />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.4fr]">
        <Career7Card as="section">
          <SectionTitle
            eyebrow="Roadmap"
            title="Career transformation pathway"
            description="A visual dummy roadmap from inner clarity to external opportunity."
          />
          <div className="mt-6 grid gap-4 lg:grid-cols-4">
            {roadmap.map((stage) => (
              <article key={stage.phase} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white">
                    {stage.phase}
                  </span>
                  <Career7Badge tone="slate">{stage.status}</Career7Badge>
                </div>
                <h3 className="mt-5 text-lg font-black tracking-tight text-slate-950">{stage.title}</h3>
                <p className="mt-2 text-sm leading-6 c7-muted">{stage.description}</p>
                <div className="mt-5">
                  <ProgressLine label="Path energy" value={stage.progress} />
                </div>
              </article>
            ))}
          </div>
        </Career7Card>

        <Career7Card as="section" className="bg-slate-950 text-white">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">
            Guardian Angel AI guidance
          </p>
          <h2 className="mt-3 text-2xl font-black tracking-tight">
            Your next premium move is proof before pressure.
          </h2>
          <p className="mt-4 text-sm leading-6 text-white/72">
            Guardian Angel AI recommends completing the Proof Forge stage before making high-stakes
            applications, interviews, or migration decisions.
          </p>
          <div className="mt-5 rounded-[22px] bg-white/10 p-4 ring-1 ring-white/10">
            <p className="text-sm font-bold text-white/62">Today&apos;s guided action</p>
            <p className="mt-2 text-xl font-black">Polish two proof stories</p>
            <p className="mt-1 text-sm text-white/58">25 minutes - dummy task</p>
          </div>
        </Career7Card>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[0.4fr_1fr]">
        <Career7Card as="section">
          <SectionTitle
            eyebrow="Timeline"
            title="Milestone ascent"
            description="A four-week premium sprint simulation for visible transformation."
          />
          <div className="mt-6 grid gap-3">
            {milestones.map((milestone) => (
              <div key={milestone.week} className="flex gap-3 rounded-[22px] bg-slate-50 p-4">
                <span
                  className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                    milestone.complete ? "bg-emerald-100 text-emerald-700" : "bg-white text-slate-400"
                  }`}
                >
                  {milestone.complete ? "OK" : "N"}
                </span>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                    {milestone.week}
                  </p>
                  <h3 className="mt-1 font-black text-slate-950">{milestone.title}</h3>
                  <p className="mt-1 text-sm leading-6 c7-muted">{milestone.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </Career7Card>

        <section>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <SectionTitle
              eyebrow="Success outcomes"
              title="What Blizzway is designed to unlock"
              description="Premium dummy outcomes focused on momentum, readiness, and identity shift."
            />
            <Career7Badge tone="slate" className="self-start sm:self-auto">
              Dummy data only
            </Career7Badge>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {outcomes.map((outcome) => (
              <article key={outcome.title} className={`rounded-[24px] border p-5 ${toneClass[outcome.tone]}`}>
                <p className="text-xs font-black uppercase tracking-[0.14em] opacity-75">
                  {outcome.title}
                </p>
                <p className="mt-3 text-4xl font-black text-slate-950">{outcome.value}</p>
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-700">
                  {outcome.description}
                </p>
              </article>
            ))}
          </div>
        </section>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.45fr]">
        <Career7Card as="section">
          <SectionTitle
            eyebrow="Progress simulation"
            title="Your premium pathway pulse"
            description="A dummy progress UI showing how Blizzway makes invisible growth feel trackable."
          />
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {[
              ["Mindset", 84],
              ["Portfolio", 63],
              ["Interview aura", 58],
              ["Language polish", 71],
              ["Opportunity map", 49],
              ["Launch rhythm", 42],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[22px] border border-slate-200 bg-white p-4">
                <ProgressLine label={label as string} value={value as number} />
              </div>
            ))}
          </div>
        </Career7Card>

        <div className="rounded-[28px] bg-gradient-to-br from-indigo-600 via-slate-950 to-cyan-700 p-5 text-white shadow-2xl shadow-indigo-500/20">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-100">
            Premium membership
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight">Enter Blizzway Elite</h2>
          <p className="mt-3 text-sm leading-6 text-white/72">
            A high-touch dummy membership layer for guided reviews, milestone rituals, and
            launch support when your next step matters.
          </p>
          <div className="mt-6 rounded-[22px] bg-white/12 p-4 ring-1 ring-white/12">
            <p className="text-sm font-bold text-white/62">Premium credits</p>
            <p className="mt-2 text-5xl font-black">1,200</p>
            <p className="mt-1 text-sm text-white/58">monthly pathway access</p>
          </div>
          <button
            type="button"
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-white px-5 text-sm font-black text-slate-950 transition hover:bg-cyan-50"
          >
            Start Premium Journey
          </button>
        </div>
      </section>
    </Career7DashboardShell>
  );
}
