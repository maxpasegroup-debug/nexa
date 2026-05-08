import Link from "next/link";

import { Career7Badge, Career7Card, Career7GradientPanel } from "@/components/career7";
import { Career7DashboardShell } from "../dashboard-shell";

const magicalSteps = [
  ["09:00", "Water the Learning Garden with one communication drill", "Learning"],
  ["12:30", "Add one proof note to Soul Vault", "Vault"],
  ["17:00", "Review two Earning Universe opportunities", "Earning"],
];

const previews = [
  ["My Pathway", "/my-pathway", "3 active milestones", "Career clarity, proof, and launch actions are arranged for the week."],
  ["Learning Garden", "/learning-garden", "4 growth tracks", "Communication, portfolio proof, exam readiness, and confidence practice."],
  ["Earning Universe", "/earning-universe", "2 opportunity signals", "Dummy leads and role ideas are ready for exploration."],
  ["Magic Market", "/magic-market", "12 preview tools", "Browse companions, boosts, and focused career utilities."],
  ["Soul Vault", "/soul-vault", "8 saved wins", "Reflections, achievements, and confidence notes are safely organized."],
];

function ScoreCard({
  title,
  value,
  description,
  tone,
}: {
  title: string;
  value: string;
  description: string;
  tone: "purple" | "gold";
}) {
  return (
    <Career7Card as="section" className="flex min-h-full flex-col justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">{title}</p>
        <p className="mt-4 text-5xl font-black tracking-tight text-slate-950">{value}</p>
        <p className="mt-3 text-sm leading-6 c7-muted">{description}</p>
      </div>
      <div className="mt-6 h-3 rounded-full bg-slate-200">
        <div
          className={`h-3 rounded-full ${tone === "purple" ? "bg-gradient-to-r from-indigo-700 via-purple-500 to-cyan-400" : "bg-gradient-to-r from-amber-300 via-cyan-300 to-purple-400"}`}
          style={{ width: value }}
        />
      </div>
    </Career7Card>
  );
}

export default function DashboardPage() {
  return (
    <Career7DashboardShell
      activeHref="/dashboard"
      title="Your Blizzway command center"
      description="A clean, magical workspace for pathway clarity, learning momentum, earning signals, and NEXA guidance."
      userName="Arun"
      walletCredits={2400}
    >
      <section className="mt-5 grid gap-5 xl:grid-cols-[1.32fr_0.68fr]">
        <Career7GradientPanel className="overflow-hidden">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">Welcome hero</p>
              <h2 className="mt-3 max-w-3xl text-[1.8rem] font-black leading-tight tracking-tight sm:text-5xl">
                Build one beautiful career pathway at a time.
              </h2>
              <p className="mt-4 max-w-2xl leading-7 text-white/72">
                Blizzway keeps your next learning step, earning move, and confidence signal visible
                without clutter or pressure.
              </p>
            </div>
            <div className="rounded-[24px] bg-white/14 p-5 ring-1 ring-white/14 lg:min-w-56">
              <p className="text-sm font-bold text-white/70">Pathway week</p>
              <p className="mt-2 text-5xl font-black">7</p>
              <p className="mt-2 text-sm text-white/66">Magical steps planned</p>
            </div>
          </div>
        </Career7GradientPanel>

        <Career7Card as="section" className="c7-magical-glow">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">NEXA Guardian Angel</p>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">
            Your next kind step is already clear.
          </h2>
          <p className="mt-3 text-sm leading-6 c7-muted">
            Complete one proof note, then choose a communication boost before browsing opportunities.
          </p>
          <div className="mt-5 rounded-2xl bg-indigo-50 p-4">
            <p className="text-sm font-black text-indigo-700">NEXA suggestion</p>
            <p className="mt-1 text-sm leading-6 text-indigo-700/75">
              Keep today light: one learning action, one confidence save, one earning review.
            </p>
          </div>
        </Career7Card>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-2">
        <ScoreCard
          title="Pathway Score"
          value="86%"
          tone="purple"
          description="Dummy signal for clarity, consistency, and readiness across your pathway."
        />
        <ScoreCard
          title="Happiness / Growth Score"
          value="91%"
          tone="gold"
          description="Dummy signal for emotional momentum, confidence, and sustainable progress."
        />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Career7Card as="section">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Today&apos;s magical steps</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Calm actions, visible wins</h2>
            </div>
            <Career7Badge tone="cyan">3 steps</Career7Badge>
          </div>
          <div className="mt-6 space-y-3">
            {magicalSteps.map(([time, title, tag]) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{time}</p>
                    <p className="mt-2 font-black text-slate-950">{title}</p>
                  </div>
                  <Career7Badge tone="slate" className="self-start">{tag}</Career7Badge>
                </div>
              </div>
            ))}
          </div>
        </Career7Card>

        <section className="grid gap-4 sm:grid-cols-2">
          {previews.map(([title, href, stat, description]) => (
            <Link key={title} href={href} className="c7-card c7-lift-card block p-5">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-600">{title}</p>
              <p className="mt-3 text-2xl font-black text-slate-950">{stat}</p>
              <p className="mt-2 text-sm leading-6 c7-muted">{description}</p>
            </Link>
          ))}
        </section>
      </section>
    </Career7DashboardShell>
  );
}
