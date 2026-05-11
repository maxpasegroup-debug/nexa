"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { getApiErrorMessage, onboardingApi, type BlizzwayOnboardingInput, type BlizzwayOnboardingResponse } from "@/lib/api";

const statusOptions = [
  ["school_student", "School student"],
  ["college_student", "College student"],
  ["graduate", "Graduate"],
  ["working_professional", "Working professional"],
  ["career_switcher", "Career switcher"],
  ["study_abroad_aspirant", "Study abroad aspirant"],
  ["migration_aspirant", "Migration aspirant"],
  ["freelancer", "Freelancer"],
  ["entrepreneur", "Entrepreneur"],
];

const timelineOptions = [
  ["6_months", "6 months"],
  ["1_year", "1 year"],
  ["3_years", "3 years"],
  ["5_years", "5 years"],
];

const skillOptions = ["Communication", "Coding", "Design", "Writing", "Sales", "Research", "Leadership", "Data"];
const interestOptions = ["Technology", "Healthcare", "Business", "Creative work", "Study abroad", "Public service", "Finance", "Teaching"];
const languageOptions = ["English fluency", "IELTS", "Interview speaking", "Business writing", "Presentation confidence"];
const admissionsOptions = ["Choose course", "Shortlist colleges", "Scholarships", "SOP/LOR", "Entrance planning", "Study abroad"];
const earningOptions = ["Internship", "First job", "Freelance project", "Remote work", "Portfolio", "Business idea"];

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function OptionButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left text-sm font-black transition ${
        active
          ? "border-indigo-200 bg-indigo-50 text-indigo-800"
          : "border-slate-200 bg-white text-slate-700 hover:border-indigo-200"
      }`}
    >
      {label}
    </button>
  );
}

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

export function OnboardingClient() {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<BlizzwayOnboardingResponse | null>(null);
  const [form, setForm] = useState<BlizzwayOnboardingInput>({
    currentStatus: "graduate",
    dreamGoal: "Build a clear and confident career pathway",
    preferredLocation: "",
    educationLevel: "",
    skills: ["Communication"],
    interests: ["Technology"],
    confidenceLevel: "medium",
    communicationLevel: "starter",
    financialReadiness: "planning",
    timeline: "1_year",
    languageGoals: [],
    admissionsGoals: [],
    earningGoals: [],
    answers: {
      energizes: "",
      stuck: "",
      protect: "",
    },
    completed: false,
  });

  const progress = useMemo(() => Math.round(((step + 1) / 5) * 100), [step]);

  function update<K extends keyof BlizzwayOnboardingInput>(key: K, value: BlizzwayOnboardingInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit() {
    setSaving(true);
    setError("");
    try {
      const saved = await onboardingApi.saveOnboarding({ ...form, completed: true });
      setResult(saved);
      setStep(4);
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
          <Link href="/dashboard" className="c7-button-secondary">Dashboard</Link>
        </div>
      </header>

      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="c7-gradient-panel rounded-[30px] p-6 shadow-2xl shadow-indigo-500/20 sm:p-9">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/68">NEXA-led onboarding</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">
              Let NEXA build your first Blizzway map.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/72">
              A gentle smart onboarding that creates your starter BDP, first recommendations, and My Pathway milestones.
            </p>
            <div className="mt-7 h-3 rounded-full bg-white/18">
              <div className="h-3 rounded-full bg-white" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="mt-6 c7-card p-5 sm:p-7">
            {step === 0 ? (
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Current status</p>
                <h2 className="mt-3 text-3xl font-black text-slate-950">Where are you starting from?</h2>
                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {statusOptions.map(([value, label]) => (
                    <OptionButton key={value} active={form.currentStatus === value} label={label} onClick={() => update("currentStatus", value)} />
                  ))}
                </div>
              </div>
            ) : null}

            {step === 1 ? (
              <div className="grid gap-5 lg:grid-cols-2">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Dream and place</p>
                  <h2 className="mt-3 text-3xl font-black text-slate-950">What should your pathway move toward?</h2>
                  <textarea
                    value={form.dreamGoal}
                    onChange={(event) => update("dreamGoal", event.target.value)}
                    className="mt-6 min-h-32 w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  />
                </div>
                <div className="grid gap-4">
                  <input value={form.preferredLocation} onChange={(event) => update("preferredLocation", event.target.value)} placeholder="Preferred country or city" className="rounded-2xl border border-slate-200 p-4 font-semibold outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" />
                  <input value={form.educationLevel} onChange={(event) => update("educationLevel", event.target.value)} placeholder="Education level" className="rounded-2xl border border-slate-200 p-4 font-semibold outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" />
                  <div className="grid grid-cols-2 gap-2">
                    {timelineOptions.map(([value, label]) => (
                      <OptionButton key={value} active={form.timeline === value} label={label} onClick={() => update("timeline", value)} />
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Skills and interests</p>
                  <h2 className="mt-3 text-3xl font-black text-slate-950">What signals should NEXA notice?</h2>
                  <div className="mt-6 grid gap-2 sm:grid-cols-2">
                    {skillOptions.map((item) => <OptionButton key={item} active={form.skills.includes(item)} label={item} onClick={() => update("skills", toggle(form.skills, item))} />)}
                  </div>
                </div>
                <div className="mt-12 grid gap-2 sm:grid-cols-2 lg:mt-24">
                  {interestOptions.map((item) => <OptionButton key={item} active={form.interests.includes(item)} label={item} onClick={() => update("interests", toggle(form.interests, item))} />)}
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Readiness and goals</p>
                <h2 className="mt-3 text-3xl font-black text-slate-950">Choose the first support lanes.</h2>
                <div className="mt-6 grid gap-4 lg:grid-cols-3">
                  <input value={form.confidenceLevel} onChange={(event) => update("confidenceLevel", event.target.value)} placeholder="Confidence level" className="rounded-2xl border border-slate-200 p-4 font-semibold outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" />
                  <input value={form.communicationLevel} onChange={(event) => update("communicationLevel", event.target.value)} placeholder="Communication level" className="rounded-2xl border border-slate-200 p-4 font-semibold outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" />
                  <input value={form.financialReadiness} onChange={(event) => update("financialReadiness", event.target.value)} placeholder="Financial readiness" className="rounded-2xl border border-slate-200 p-4 font-semibold outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" />
                </div>
                <div className="mt-6 grid gap-5 lg:grid-cols-3">
                  {[["Language", languageOptions, form.languageGoals, "languageGoals"], ["Admissions", admissionsOptions, form.admissionsGoals, "admissionsGoals"], ["Earning", earningOptions, form.earningGoals, "earningGoals"]].map(([title, options, selected, key]) => (
                    <div key={title as string} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <p className="font-black text-slate-950">{title as string}</p>
                      <div className="mt-3 grid gap-2">
                        {(options as string[]).map((item) => (
                          <OptionButton key={item} active={(selected as string[]).includes(item)} label={item} onClick={() => update(key as keyof BlizzwayOnboardingInput, toggle(selected as string[], item) as never)} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {step === 4 ? (
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">Starter profile created</p>
                <h2 className="mt-3 text-3xl font-black text-slate-950">Your BDP and My Pathway are ready.</h2>
                <div className="mt-6 grid gap-4 lg:grid-cols-3">
                  <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
                    <p className="font-black text-emerald-800">BDP created</p>
                    <p className="mt-2 text-sm leading-6 text-emerald-700">NEXA generated a starter headline, summary, strengths, readiness, and next actions.</p>
                  </div>
                  <div className="rounded-3xl border border-indigo-200 bg-indigo-50 p-5">
                    <p className="font-black text-indigo-800">First recommendations</p>
                    <p className="mt-2 text-sm leading-6 text-indigo-700">{result?.recommendations.firstAssessments[0]?.title ?? "Career Compass Starter"} is your first assessment suggestion.</p>
                  </div>
                  <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
                    <p className="font-black text-amber-800">Starter pathway</p>
                    <p className="mt-2 text-sm leading-6 text-amber-700">{result?.recommendations.pathwayMilestones.length ?? 6} milestones are ready.</p>
                  </div>
                </div>
                <p className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold c7-muted">
                  {result?.recommendations.safetyNote}
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link href="/dashboard" className="c7-button-primary">Go to dashboard</Link>
                  <Link href="/assessments" className="c7-button-secondary">Open free assessments</Link>
                </div>
              </div>
            ) : null}

            {error ? <p className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-black text-rose-700">{error}</p> : null}

            {step < 4 ? (
              <div className="mt-8 flex justify-between gap-3">
                <button type="button" onClick={() => setStep((current) => Math.max(0, current - 1))} className="c7-button-secondary" disabled={step === 0}>
                  Back
                </button>
                {step === 3 ? (
                  <button type="button" onClick={submit} disabled={saving} className="c7-button-primary disabled:opacity-70">
                    {saving ? "Creating..." : "Create my Blizzway"}
                  </button>
                ) : (
                  <button type="button" onClick={() => setStep((current) => current + 1)} className="c7-button-primary">
                    Continue
                  </button>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
