"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Check, Clipboard, Send, X } from "lucide-react";

import { PLAN_ORDER, PLANS } from "@/lib/plans";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
};

type EmployeeSnapshot = {
  id: string;
  fullName?: string;
  name?: string;
  title?: string;
  email?: string;
  phone?: string | null;
  reportsTo?: string | null;
  bgosRole?: string;
  systemRole?: string;
  assignedPipelines?: string[];
  operatingProcedures?: string | null;
  decisionAuthority?: unknown;
  completenessScore?: number;
  nexaFlags?: string[];
};

type PipelineSnapshot = {
  id: string;
  name: string;
  productName?: string;
  stages?: string[];
  slaRules?: Record<string, unknown>;
  visibleTo?: string[];
  color?: string;
};

type SessionSnapshot = {
  id: string;
  companyData: Record<string, unknown>;
  employeeData: EmployeeSnapshot[];
  pipelineData: PipelineSnapshot[];
  operatingRules: unknown[];
  nexaGaps: string[];
  nexaSuggestions: string[];
  completenessScore: number;
  summaryGenerated: boolean;
  summaryText?: string | null;
  selectedPlan?: string | null;
  bdmNotes?: string | null;
  currentStep?: string;
  canSubmit?: boolean;
  submissionBlocked?: string | null;
  completenessBreakdown?: Record<string, number>;
  nexaMessages?: ChatMessage[];
  nexaFlags?: string[];
  challenges?: Record<string, unknown>;
  employees?: EmployeeSnapshot[];
  pipelines?: PipelineSnapshot[];
};

type Lead = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  value?: number | null;
  notes?: string | null;
  location?: string;
  companyType?: string;
  teamSize?: string;
  resumeBanner?: string | null;
  callNotes?: Array<{
    id: string;
    content: string;
    createdAt: string;
    authorName: string;
  }>;
  onboardingSession?: SessionSnapshot | null;
};

type Completeness = {
  score: number;
  breakdown: Record<string, number>;
  blocked: string | null;
  canSubmit: boolean;
  missing: string[];
  warnings: string[];
};

type ChatResponse = {
  message?: string;
  completeness?: Completeness;
  canSubmit?: boolean;
  blocked?: string | null;
  flags?: string[];
  suggestions?: string[];
  step?: string;
  session?: {
    employees?: EmployeeSnapshot[];
    pipelines?: PipelineSnapshot[];
    completenessScore?: number;
    canSubmit?: boolean;
    submissionBlocked?: string | null;
  };
  error?: string;
};

const stepOrder = ["company", "employees", "pipelines", "rules", "review"];

function asString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function asNumber(value: unknown, fallback = 0) {
  return typeof value === "number" ? value : Number(value) || fallback;
}

function scoreColor(score: number) {
  if (score >= 80) return "#22D9A0";
  if (score >= 55) return "#F5A623";
  return "#FF6B6B";
}

function stepIndex(step: string) {
  const index = stepOrder.indexOf(step);
  return index >= 0 ? index + 1 : 1;
}

function employeeName(employee: EmployeeSnapshot) {
  return employee.fullName || employee.name || "Unnamed";
}

function openingMessage(lead: Lead, companyData: Record<string, unknown>) {
  const company = asString(companyData.name, lead.company ?? lead.name);
  const industry = asString(companyData.industry, lead.companyType || "your industry");
  const location = asString(companyData.location, lead.location || "your location");
  return `Hi! I am loading ${company}'s details from the lead record. I can see this is a ${industry} company in ${location}. Let me start collecting what I need to build their custom workspace. First - how many people work at ${company} including the owner?`;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={() => void copy()}
      className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-extrabold text-black"
    >
      <Clipboard className="h-4 w-4" />
      {copied ? "Copied ✓" : "Copy full summary"}
    </button>
  );
}

export function OnboardingWizard({
  lead,
  onComplete,
}: {
  lead: Lead;
  onComplete?: () => void;
}) {
  const initial = lead.onboardingSession;
  const companyData = initial?.companyData ?? {};
  const sessionId = initial?.id ?? "";
  const [messages, setMessages] = useState<ChatMessage[]>(
    initial?.nexaMessages?.length
      ? initial.nexaMessages
      : [{ role: "assistant", content: openingMessage(lead, companyData) }],
  );
  const [input, setInput] = useState("");
  const [currentStep, setCurrentStep] = useState(initial?.currentStep ?? "company");
  const [score, setScore] = useState(initial?.completenessScore ?? 0);
  const [breakdown, setBreakdown] = useState<Record<string, number>>(
    initial?.completenessScore ? { total: initial.completenessScore } : {},
  );
  const [canSubmit, setCanSubmit] = useState(Boolean(initial?.canSubmit));
  const [blocked, setBlocked] = useState(initial?.submissionBlocked ?? null);
  const [employees, setEmployees] = useState<EmployeeSnapshot[]>(
    initial?.employees?.length ? initial.employees : initial?.employeeData ?? [],
  );
  const [pipelines, setPipelines] = useState<PipelineSnapshot[]>(
    initial?.pipelines?.length ? initial.pipelines : initial?.pipelineData ?? [],
  );
  const [flags, setFlags] = useState<string[]>(initial?.nexaFlags ?? initial?.nexaGaps ?? []);
  const [suggestions, setSuggestions] = useState<string[]>(initial?.nexaSuggestions ?? []);
  const [summary, setSummary] = useState(initial?.summaryText ?? "");
  const [summaryJson, setSummaryJson] = useState<unknown>(null);
  const [selectedPlan, setSelectedPlan] = useState(initial?.selectedPlan ?? "GROWTH");
  const [bdmNotes, setBdmNotes] = useState(initial?.bdmNotes ?? "");
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [showPlanSubmit, setShowPlanSubmit] = useState(false);
  const [dataOpen, setDataOpen] = useState(false);
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ company: string; sdeName: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const companyName = asString(companyData.name, lead.company ?? lead.name);
  const expectedEmployees = asNumber(companyData.employeeCount, Number(lead.teamSize) || 0);
  const progressStyle = { width: `${Math.max(0, Math.min(score, 100))}%` };

  const checklist = useMemo(
    () => [
      { label: "Company details", ok: Boolean(breakdown.company && breakdown.company >= 15) },
      { label: "Employee count", ok: employees.length >= expectedEmployees && expectedEmployees > 0 },
      { label: "Employee emails", ok: employees.length > 0 && employees.every((item) => item.email) },
      {
        label: "Reporting lines",
        ok:
          employees.length > 0 &&
          employees.every((item) => item.reportsTo || (item.bgosRole || item.systemRole) === "BOSS"),
      },
      {
        label: "Procedures",
        ok: employees.length > 0 && employees.every((item) => (item.operatingProcedures || "").length >= 30),
      },
      { label: "Pipelines", ok: pipelines.some((item) => (item.stages || []).length >= 3) },
      { label: "Primary challenge", ok: Boolean(initial?.challenges?.primary) || !blocked?.includes("Primary challenge") },
    ],
    [blocked, breakdown.company, employees, expectedEmployees, initial?.challenges, pipelines],
  );

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setError("");
    setMessages((current) => [...current, { role: "user", content: text }]);
    setLoading("chat");

    const response = await fetch(`/api/onboarding/session/${sessionId}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });
    const data = (await response.json().catch(() => ({}))) as ChatResponse;
    setLoading("");

    if (!response.ok || !data.message) {
      setError(data.error ?? "NEXA could not process that message.");
      return;
    }

    setMessages((current) => [...current, { role: "assistant", content: data.message || "" }]);
    setCurrentStep(data.step ?? currentStep);
    setScore(data.completeness?.score ?? data.session?.completenessScore ?? score);
    setBreakdown(data.completeness?.breakdown ?? breakdown);
    setCanSubmit(Boolean(data.canSubmit ?? data.session?.canSubmit));
    setBlocked(data.blocked ?? data.session?.submissionBlocked ?? null);
    setFlags(data.flags ?? flags);
    setSuggestions(data.suggestions ?? suggestions);
    if (data.session?.employees) setEmployees(data.session.employees);
    if (data.session?.pipelines) setPipelines(data.session.pipelines);
  }

  async function generateSummary() {
    setLoading("summary");
    setError("");
    const response = await fetch(`/api/onboarding/session/${sessionId}/generate-summary`, {
      method: "POST",
    });
    const data = (await response.json().catch(() => ({}))) as {
      summary?: { readable?: string; structured?: unknown; score?: number };
      error?: string;
    };
    setLoading("");

    if (!response.ok || !data.summary?.readable) {
      setError(data.error ?? "NEXA could not generate the summary yet.");
      return;
    }

    await new Promise((resolve) => window.setTimeout(resolve, 900));
    setSummary(data.summary.readable);
    setSummaryJson(data.summary.structured);
    setSummaryOpen(true);
  }

  async function submitToSde() {
    setLoading("submit");
    setError("");
    const response = await fetch(`/api/onboarding/session/${sessionId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selectedPlan, bdmNotes }),
    });
    const data = (await response.json().catch(() => ({}))) as {
      sde?: { name?: string };
      error?: string;
    };
    setLoading("");

    if (!response.ok) {
      setError(data.error ?? "Could not submit to SDE.");
      return;
    }

    setSummaryOpen(false);
    setSuccess({ company: companyName, sdeName: data.sde?.name ?? "Your SDE" });
    onComplete?.();
  }

  const dataPanel = (
    <div className="space-y-5">
      <section>
        <h2 className="font-heading text-sm font-bold text-white">Team</h2>
        <div className="mt-3 space-y-2">
          {employees.length ? (
            employees.map((employee) => {
              const hasWarning = !employee.email || !employee.reportsTo || (employee.operatingProcedures || "").length < 30;
              return (
                <div key={employee.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-white">{employeeName(employee)}</p>
                      <p className="mt-1 text-xs text-zinc-500">{employee.title || "Role pending"}</p>
                    </div>
                    <span className={hasWarning ? "text-[#F5A623]" : "text-[#22D9A0]"}>
                      {hasWarning ? "⚠" : "✓"}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-zinc-500">No employees collected yet.</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="font-heading text-sm font-bold text-white">Pipelines</h2>
        <div className="mt-3 space-y-2">
          {pipelines.length ? (
            pipelines.map((pipeline) => (
              <div key={pipeline.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-sm font-bold text-white">{pipeline.name}</p>
                <p className="mt-1 text-xs text-zinc-500">{pipeline.stages?.length ?? 0} stages</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-zinc-500">No pipelines collected yet.</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="font-heading text-sm font-bold text-white">Checklist</h2>
        <div className="mt-3 space-y-2">
          {checklist.map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-sm">
              <span className={item.ok ? "text-[#22D9A0]" : "text-[#FF6B6B]"}>
                {item.ok ? "✓" : "×"}
              </span>
              <span className="text-zinc-300">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {flags.length || suggestions.length ? (
        <section className="rounded-xl border border-[#F5A623]/20 bg-[#F5A623]/10 p-3">
          <h2 className="font-heading text-sm font-bold text-[#F5A623]">NEXA notes</h2>
          {[...flags, ...suggestions].slice(0, 6).map((item) => (
            <p key={item} className="mt-2 text-xs leading-5 text-amber-100">
              {item}
            </p>
          ))}
        </section>
      ) : null}
    </div>
  );

  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#070709] p-6 text-white">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#22D9A0] text-black">
            <Check className="h-10 w-10" />
          </div>
          <h1 className="mt-6 font-heading text-3xl font-bold">Brief submitted to SDE.</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            {success.sdeName} will build {success.company}&apos;s workspace within 24 hours.
          </p>
          <Link
            href="/bdm/onboarding"
            className="mt-7 inline-flex rounded-xl bg-[#22D9A0] px-5 py-3 text-sm font-bold text-black"
          >
            Back to leads
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-[#070709] text-white">
      <header className="border-b border-white/10 bg-[#0d0d12] px-4 py-4 lg:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#7C6FFF]">Onboarding</p>
            <h1 className="mt-1 font-heading text-xl font-bold">Onboarding - {companyName}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right text-xs text-zinc-500">
              <p>Step {stepIndex(currentStep)} of 7</p>
              <p className="mt-1 capitalize">{currentStep}</p>
            </div>
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-extrabold text-black ${score >= 80 ? "animate-pulse" : ""}`}
              style={{
                background: `conic-gradient(${scoreColor(score)} ${score}%, rgba(255,255,255,0.12) 0)`,
              }}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0d0d12] text-white">
                {score}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ ...progressStyle, backgroundColor: scoreColor(score) }}
          />
        </div>
      </header>

      {error ? (
        <div className="border-b border-red-500/20 bg-red-500/10 px-6 py-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      <main className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,3fr)_minmax(320px,2fr)]">
        <section className="flex min-h-0 flex-col border-white/10 lg:border-r">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-5 lg:px-6">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[82%] ${message.role === "assistant" ? "flex gap-3" : ""}`}>
                  {message.role === "assistant" ? (
                    <div className="relative mt-1 h-9 w-9 shrink-0 rounded-full bg-[#7C6FFF]">
                      <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-[#070709] bg-[#22D9A0]" />
                    </div>
                  ) : null}
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
                      message.role === "assistant"
                        ? "bg-[#7C6FFF] text-white"
                        : "bg-[#22D9A0] text-black"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              </div>
            ))}
            {loading === "chat" ? (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-[#7C6FFF] px-4 py-3 text-sm">NEXA is thinking...</div>
              </div>
            ) : null}
            <div ref={scrollRef} />
          </div>

          <div className="border-t border-white/10 p-4">
            <div className="mb-3 flex items-center justify-between gap-3 lg:hidden">
              <button
                type="button"
                onClick={() => setDataOpen(true)}
                className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-zinc-300"
              >
                View collected data
              </button>
              {canSubmit || score >= 80 ? (
                <button
                  type="button"
                  onClick={() => void generateSummary()}
                  className="rounded-xl bg-[#22D9A0] px-3 py-2 text-xs font-bold text-black"
                >
                  Generate summary →
                </button>
              ) : null}
            </div>
            <form onSubmit={(event) => void sendMessage(event)} className="flex gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Tell NEXA what you learned..."
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#13131c] px-4 py-3 text-sm outline-none focus:border-[#22D9A0]"
              />
              <button
                type="submit"
                disabled={loading === "chat"}
                className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#22D9A0] text-black disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </section>

        <aside className="hidden min-h-0 overflow-y-auto bg-[#0d0d12] p-5 lg:block">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="font-heading text-lg font-bold">Collected data</h2>
            {canSubmit || score >= 80 ? (
              <button
                type="button"
                onClick={() => void generateSummary()}
                disabled={loading === "summary"}
                className="rounded-xl bg-[#22D9A0] px-4 py-2 text-sm font-bold text-black"
              >
                {loading === "summary" ? "NEXA is preparing..." : "Generate summary →"}
              </button>
            ) : null}
          </div>
          {blocked ? <p className="mb-4 rounded-xl border border-[#F5A623]/20 bg-[#F5A623]/10 p-3 text-xs leading-5 text-amber-100">{blocked}</p> : null}
          {dataPanel}
        </aside>
      </main>

      {dataOpen ? (
        <div className="fixed inset-0 z-50 bg-black/60 lg:hidden">
          <div className="absolute bottom-0 max-h-[82vh] w-full overflow-y-auto rounded-t-2xl border border-white/10 bg-[#0d0d12] p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold">Collected data</h2>
              <button type="button" onClick={() => setDataOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            {dataPanel}
          </div>
        </div>
      ) : null}

      {summaryOpen ? (
        <div className="fixed inset-0 z-[80] bg-[#070709] text-white">
          <div className="flex h-full flex-col">
            <header className="flex items-center justify-between gap-3 border-b border-white/10 p-4">
              <h2 className="font-heading text-lg font-bold">NEXA summary</h2>
              <div className="flex items-center gap-2">
                <CopyButton text={summary} />
                <button type="button" onClick={() => setSummaryOpen(false)} className="rounded-xl border border-white/10 p-2">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <pre className="mx-auto max-w-5xl whitespace-pre-wrap rounded-xl border border-white/10 bg-[#0d0d12] p-5 text-sm leading-6 text-zinc-200">
                {summary}
                {summaryJson ? `\n\n${JSON.stringify(summaryJson, null, 2)}` : ""}
              </pre>
            </div>
            <footer className="border-t border-white/10 p-4">
              {showPlanSubmit ? (
                <div className="mx-auto max-w-5xl space-y-4">
                  <div className="grid gap-3 md:grid-cols-4">
                    {PLAN_ORDER.map((planId) => {
                      const plan = PLANS[planId];
                      return (
                        <button
                          key={planId}
                          type="button"
                          onClick={() => setSelectedPlan(planId)}
                          className={`rounded-xl border p-4 text-left ${
                            selectedPlan === planId
                              ? "border-[#22D9A0] bg-[#22D9A0]/10"
                              : "border-white/10 bg-[#13131c]"
                          }`}
                        >
                          <p className="font-heading text-sm font-bold">{plan.name}</p>
                          <p className="mt-1 text-sm text-[#22D9A0]">{plan.priceDisplay}{plan.period}</p>
                        </button>
                      );
                    })}
                  </div>
                  <textarea
                    value={bdmNotes}
                    onChange={(event) => setBdmNotes(event.target.value)}
                    placeholder="BDM notes for SDE..."
                    className="min-h-24 w-full rounded-xl border border-white/10 bg-[#13131c] px-4 py-3 text-sm outline-none focus:border-[#22D9A0]"
                  />
                  <button
                    type="button"
                    onClick={() => void submitToSde()}
                    disabled={loading === "submit"}
                    className="w-full rounded-xl bg-[#22D9A0] px-5 py-4 text-sm font-extrabold text-black"
                  >
                    {loading === "submit" ? "Submitting..." : "Submit to SDE →"}
                  </button>
                </div>
              ) : (
                <div className="mx-auto flex max-w-5xl justify-end">
                  <button
                    type="button"
                    onClick={() => setShowPlanSubmit(true)}
                    className="rounded-xl bg-[#22D9A0] px-5 py-3 text-sm font-extrabold text-black"
                  >
                    Submit to SDE →
                  </button>
                </div>
              )}
            </footer>
          </div>
        </div>
      ) : null}
    </div>
  );
}
