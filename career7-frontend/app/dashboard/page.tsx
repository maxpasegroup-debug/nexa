import {
  Career7Badge,
  Career7Card,
  Career7GradientPanel,
  Career7ProgressTracker,
} from "@/components/career7";
import { Career7DashboardShell } from "../dashboard-shell";

const progressItems = [
  { label: "Profile polish", value: "Done", complete: true },
  { label: "Resume scan", value: "In review", complete: true },
  { label: "Interview drill", value: "Next", complete: false },
];

const visionItems = [
  "Senior product role",
  "Proof-led portfolio",
  "Premium mentor circle",
];

const tasks = [
  { time: "10:00 AM", title: "Run NEXA resume pass", tag: "Boost" },
  { time: "01:30 PM", title: "Add portfolio proof note", tag: "Vault" },
  { time: "05:00 PM", title: "Practice behavioral answer", tag: "Interview" },
];

function WidgetTitle({
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
      <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950">{title}</h2>
      {description ? <p className="mt-2 text-sm leading-6 c7-muted">{description}</p> : null}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Career7DashboardShell
      activeHref="/dashboard"
      title="Good morning, Arun"
      description="NEXA has prepared your next best growth actions."
    >
      <section className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <Career7GradientPanel className="overflow-hidden">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">
                NEXA insight
              </p>
              <h2 className="mt-3 max-w-2xl text-[1.65rem] font-black leading-tight tracking-tight sm:text-4xl">
                Your strongest next move is one focused proof sprint.
              </h2>
              <p className="mt-4 max-w-2xl leading-7 text-white/72">
                Finish the portfolio proof note, then spend credits on a resume pass before
                sending applications this week.
              </p>
            </div>
            <div className="rounded-[24px] bg-white/14 p-5 ring-1 ring-white/14 lg:min-w-52">
              <p className="text-sm font-bold text-white/70">Confidence</p>
              <p className="mt-2 text-4xl font-black sm:text-5xl">92%</p>
              <p className="mt-2 text-sm text-white/66">High fit signal</p>
            </div>
          </div>
        </Career7GradientPanel>

        <Career7Card as="section" className="flex flex-col justify-between">
          <WidgetTitle
            eyebrow="Career Score"
            title="87 / 100"
            description="Premium readiness score from dummy profile, proof, and practice signals."
          />
          <div className="mt-6">
            <div className="h-3 rounded-full bg-slate-200">
              <div className="h-3 w-[87%] rounded-full bg-gradient-to-r from-indigo-600 via-purple-500 to-cyan-500" />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Career7Badge tone="emerald">+12 this week</Career7Badge>
              <Career7Badge tone="slate">Launch ready</Career7Badge>
            </div>
          </div>
        </Career7Card>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-3">
        <Career7Card as="section">
          <WidgetTitle
            eyebrow="Today's Progress"
            title="3 of 5 actions"
            description="A simple daily rhythm for keeping career momentum visible."
          />
          <div className="mt-6 space-y-3">
            {progressItems.map((item) => (
              <div key={item.label} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-black ${
                    item.complete ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {item.complete ? "OK" : "N"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-slate-950">{item.label}</p>
                  <p className="text-xs font-semibold c7-muted">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </Career7Card>

        <Career7Card as="section">
          <WidgetTitle
            eyebrow="Vision Board"
            title="North-star outcomes"
            description="Dummy aspirations NEXA keeps in view while planning actions."
          />
          <div className="mt-6 grid gap-3">
            {visionItems.map((item, index) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-black text-indigo-600">0{index + 1}</p>
                <p className="mt-2 font-black text-slate-950">{item}</p>
              </div>
            ))}
          </div>
        </Career7Card>

        <Career7Card as="section">
          <WidgetTitle
            eyebrow="Wallet Credits"
            title="2,400 credits"
            description="Dummy balance for boosts, agents, and premium reviews."
          />
          <div className="mt-6 rounded-[24px] bg-slate-950 p-5 text-white">
            <p className="text-sm text-white/60">Available now</p>
            <p className="mt-2 text-4xl font-black">2,400</p>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-white/8 p-3">
                <p className="font-black">320</p>
                <p className="mt-1 text-white/58">Planned spend</p>
              </div>
              <div className="rounded-2xl bg-white/8 p-3">
                <p className="font-black">5</p>
                <p className="mt-1 text-white/58">Boosts ready</p>
              </div>
            </div>
          </div>
        </Career7Card>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
        <Career7Card as="section">
          <WidgetTitle
            eyebrow="Upcoming Tasks"
            title="Today's queue"
            description="Dummy schedule for your next guided career actions."
          />
          <div className="mt-6 space-y-3">
            {tasks.map((task) => (
              <div key={task.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                      {task.time}
                    </p>
                    <p className="mt-2 font-black text-slate-950">{task.title}</p>
                  </div>
                  <Career7Badge tone="slate" className="self-start">{task.tag}</Career7Badge>
                </div>
              </div>
            ))}
          </div>
        </Career7Card>

        <Career7GradientPanel className="flex min-h-[320px] flex-col justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">
              Blizzway
            </p>
            <h2 className="mt-3 max-w-2xl text-[1.65rem] font-black leading-tight tracking-tight sm:text-3xl">
              Unlock a guided premium sprint when your proof stack is ready.
            </h2>
            <p className="mt-4 max-w-2xl leading-7 text-white/72">
              Your current score suggests Blizzway prep should focus on portfolio
              story, interview sharpness, and mentor-grade review.
            </p>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {["Proof review", "Mentor map", "Launch plan"].map((item) => (
              <div key={item} className="rounded-2xl bg-white/14 p-4 ring-1 ring-white/14">
                <p className="font-black">{item}</p>
                <p className="mt-2 text-sm text-white/70">Phase 2 dummy</p>
              </div>
            ))}
          </div>
        </Career7GradientPanel>
      </section>

      <Career7ProgressTracker />
    </Career7DashboardShell>
  );
}
