"use client";

import { useMemo, useState } from "react";
import { Copy, ExternalLink, Send } from "lucide-react";

type Employee = {
  id: string;
  name: string;
  title: string;
  email: string;
  reportsTo?: string | null;
  systemRole: string;
  assignedPipelines: unknown;
};

type Clarification = {
  id: string;
  question: string;
  context?: string | null;
  answer?: string | null;
  status: string;
  createdAt: string | Date;
  answeredAt?: string | Date | null;
  raiser?: { name: string; email: string } | null;
  answerer?: { name: string; email: string } | null;
};

type Pipeline = {
  id?: string;
  name?: string;
  productName?: string;
  stages?: string[];
  color?: string;
  visibleTo?: string[];
};

type BuildSession = {
  id: string;
  status: string;
  summaryText?: string | null;
  summaryJson?: unknown;
  selectedPlan?: string | null;
  companyData: Record<string, unknown>;
  pipelineData: Pipeline[];
  employees: Employee[];
  clarifications: Clarification[];
};

const checklistItems = [
  "Company and business created in database",
  "Pipelines configured",
  "Employee accounts created",
  "NEXA configured",
  "Automations set up",
  "Everything tested as boss",
];

function asStrings(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function timeLabel(value: string | Date | null | undefined) {
  if (!value) return "";
  return new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

function statusClass(status: string) {
  if (status === "answered" || status === "resolved") return "border-[#22D9A0]/30 bg-[#22D9A0]/10";
  return "border-[#F5A623]/30 bg-[#F5A623]/10";
}

export function BuildDashboard({ session }: { session: BuildSession }) {
  const [copied, setCopied] = useState(false);
  const [question, setQuestion] = useState("");
  const [context, setContext] = useState("");
  const [clarifications, setClarifications] = useState(session.clarifications);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState("");
  const [success, setSuccess] = useState<{ previewUrl: string; businessId: string } | null>(null);
  const [error, setError] = useState("");

  const summaryText = session.summaryText ?? "No readable summary generated yet.";
  const fullSummary = `${summaryText}\n\nSTRUCTURED JSON\n${JSON.stringify(session.summaryJson ?? {}, null, 2)}`;
  const progress = Math.round((Object.values(checked).filter(Boolean).length / checklistItems.length) * 100);
  const allChecked = progress === 100;
  const companyName = String(session.companyData?.name ?? "Client workspace");

  const hierarchy = useMemo(() => {
    const root = session.employees.find((employee) => !employee.reportsTo || /owner|boss/i.test(employee.reportsTo));
    const top = root ?? session.employees[0];
    const children = session.employees.filter((employee) => employee.id !== top?.id);
    return { top, children };
  }, [session.employees]);

  async function copySummary() {
    await navigator.clipboard.writeText(fullSummary);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  async function askBdm() {
    if (!question.trim()) return;
    setLoading("clarification");
    setError("");
    const response = await fetch(`/api/onboarding/session/${session.id}/clarification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, context }),
    });
    const data = (await response.json().catch(() => ({}))) as { clarification?: Clarification; error?: string };
    setLoading("");
    if (!response.ok || !data.clarification) {
      setError(data.error ?? "Could not send clarification.");
      return;
    }
    setClarifications([data.clarification, ...clarifications]);
    setQuestion("");
    setContext("");
  }

  async function approve() {
    if (!allChecked) return;
    if (!window.confirm("This will send the workspace access email to the client boss and notify the BDM. Make sure you have tested everything.")) return;
    setLoading("approve");
    setError("");
    const response = await fetch(`/api/onboarding/session/${session.id}/approve`, { method: "POST" });
    const data = (await response.json().catch(() => ({}))) as { previewUrl?: string; businessId?: string; error?: string };
    setLoading("");
    if (!response.ok || !data.previewUrl || !data.businessId) {
      setError(data.error ?? "Could not approve workspace.");
      return;
    }
    setSuccess({ previewUrl: data.previewUrl, businessId: data.businessId });
  }

  return (
    <div className="space-y-6">
      {error ? <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">{error}</div> : null}
      {success ? (
        <div className="rounded-2xl border border-[#22D9A0]/30 bg-[#22D9A0]/10 p-5">
          <h2 className="font-heading text-lg font-bold text-[#22D9A0]">Workspace approved</h2>
          <p className="mt-2 text-sm text-emerald-50">Preview link generated for {companyName}.</p>
          <a href={success.previewUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-xl bg-[#22D9A0] px-4 py-3 text-sm font-bold text-black">
            Open preview link
          </a>
        </div>
      ) : null}

      <section className="rounded-2xl border border-white/10 bg-[#13131c] p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-heading text-xl font-bold">Onboarding summary</h2>
            <p className="mt-1 text-sm text-zinc-500">{companyName} · {session.selectedPlan ?? "Plan pending"}</p>
          </div>
          <button onClick={() => void copySummary()} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-zinc-200">
            <Copy className="h-4 w-4" /> {copied ? "Copied ✓" : "Copy full summary"}
          </button>
        </div>
        <pre className="mt-5 max-h-[480px] overflow-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-[#0d0d12] p-5 font-mono text-sm leading-6 text-zinc-300">
          {summaryText}
        </pre>
        <div className="mt-5 rounded-xl border border-[#7C6FFF]/25 bg-[#7C6FFF]/10 p-5 text-sm text-[#e7e4ff]">
          <p className="font-bold">Next step:</p>
          <ol className="mt-3 list-decimal space-y-2 pl-5">
            <li>Copy the summary above</li>
            <li>Paste it into Claude at claude.ai</li>
            <li>Discuss the architecture and get the build plan</li>
            <li>Come back here and paste the Codex prompt</li>
            <li>Execute in VS Code</li>
            <li>Test and approve</li>
          </ol>
          <a href="https://claude.ai" target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-black">
            Open claude.ai <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#13131c] p-6">
        <h2 className="font-heading text-xl font-bold">Employee org chart</h2>
        <div className="mt-6 overflow-x-auto rounded-xl bg-[#0d0d12] p-6">
          <svg width="900" height="280" className="min-w-[900px]">
            {hierarchy.top ? (
              <>
                <foreignObject x="350" y="10" width="200" height="95">
                  <PersonCard employee={hierarchy.top} />
                </foreignObject>
                {hierarchy.children.map((employee, index) => {
                  const x = 40 + index * 210;
                  return (
                    <g key={employee.id}>
                      <line x1="450" y1="105" x2={x + 100} y2="155" stroke="rgba(255,255,255,0.22)" strokeWidth="2" />
                      <foreignObject x={x} y="155" width="200" height="105">
                        <PersonCard employee={employee} />
                      </foreignObject>
                    </g>
                  );
                })}
              </>
            ) : null}
          </svg>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#13131c] p-6">
        <h2 className="font-heading text-xl font-bold">Pipeline preview</h2>
        <div className="mt-5 space-y-5">
          {session.pipelineData.map((pipeline, index) => {
            const stages = pipeline.stages?.length ? pipeline.stages : ["New", "Contacted", "Won"];
            const color = pipeline.color ?? "#7C6FFF";
            return (
              <div key={pipeline.id ?? index} className="rounded-xl border border-white/10 bg-[#0d0d12] p-4">
                <h3 className="font-heading text-base font-bold">{pipeline.name ?? pipeline.productName ?? `Pipeline ${index + 1}`}</h3>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {stages.map((stage, stageIndex) => (
                    <div key={`${stage}-${stageIndex}`} className="flex items-center gap-2">
                      <span className="rounded-full px-3 py-1 text-xs font-bold text-black" style={{ backgroundColor: color }}>{stage}</span>
                      {stageIndex < stages.length - 1 ? <span className="text-zinc-600">→</span> : null}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#13131c] p-6">
        <h2 className="font-heading text-xl font-bold">Clarifications</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]">
          <input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask the BDM a question..." className="rounded-xl border border-white/10 bg-[#0d0d12] px-4 py-3 outline-none focus:border-[#22D9A0]" />
          <button onClick={() => void askBdm()} disabled={loading === "clarification"} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#22D9A0] px-4 py-3 text-sm font-bold text-black">
            <Send className="h-4 w-4" /> Ask BDM
          </button>
        </div>
        <textarea value={context} onChange={(event) => setContext(event.target.value)} placeholder="Optional context..." className="mt-3 min-h-20 w-full rounded-xl border border-white/10 bg-[#0d0d12] px-4 py-3 outline-none focus:border-[#22D9A0]" />
        <div className="mt-5 space-y-3">
          {clarifications.length ? clarifications.map((item) => (
            <div key={item.id} className={`rounded-xl border p-4 ${statusClass(item.status)}`}>
              <div className="flex justify-between gap-3">
                <p className="text-sm font-bold text-white">{item.question}</p>
                <span className="text-xs text-zinc-500">{timeLabel(item.createdAt)}</span>
              </div>
              {item.context ? <p className="mt-2 text-sm text-zinc-400">{item.context}</p> : null}
              {item.answer ? (
                <div className="mt-3 rounded-lg bg-black/20 p-3 text-sm text-emerald-100">
                  <p className="font-bold">Answer</p>
                  <p className="mt-1">{item.answer}</p>
                  <button className="mt-3 rounded-lg border border-[#22D9A0]/30 px-3 py-1 text-xs font-bold text-[#22D9A0]">Mark as resolved</button>
                </div>
              ) : <p className="mt-3 text-xs font-bold text-[#F5A623]">Pending clarification</p>}
            </div>
          )) : <p className="text-sm text-zinc-500">No clarifications yet.</p>}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#13131c] p-6">
        <h2 className="font-heading text-xl font-bold">Build status</h2>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-[#22D9A0] transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2 text-sm text-zinc-500">{progress}% complete</p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {checklistItems.map((item) => (
            <label key={item} className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0d0d12] p-4 text-sm text-zinc-300">
              <input type="checkbox" checked={Boolean(checked[item])} onChange={(event) => setChecked({ ...checked, [item]: event.target.checked })} className="accent-[#22D9A0]" />
              {item}
            </label>
          ))}
        </div>
        <button onClick={() => void approve()} disabled={!allChecked || loading === "approve"} className="mt-6 w-full rounded-xl bg-[#22D9A0] px-5 py-4 text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-40">
          {loading === "approve" ? "Approving..." : "Approve and send to BDM for delivery"}
        </button>
      </section>
    </div>
  );
}

function PersonCard({ employee }: { employee: Employee }) {
  return (
    <div className="h-full rounded-xl border border-white/10 bg-[#15151d] p-3 text-white">
      <p className="truncate text-sm font-bold">{employee.name}</p>
      <p className="mt-1 truncate text-xs text-zinc-500">{employee.title}</p>
      <span className="mt-2 inline-flex rounded-full bg-[#7C6FFF]/15 px-2 py-0.5 text-[10px] font-bold text-[#c6c1ff]">{employee.systemRole}</span>
      <div className="mt-2 flex flex-wrap gap-1">
        {asStrings(employee.assignedPipelines).slice(0, 2).map((item) => (
          <span key={item} className="rounded-full bg-[#22D9A0]/10 px-2 py-0.5 text-[10px] text-[#22D9A0]">{item}</span>
        ))}
      </div>
    </div>
  );
}
