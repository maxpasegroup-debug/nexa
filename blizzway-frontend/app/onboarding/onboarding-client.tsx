"use client";

import Link from "next/link";
import { useState } from "react";

import { getApiErrorMessage, soulVaultApi, type BlizzwayVaultPayload } from "@/lib/api";

const assessmentCards = [
  ["energizes", "What energizes you most?", "Learning new skills, solving problems, helping people, creating, leading, or earning independently."],
  ["stuck", "Where do you feel stuck?", "Confidence, clarity, communication, proof, interviews, money, exams, migration, or direction."],
  ["protect", "What should NEXA protect?", "Your focus, motivation, family trust, self-belief, time, and next practical step."],
];

const stages = [
  "School student",
  "College learner",
  "First job seeker",
  "Working professional",
  "Career switcher",
  "Migration aspirant",
];

const dreamGoals = [
  "Get career clarity",
  "Build a premium profile",
  "Improve communication",
  "Find better opportunities",
  "Start earning confidently",
  "Prepare for global pathways",
];

const defaultVision = {
  sixMonths: "Clear skills, visible proof, and a calmer weekly rhythm.",
  oneYear: "A stronger profile, better interviews, and real opportunity momentum.",
  threeYears: "A trusted professional identity with meaningful earning growth.",
  fiveYears: "A confident life path shaped by learning, earning, and purpose.",
};

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label="Blizzway home">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#20164f] text-sm font-black text-white shadow-lg shadow-purple-500/20">
        BW
      </span>
      <span>
        <span className="block text-base font-black tracking-tight text-slate-950">Blizzway</span>
        <span className="block text-xs font-semibold c7-muted">The Magical Career Pathway</span>
      </span>
    </Link>
  );
}

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{title}</h2>
      <p className="mt-4 max-w-3xl text-base leading-7 c7-muted">{description}</p>
    </div>
  );
}

export function OnboardingClient() {
  const [stage, setStage] = useState(stages[2]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([dreamGoals[1]]);
  const [answers, setAnswers] = useState<Record<string, string>>({
    energizes: "",
    stuck: "",
    protect: "",
  });
  const [vision, setVision] = useState(defaultVision);
  const [summary, setSummary] = useState("Product thinker, portfolio builder, global career aspirant.");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function toggleGoal(goal: string) {
    setSelectedGoals((current) =>
      current.includes(goal) ? current.filter((item) => item !== goal) : [...current, goal],
    );
  }

  async function saveOnboarding() {
    setSaving(true);
    setSaved(false);
    setError("");

    const payload: BlizzwayVaultPayload = {
      onboardingAnswers: answers,
      digitalProfile: {
        stage,
        summary,
        strengths: selectedGoals.slice(0, 6),
      },
      dreamGoals: selectedGoals,
      visionBoard: vision,
    };

    try {
      await soulVaultApi.saveSoulVault(payload);
      setSaved(true);
    } catch (caught) {
      setError(getApiErrorMessage(caught));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="c7-shell min-h-screen overflow-hidden">
      <header className="border-b border-white/70 bg-white/84 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Logo />
          <div className="flex items-center gap-2">
            <Link href="/login" className="rounded-full px-4 py-2 text-sm font-black text-slate-600 hover:text-slate-950">
              Login
            </Link>
            <Link href="/dashboard" className="c7-button-primary">
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <section className="relative px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_50%_0%,rgba(143,92,247,0.20),transparent_54%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.96fr_1.04fr] lg:items-center">
          <div>
            <span className="c7-badge">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              NEXA-led onboarding
            </span>
            <h1 className="mt-6 text-5xl font-black tracking-tight text-slate-950 sm:text-6xl">
              Let NEXA understand your dream.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 c7-muted">
              This helps the Guardian Angel AI learn your stage, ambition, timeline, and confidence needs before building your Blizzway pathway.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={saveOnboarding} disabled={saving} className="c7-button-primary min-w-40 disabled:opacity-70">
                {saving ? "Saving..." : "Save Onboarding"}
              </button>
              <Link href="/dashboard" className="c7-button-secondary min-w-40">
                Enter Dashboard
              </Link>
            </div>
            {saved ? <p className="mt-4 text-sm font-black text-emerald-700">Saved to Soul Vault.</p> : null}
            {error ? <p className="mt-4 text-sm font-black text-rose-700">{error}</p> : null}
          </div>

          <div className="c7-card c7-magical-glow p-5 sm:p-6">
            <div className="c7-gradient-panel rounded-[24px] p-5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/68">Guardian Angel AI</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight">I will help you choose the next kind step.</h2>
              <p className="mt-4 leading-7 text-white/72">
                Not a test. Not pressure. Just a warm intelligence layer for your career growth.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            eyebrow="Smart assessment"
            title="Question cards that feel human."
            description="NEXA starts with thoughtful prompts that reveal motivation, blockers, strengths, and the kind of support each user needs."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {assessmentCards.map(([key, title, description], index) => (
              <article key={key} className="c7-card c7-magical-glow p-5">
                <span className="text-5xl font-black text-indigo-100">0{index + 1}</span>
                <h3 className="mt-4 text-xl font-black text-slate-950">{title}</h3>
                <p className="mt-3 text-sm leading-6 c7-muted">{description}</p>
                <textarea
                  value={answers[key] ?? ""}
                  onChange={(event) => setAnswers((current) => ({ ...current, [key]: event.target.value }))}
                  placeholder="Write a private answer..."
                  className="mt-4 min-h-28 w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-950 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="c7-section mx-auto grid max-w-7xl gap-8 p-6 sm:p-8 lg:grid-cols-2">
          <div>
            <SectionTitle
              eyebrow="Current stage"
              title="Where are you starting from?"
              description="Stage selection helps Blizzway make guidance trustworthy for students, parents, and professionals."
            />
            <div className="mt-6 flex flex-wrap gap-2">
              {stages.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setStage(item)}
                  className={`rounded-full border px-4 py-2 text-sm font-black transition ${
                    stage === item
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-700"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
            <textarea
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              className="mt-6 min-h-28 w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-950 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            />
          </div>

          <div>
            <SectionTitle
              eyebrow="Dream goal"
              title="What should your pathway move toward?"
              description="Dream goals help NEXA connect emotion with practical next steps."
            />
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              {dreamGoals.map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => toggleGoal(goal)}
                  className={`rounded-2xl border p-4 text-left text-sm font-black transition ${
                    selectedGoals.includes(goal)
                      ? "border-indigo-200 bg-indigo-50 text-indigo-800"
                      : "border-slate-200 bg-white text-slate-700 hover:border-indigo-200"
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            eyebrow="Vision preview"
            title="A future map across 6 months, 1 year, 3 years, and 5 years."
            description="Blizzway helps users imagine progress without making the future feel overwhelming."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {[
              ["sixMonths", "6 months"],
              ["oneYear", "1 year"],
              ["threeYears", "3 years"],
              ["fiveYears", "5 years"],
            ].map(([key, time]) => (
              <article key={key} className="c7-card p-5">
                <p className="text-sm font-black uppercase tracking-[0.16em] text-indigo-600">{time}</p>
                <textarea
                  value={vision[key as keyof typeof vision]}
                  onChange={(event) => setVision((current) => ({ ...current, [key]: event.target.value }))}
                  className="mt-4 min-h-32 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm leading-6 c7-muted outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 sm:pb-16 lg:px-8">
        <div className="c7-gradient-panel mx-auto grid max-w-7xl gap-6 rounded-[30px] p-6 shadow-2xl shadow-indigo-500/20 sm:p-9 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/68">Soul Vault</p>
            <h2 className="mt-4 text-4xl font-black tracking-tight">Your confidence deserves a home.</h2>
            <p className="mt-5 text-lg leading-8 text-white/72">
              Soul Vault holds reflections, proof, achievements, and confidence moments so NEXA can help users remember how far they have come.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {["Achievements", "Proof notes", "Reflections", "Confidence wins"].map((item) => (
              <div key={item} className="rounded-2xl bg-white/14 p-5 ring-1 ring-white/14">
                <p className="font-black text-white">{item}</p>
                <p className="mt-2 text-sm leading-6 text-white/68">Saved for future pathway guidance.</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-4xl text-center">
          <button type="button" onClick={saveOnboarding} disabled={saving} className="c7-button-primary min-w-48 disabled:opacity-70">
            {saving ? "Saving..." : "Save and Continue"}
          </button>
          <p className="mt-4 text-sm c7-muted">Stored in BGOS as Blizzway-scoped Soul Vault data.</p>
        </div>
      </section>
    </main>
  );
}
