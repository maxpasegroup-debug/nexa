"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { BlizzwayBadge, BlizzwayButton, BlizzwayCard, BlizzwayEmptyState, BlizzwayGradientPanel } from "@/components/blizzway";
import { BlizzwayDashboardShell } from "@/app/dashboard-shell";
import { assessmentsApi, getApiErrorMessage, type BlizzwayAssessment, type BlizzwayAssessmentAttempt, type BlizzwayAssessmentResult } from "@/lib/api";

type RunnerState = "loading" | "detail" | "running" | "result" | "error";

export function AssessmentRunner({ slug }: { slug: string }) {
  const [state, setState] = useState<RunnerState>("loading");
  const [assessment, setAssessment] = useState<BlizzwayAssessment | null>(null);
  const [attempt, setAttempt] = useState<BlizzwayAssessmentAttempt | null>(null);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [result, setResult] = useState<BlizzwayAssessmentResult | null>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    assessmentsApi.getAssessment(slug)
      .then((response) => {
        if (cancelled) return;
        setError("");
        setAssessment(response.assessment);
        setState("detail");
      })
      .catch((caught) => {
        if (cancelled) return;
        setError(getApiErrorMessage(caught));
        setState("error");
      });
    return () => { cancelled = true; };
  }, [slug]);

  const questions = useMemo(() => assessment?.questions ?? [], [assessment]);
  const answeredCount = useMemo(
    () => questions.filter((question) => answers[question.id] !== undefined && answers[question.id] !== "").length,
    [answers, questions],
  );
  const progress = questions.length ? Math.round((answeredCount / questions.length) * 100) : 0;

  async function start() {
    if (!assessment) return;
    setBusy("start");
    setError("");
    try {
      const response = await assessmentsApi.startAssessment(assessment.slug, `assessment-${assessment.slug}-${Date.now()}`);
      setAttempt(response.attempt);
      setAssessment(response.assessment);
      setState("running");
    } catch (caught) {
      setError(getApiErrorMessage(caught));
    } finally {
      setBusy("");
    }
  }

  async function save(questionId: string, value: unknown) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
    if (!attempt) return;
    try {
      await assessmentsApi.saveAnswer(attempt.id, questionId, value);
    } catch (caught) {
      setError(getApiErrorMessage(caught));
    }
  }

  async function submit() {
    if (!attempt) return;
    setBusy("submit");
    setError("");
    try {
      const response = await assessmentsApi.submitAttempt(attempt.id);
      setResult(response.result);
      setState("result");
    } catch (caught) {
      setError(getApiErrorMessage(caught));
    } finally {
      setBusy("");
    }
  }

  return (
    <BlizzwayDashboardShell
      activeHref="/assessments"
      title={assessment?.title ?? "Assessment"}
      description="Run a guidance-only Blizzway assessment and turn the result into BDP intelligence."
    >
      {state === "loading" ? <div className="h-96 animate-pulse rounded-[24px] bg-white" /> : null}

      {state === "error" ? (
        <BlizzwayEmptyState title="Unable to load assessment" description={error || "Please try again."} actionHref="/assessments" actionLabel="Back to assessments" />
      ) : null}

      {assessment && state === "detail" ? (
        <div className="grid gap-6 xl:grid-cols-[1fr_0.36fr]">
          <BlizzwayGradientPanel>
            <div className="flex flex-wrap gap-2">
              <BlizzwayBadge tone="cyan">{assessment.category}</BlizzwayBadge>
              <BlizzwayBadge tone={assessment.creditCost === 0 ? "emerald" : "purple"}>
                {assessment.creditCost === 0 ? "Free" : `${assessment.creditCost} credits`}
              </BlizzwayBadge>
              <BlizzwayBadge tone="slate">{assessment.repeatable ? "Repeatable" : "One-time"}</BlizzwayBadge>
            </div>
            <h2 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">{assessment.title}</h2>
            <p className="mt-4 max-w-3xl leading-7 text-white/72">{assessment.description}</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <Metric label="Time" value={assessment.timeRequired} />
              <Metric label="Questions" value={String(assessment.questions?.length ?? 0)} />
              <Metric label="BDP impact" value={assessment.bdpImpact} />
            </div>
            <p className="mt-6 rounded-2xl bg-white/10 p-4 text-sm font-semibold leading-6 text-white/76">{assessment.disclaimer}</p>
            {error ? <p className="mt-4 rounded-2xl bg-rose-50 p-4 text-sm font-black text-rose-700">{error}</p> : null}
            <BlizzwayButton type="button" onClick={start} disabled={busy === "start"} className="mt-6" variant="secondary">
              {busy === "start" ? "Starting..." : "Start assessment"}
            </BlizzwayButton>
          </BlizzwayGradientPanel>

          <BlizzwayCard>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Measured dimensions</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {assessment.measures.map((measure) => <BlizzwayBadge key={measure} tone="slate">{measure.replace(/_/g, " ")}</BlizzwayBadge>)}
            </div>
            <p className="mt-5 text-sm leading-6 c7-muted">{assessment.nexaRecommendation}</p>
          </BlizzwayCard>
        </div>
      ) : null}

      {assessment && state === "running" ? (
        <div className="grid gap-6 xl:grid-cols-[1fr_0.34fr]">
          <BlizzwayCard>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Assessment in progress</p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">{assessment.title}</h2>
              </div>
              <BlizzwayBadge tone="cyan">{progress}%</BlizzwayBadge>
            </div>
            <div className="mt-5 h-2 rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-indigo-600 transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-6 space-y-4">
              {questions.map((question, index) => (
                <div key={question.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Question {index + 1}</p>
                  <p className="mt-2 font-black text-slate-950">{question.prompt}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {question.options.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => void save(question.id, Number(option.optionKey))}
                        className={`rounded-full border px-4 py-2 text-sm font-black transition ${answers[question.id] === Number(option.optionKey) ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300"}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {error ? <p className="mt-4 rounded-2xl bg-rose-50 p-4 text-sm font-black text-rose-700">{error}</p> : null}
            <BlizzwayButton type="button" onClick={submit} disabled={busy === "submit" || answeredCount < questions.length} className="mt-6 w-full" variant="dark">
              {busy === "submit" ? "NEXA is scoring..." : "Submit assessment"}
            </BlizzwayButton>
          </BlizzwayCard>

          <BlizzwayCard>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Credit safety</p>
            <p className="mt-3 text-sm leading-6 c7-muted">
              Credits are charged once when the attempt starts. Submitting again returns the same result.
            </p>
          </BlizzwayCard>
        </div>
      ) : null}

      {result && state === "result" ? <ResultPanel result={result} /> : null}
    </BlizzwayDashboardShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/12 p-4 ring-1 ring-white/12">
      <p className="text-sm font-semibold text-white/60">{label}</p>
      <p className="mt-2 font-black text-white">{value}</p>
    </div>
  );
}

function ResultPanel({ result }: { result: BlizzwayAssessmentResult }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.36fr_1fr]">
      <BlizzwayGradientPanel>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-white/66">Result</p>
        <p className="mt-4 text-6xl font-black">{result.percentage}%</p>
        <p className="mt-2 text-xl font-black">{result.readinessLevel}</p>
        <p className="mt-5 leading-7 text-white/72">{result.aiInsight}</p>
      </BlizzwayGradientPanel>
      <div className="space-y-6">
        <BlizzwayCard>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Dimension scores</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {result.dimensionScores.map((dimension) => (
              <div key={dimension.key} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-black capitalize text-slate-950">{dimension.label}</p>
                  <p className="font-black text-indigo-700">{dimension.percentage}%</p>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white">
                  <div className="h-2 rounded-full bg-indigo-600" style={{ width: `${dimension.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </BlizzwayCard>
        <div className="grid gap-6 md:grid-cols-2">
          <ListCard title="Strengths" items={result.strengths} empty="Your strengths will sharpen as you answer more signals." />
          <ListCard title="Improvement areas" items={result.improvementAreas} empty="No major gaps detected in this starter result." />
        </div>
        <ListCard title="NEXA recommended next actions" items={result.recommendations} empty="NEXA will recommend next actions after scoring." />
        <BlizzwayCard>
          <p className="text-sm font-black text-emerald-700">BDP updated</p>
          <p className="mt-2 text-sm leading-6 c7-muted">Your private BDP intelligence and My Pathway quest progress were updated. Raw answers remain private.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <BlizzwayButton href="/bdp" variant="dark">Open BDP</BlizzwayButton>
            <BlizzwayButton href="/my-pathway" variant="secondary">Open My Pathway</BlizzwayButton>
            <Link href="/assessments" className="c7-button-secondary">More assessments</Link>
          </div>
        </BlizzwayCard>
        <p className="text-sm font-semibold c7-muted">{result.safetyNote}</p>
      </div>
    </div>
  );
}

function ListCard({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return (
    <BlizzwayCard>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">{title}</p>
      <ul className="mt-4 space-y-3">
        {(items.length ? items : [empty]).map((item) => (
          <li key={item} className="rounded-2xl bg-slate-50 p-3 text-sm font-semibold text-slate-700">{item}</li>
        ))}
      </ul>
    </BlizzwayCard>
  );
}
