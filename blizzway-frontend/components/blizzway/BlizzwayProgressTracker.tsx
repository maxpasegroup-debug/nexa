import { BlizzwayBadge } from "./BlizzwayBadge";
import { BlizzwayCard } from "./BlizzwayCard";

const weekDays = [
  { label: "Mon", complete: true },
  { label: "Tue", complete: true },
  { label: "Wed", complete: true },
  { label: "Thu", complete: false },
  { label: "Fri", complete: false },
  { label: "Sat", complete: false },
  { label: "Sun", complete: false },
];

const skillProgress = [
  { label: "Career English", value: 68 },
  { label: "Resume proof", value: 81 },
  { label: "Interview confidence", value: 57 },
];

const completedActions = [
  "Updated career summary",
  "Finished resume scan",
  "Saved one proof note",
];

const recommendedActions = [
  "Practice one interview answer",
  "Add metrics to project story",
  "Review two Earning Universe leads",
];

function ProgressLine({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-sm">
        <p className="font-black text-slate-700">{label}</p>
        <p className="font-black text-indigo-600">{value}%</p>
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

export function BlizzwayProgressTracker() {
  return (
    <BlizzwayCard as="section" className="mt-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">
            Progress tracking
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
            Small wins, visible momentum
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 c7-muted">
            A simple weekly view of Learning Garden, Earning Universe, completed actions, and the next best moves.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <BlizzwayBadge tone="emerald">4 day streak</BlizzwayBadge>
          <BlizzwayBadge tone="cyan">7 actions this week</BlizzwayBadge>
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-[24px] bg-slate-50 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-black text-slate-950">Weekly growth tracker</p>
              <p className="mt-1 text-sm c7-muted">Keep the chain gentle and consistent.</p>
            </div>
            <p className="text-3xl font-black text-slate-950">43%</p>
          </div>
          <div className="mt-5 grid grid-cols-7 gap-1.5 sm:gap-2">
            {weekDays.map((day) => (
              <div key={day.label} className="text-center">
                <div
                  className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs font-black sm:h-10 sm:w-10 ${
                    day.complete ? "bg-slate-950 text-white" : "bg-white text-slate-400"
                  }`}
                >
                  {day.label.slice(0, 1)}
                </div>
                <p className="mt-2 text-[11px] font-black text-slate-500">{day.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[24px] border border-slate-200 bg-white p-4">
            <p className="font-black text-slate-950">Skill progress</p>
            <div className="mt-4 space-y-4">
              {skillProgress.map((skill) => (
                <ProgressLine key={skill.label} label={skill.label} value={skill.value} />
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[24px] border border-emerald-100 bg-emerald-50 p-4">
              <p className="text-sm font-black text-emerald-700">Learning Garden streak</p>
              <p className="mt-2 text-3xl font-black text-slate-950">4 days</p>
              <p className="mt-1 text-sm font-semibold text-emerald-700/75">
                One more calm action keeps it alive.
              </p>
            </div>
            <div className="rounded-[24px] border border-cyan-100 bg-cyan-50 p-4">
              <p className="text-sm font-black text-cyan-700">Earning Universe discipline</p>
              <p className="mt-2 text-3xl font-black text-slate-950">2 / 3</p>
              <p className="mt-1 text-sm font-semibold text-cyan-700/75">
                Leads reviewed before spending credits.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-[24px] border border-slate-200 bg-white p-4">
          <p className="font-black text-slate-950">Completed actions</p>
          <div className="mt-4 grid gap-2">
            {completedActions.map((action) => (
              <div key={action} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-black text-emerald-700">
                  OK
                </span>
                <p className="text-sm font-bold text-slate-700">{action}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-4">
          <p className="font-black text-slate-950">Next recommended actions</p>
          <div className="mt-4 grid gap-2">
            {recommendedActions.map((action, index) => (
              <div key={action} className="flex items-center gap-3 rounded-2xl bg-indigo-50 p-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-black text-indigo-600">
                  {index + 1}
                </span>
                <p className="text-sm font-bold text-slate-700">{action}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BlizzwayCard>
  );
}
