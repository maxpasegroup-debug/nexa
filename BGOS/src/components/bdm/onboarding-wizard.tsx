"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUp, ChevronRight, Plus, Trash2, X } from "lucide-react";

type Lead = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  value?: number;
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

type SessionSnapshot = {
  id: string;
  companyData: Record<string, unknown>;
  employeeData: EmployeeDraft[];
  pipelineData: PipelineDraft[];
  operatingRules: RuleDraft[];
  nexaGaps: string[];
  nexaSuggestions: Suggestion[];
  completenessScore: number;
  summaryGenerated: boolean;
  summaryText?: string | null;
  selectedPlan?: string | null;
  bdmNotes?: string | null;
};

type EmployeeDraft = {
  id?: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  reportsTo: string;
  systemRole: string;
  assignedPipelines: string[];
  operatingProcedures: string;
  decisionAuthority: string;
  dailyTasks: string[];
  completeness?: number;
  nexaFlags?: string[];
};

type PipelineDraft = {
  id: string;
  name: string;
  productName: string;
  color: string;
  stages: string[];
  slaDays: Record<string, number>;
  visibleTo: string[];
};

type RuleDraft = {
  id: string;
  type: string;
  text: string;
};

type Suggestion = {
  type: string;
  suggestion: string;
  reason: string;
};

type Completeness = {
  score: number;
  checks: Array<{ label: string; status: "ok" | "missing" | "warning"; message: string }>;
  canSubmit: boolean;
};

const industries = [
  "Solar/Renewable Energy",
  "Electronics/Devices",
  "Real Estate",
  "Clinic/Hospital",
  "Coaching/Education",
  "Digital Agency",
  "Retail/Distribution",
  "Construction",
  "Manufacturing",
  "Service Industry",
  "Other",
];

const revenueRanges = ["Below ₹25L", "₹25L-₹1Cr", "₹1Cr-₹5Cr", "₹5Cr-₹20Cr", "₹20Cr+"];
const toolSuggestions = ["WhatsApp", "Excel", "Tally", "Google Sheets", "Zoho", "IndiaMART"];
const colors = ["#7C6FFF", "#22D9A0", "#F5A623", "#FF6B6B", "#38BDF8", "#A855F7", "#F97316", "#14B8A6"];

const stageSuggestions: Record<string, string[]> = {
  "Solar/Renewable Energy": ["Enquiry", "Site Survey", "Quotation", "Approval", "Installation", "Payment"],
  "Electronics/Devices": ["Dealer Enquiry", "Demo", "Order Placed", "Dispatch", "Delivery", "Payment"],
  "Real Estate": ["Enquiry", "Site Visit", "Negotiation", "Token", "Agreement", "Registration"],
  "Clinic/Hospital": ["New Patient", "Appointment", "Consultation", "Prescription", "Follow-up", "Regular"],
};

const planCards = [
  { id: "STARTER", name: "Starter", price: "₹799", commission: "₹400", value: "Basic CRM and NEXA tips" },
  { id: "GROWTH", name: "Growth", price: "₹2,499", commission: "₹1,500", value: "Team CRM and automations" },
  { id: "SCALE", name: "Scale", price: "₹6,999", commission: "₹3,500", value: "Custom pipelines and advanced setup" },
  { id: "ENTERPRISE", name: "Enterprise", price: "Custom", commission: "₹7,000", value: "Deep customization and priority support" },
];

const steps = ["Company", "Team", "Pipelines", "Rules", "NEXA review"];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0) {
  return typeof value === "number" ? value : fallback;
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function emptyEmployee(): EmployeeDraft {
  return {
    name: "",
    title: "",
    email: "",
    phone: "",
    reportsTo: "Owner/Boss",
    systemRole: "Sales",
    assignedPipelines: [],
    operatingProcedures: "",
    decisionAuthority: "",
    dailyTasks: [],
    completeness: 0,
    nexaFlags: [],
  };
}

function suggestedStages(industry: string) {
  return stageSuggestions[industry] ?? ["New", "Contacted", "Demo", "Proposal", "Won", "Lost"];
}

function employeePlaceholder(title: string) {
  if (/sales/i.test(title)) {
    return "e.g. Makes 20 calls daily, conducts product demos, sends quotations, follows up every 48 hours, reports daily call log to manager...";
  }
  if (/manager/i.test(title)) {
    return "e.g. Reviews team pipeline every morning, approves discounts, assigns leads, checks reports, escalates blocked work to owner...";
  }
  if (/technical|engineer|sde/i.test(title)) {
    return "e.g. Handles setup requests, resolves bugs, updates task status, checks integrations, reports blockers before end of day...";
  }
  return "Describe what this person does daily, what they own, who they report to, and when NEXA should alert them.";
}

function completionClass(score: number) {
  if (score >= 90) return "bg-[#22D9A0]";
  if (score >= 70) return "bg-[#F5A623]";
  return "bg-[#FF6B6B]";
}

function buildPipeline(productName: string, industry: string): PipelineDraft {
  const stages = suggestedStages(industry);
  return {
    id: uid(),
    name: `${productName} Pipeline`,
    productName,
    color: colors[0],
    stages,
    slaDays: Object.fromEntries(stages.map((stage) => [stage, 2])),
    visibleTo: [],
  };
}

export function OnboardingWizard({
  lead,
  onComplete,
}: {
  lead: Lead;
  onComplete?: () => void;
}) {
  const initial = lead.onboardingSession;
  const [step, setStep] = useState(0);
  const [sessionId] = useState(initial?.id ?? "");
  const [companyName, setCompanyName] = useState(
    asString(initial?.companyData?.name, lead.company ?? lead.name),
  );
  const [industry, setIndustry] = useState(asString(initial?.companyData?.industry, ""));
  const [otherIndustry, setOtherIndustry] = useState("");
  const [location, setLocation] = useState(asString(initial?.companyData?.location, ""));
  const [employeeCount, setEmployeeCount] = useState(String(asNumber(initial?.companyData?.employeeCount, 1)));
  const [companyDescription, setCompanyDescription] = useState(
    asString(initial?.companyData?.description, lead.callNotes?.map((note) => note.content).join("\n\n") ?? ""),
  );
  const [callNoteInsight, setCallNoteInsight] = useState(
    asString(
      initial?.companyData?.callNoteInsight,
      lead.callNotes?.length
        ? "You mentioned operational pains in the call notes. I have added these to their challenges."
        : "",
    ),
  );
  const [revenueRange, setRevenueRange] = useState(asString(initial?.companyData?.revenueRange, ""));
  const [toolInput, setToolInput] = useState("");
  const [tools, setTools] = useState<string[]>(asArray<string>(initial?.companyData?.tools));
  const [productInput, setProductInput] = useState("");
  const [products, setProducts] = useState<string[]>(
    asArray<string>(initial?.companyData?.products).length
      ? asArray<string>(initial?.companyData?.products)
      : lead.company
        ? [lead.company]
        : [],
  );
  const [employees, setEmployees] = useState<EmployeeDraft[]>(
    initial?.employeeData?.length ? initial.employeeData : [{ ...emptyEmployee(), name: lead.name, email: lead.email ?? "", phone: lead.phone ?? "", title: "Owner" }],
  );
  const [pipelines, setPipelines] = useState<PipelineDraft[]>(
    initial?.pipelineData?.length
      ? initial.pipelineData
      : products.map((product) => buildPipeline(product, industry)),
  );
  const [rules, setRules] = useState<RuleDraft[]>(initial?.operatingRules?.length ? initial.operatingRules : []);
  const [newRule, setNewRule] = useState({ type: "Approval", text: "" });
  const [analysis, setAnalysis] = useState<Completeness | null>(null);
  const [gaps, setGaps] = useState<string[]>(initial?.nexaGaps ?? []);
  const [gapAnswers, setGapAnswers] = useState<Record<string, string>>({});
  const [activeGap, setActiveGap] = useState(0);
  const [suggestions, setSuggestions] = useState<Suggestion[]>(initial?.nexaSuggestions ?? []);
  const [acceptedSuggestions, setAcceptedSuggestions] = useState<string[]>([]);
  const [summary, setSummary] = useState(initial?.summaryText ?? "");
  const [selectedPlan, setSelectedPlan] = useState(initial?.selectedPlan ?? "GROWTH");
  const [bdmNotes, setBdmNotes] = useState(initial?.bdmNotes ?? "");
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");

  const effectiveIndustry = industry === "Other" ? otherIndustry : industry;
  const canGenerateSummary = Boolean(analysis && analysis.score > 80);

  useEffect(() => {
    setPipelines((current) => {
      const known = new Set(current.map((pipeline) => pipeline.productName));
      const additions = products
        .filter((product) => !known.has(product))
        .map((product) => buildPipeline(product, effectiveIndustry));
      return additions.length ? [...current, ...additions] : current;
    });
  }, [effectiveIndustry, products]);

  async function saveCompany() {
    setLoading("company");
    setError("");
    const response = await fetch(`/api/onboarding/session/${sessionId}/company`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyData: {
          name: companyName,
          industry: effectiveIndustry,
          location,
          employeeCount: Number(employeeCount) || 0,
          description: companyDescription,
          callNotes: lead.callNotes?.map((note) => note.content).join("\n\n") ?? "",
          callNoteInsight,
          revenueRange,
          tools,
          products,
          contactName: lead.name,
          contactEmail: lead.email,
          contactPhone: lead.phone,
        },
      }),
    });
    setLoading("");
    if (!response.ok) {
      setError("Could not save company details.");
      return false;
    }
    return true;
  }

  function addTag(value: string, list: string[], setList: (items: string[]) => void) {
    const item = value.trim();
    if (!item || list.includes(item)) return;
    setList([...list, item]);
  }

  async function checkEmployee(index: number) {
    const employee = employees[index];
    setLoading(`employee-${index}`);
    const method = employee.id ? "PATCH" : "POST";
    const response = await fetch(`/api/onboarding/session/${sessionId}/employee`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...employee,
        employeeId: employee.id,
        decisionAuthority: employee.decisionAuthority
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      }),
    });
    const data = (await response.json().catch(() => ({}))) as {
      employee?: EmployeeDraft & { id: string; completeness: number; nexaFlags: string[] };
      flags?: string[];
      completenessScore?: number;
      error?: string;
    };
    setLoading("");

    if (!response.ok || !data.employee) {
      setError(data.error ?? "Could not check employee completeness.");
      return;
    }

    setEmployees((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              id: data.employee!.id,
              completeness: data.completenessScore ?? data.employee!.completeness,
              nexaFlags: data.flags ?? data.employee!.nexaFlags ?? [],
            }
          : item,
      ),
    );
  }

  async function savePipelines() {
    setLoading("pipelines");
    setError("");
    for (const pipeline of pipelines) {
      const response = await fetch(`/api/onboarding/session/${sessionId}/pipeline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pipeline),
      });
      if (!response.ok) {
        setLoading("");
        setError("Could not save one or more pipelines.");
        return false;
      }
    }
    setLoading("");
    return true;
  }

  async function saveRules() {
    setLoading("rules");
    setError("");
    const response = await fetch(`/api/onboarding/session/${sessionId}/company`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyData: {
          name: companyName,
          industry: effectiveIndustry,
          location,
          employeeCount: Number(employeeCount) || 0,
          description: companyDescription,
          callNotes: lead.callNotes?.map((note) => note.content).join("\n\n") ?? "",
          callNoteInsight,
          revenueRange,
          tools,
          products,
          operatingRules: rules,
        },
      }),
    });
    await fetch(`/api/onboarding/session/${sessionId}/analyze`, { method: "POST" }).catch(() => null);
    setLoading("");
    if (!response.ok) {
      setError("Could not save rules.");
      return false;
    }
    return true;
  }

  async function runAnalysis() {
    setLoading("analysis");
    setError("");
    const response = await fetch(`/api/onboarding/session/${sessionId}/analyze`, { method: "POST" });
    const data = (await response.json().catch(() => ({}))) as {
      completeness?: Completeness;
      gaps?: string[];
      suggestions?: Suggestion[];
      error?: string;
    };
    setLoading("");
    if (!response.ok || !data.completeness) {
      setError(data.error ?? "NEXA could not analyze this session.");
      return;
    }
    setAnalysis(data.completeness);
    setGaps(data.gaps ?? []);
    setSuggestions(data.suggestions ?? []);
  }

  async function generateSummary() {
    setLoading("summary");
    setError("");
    const response = await fetch(`/api/onboarding/session/${sessionId}/generate-summary`, { method: "POST" });
    const data = (await response.json().catch(() => ({}))) as {
      summary?: { readable: string; recommendedPlan?: string };
      error?: string;
    };
    setLoading("");
    if (!response.ok || !data.summary) {
      setError(data.error ?? "Could not generate summary.");
      return;
    }
    setSummary(data.summary.readable);
    if (data.summary.recommendedPlan) setSelectedPlan(data.summary.recommendedPlan);
  }

  async function submitToSde() {
    setLoading("submit");
    setError("");
    const response = await fetch(`/api/onboarding/session/${sessionId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selectedPlan, bdmNotes }),
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    setLoading("");
    if (!response.ok) {
      setError(data.error ?? "Could not submit to SDE.");
      return;
    }
    if (onComplete) {
      onComplete();
      return;
    }
    window.location.href = "/bdm/onboarding";
  }

  function nextStep() {
    setStep((current) => Math.min(steps.length - 1, current + 1));
  }

  const suggestedRules = [
    `All leads must be contacted within 2 hours by ${employees.find((employee) => /sales/i.test(employee.title))?.name || "Sales"}.`,
    `Quotes above ₹50,000 need ${employees[0]?.name || "Owner"} approval.`,
    `Daily report sent to ${employees[0]?.name || "Owner"} by 7 PM.`,
  ];

  return (
    <div className="min-h-screen bg-[#070709] text-white">
      <div className="sticky top-0 z-30 border-b border-white/10 bg-[#070709]/95 px-6 py-5 backdrop-blur">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[#22D9A0]">BDM onboarding wizard</p>
              <h1 className="mt-2 font-heading text-2xl font-bold">{companyName || lead.name}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/bdm/leads" className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold text-zinc-300 transition hover:text-white">
                Back to lead
              </Link>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-400">
                Session {sessionId.slice(0, 8)}
              </span>
            </div>
          </div>
          <div className="mt-5 grid gap-2 md:grid-cols-5">
            {steps.map((label, index) => (
              <button
                key={label}
                type="button"
                onClick={() => setStep(index)}
                className={`rounded-full px-3 py-2 text-xs font-bold ${
                  index <= step ? "bg-[#22D9A0] text-black" : "bg-white/5 text-zinc-500"
                }`}
              >
                {index + 1}. {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {lead.resumeBanner ? (
          <div className="mb-5 rounded-2xl border border-[#7C6FFF]/30 bg-[#7C6FFF]/10 p-4 text-sm text-[#dedaff]">
            {lead.resumeBanner}
          </div>
        ) : null}
        {error ? <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">{error}</div> : null}

        {step === 0 ? (
          <section className="rounded-2xl border border-white/10 bg-[#13131c] p-6">
            <h2 className="font-heading text-xl font-bold">Company basics</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="text-sm text-zinc-300">Company full name<input value={companyName} onChange={(event) => setCompanyName(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#0d0d12] px-4 py-3 text-white outline-none focus:border-[#22D9A0]" /></label>
              <label className="text-sm text-zinc-300">Industry<select value={industry} onChange={(event) => setIndustry(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#0d0d12] px-4 py-3 text-white outline-none focus:border-[#22D9A0]"><option value="">Select industry</option>{industries.map((item) => <option key={item}>{item}</option>)}</select></label>
              {industry === "Other" ? <label className="text-sm text-zinc-300">Other industry<input value={otherIndustry} onChange={(event) => setOtherIndustry(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#0d0d12] px-4 py-3 text-white outline-none focus:border-[#22D9A0]" /></label> : null}
              <label className="text-sm text-zinc-300">Location<input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="City" className="mt-2 w-full rounded-xl border border-white/10 bg-[#0d0d12] px-4 py-3 text-white outline-none focus:border-[#22D9A0]" /></label>
              <label className="text-sm text-zinc-300">Total employees<input type="number" value={employeeCount} onChange={(event) => setEmployeeCount(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#0d0d12] px-4 py-3 text-white outline-none focus:border-[#22D9A0]" /></label>
              <label className="text-sm text-zinc-300">Annual revenue range<select value={revenueRange} onChange={(event) => setRevenueRange(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#0d0d12] px-4 py-3 text-white outline-none focus:border-[#22D9A0]"><option value="">Optional</option>{revenueRanges.map((item) => <option key={item}>{item}</option>)}</select></label>
            </div>
            <div className="mt-5 rounded-2xl border border-[#22D9A0]/20 bg-[#22D9A0]/10 p-4 text-sm text-emerald-50">
              I have read your call notes. I will use them to ask better questions.
            </div>
            <label className="mt-5 block text-sm text-zinc-300">
              Company description from call notes
              <textarea value={companyDescription} onChange={(event) => setCompanyDescription(event.target.value)} className="mt-2 min-h-32 w-full rounded-xl border border-white/10 bg-[#0d0d12] px-4 py-3 text-white outline-none focus:border-[#22D9A0]" />
            </label>
            <div className="mt-5">
              <p className="text-sm text-zinc-300">Products/services</p>
              <div className="mt-2 flex gap-2"><input value={productInput} onChange={(event) => setProductInput(event.target.value)} placeholder="Solar panels" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#0d0d12] px-4 py-3 text-white outline-none focus:border-[#22D9A0]" /><button onClick={() => { addTag(productInput, products, setProducts); setProductInput(""); }} className="rounded-xl bg-[#22D9A0] px-4 text-sm font-bold text-black">Add</button></div>
              <div className="mt-3 flex flex-wrap gap-2">{products.map((item) => <button key={item} onClick={() => setProducts(products.filter((product) => product !== item))} className="rounded-full bg-[#22D9A0]/10 px-3 py-1 text-xs font-bold text-[#22D9A0]">{item} <X className="inline h-3 w-3" /></button>)}</div>
            </div>
            <div className="mt-5">
              <p className="text-sm text-zinc-300">Current tools</p>
              <div className="mt-2 flex gap-2"><input value={toolInput} onChange={(event) => setToolInput(event.target.value)} placeholder="WhatsApp, Excel, Tally..." className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#0d0d12] px-4 py-3 text-white outline-none focus:border-[#22D9A0]" /><button onClick={() => { addTag(toolInput, tools, setTools); setToolInput(""); }} className="rounded-xl border border-white/10 px-4 text-sm font-bold">Add</button></div>
              <div className="mt-3 flex flex-wrap gap-2">{toolSuggestions.map((item) => <button key={item} onClick={() => tools.includes(item) ? setTools(tools.filter((tool) => tool !== item)) : setTools([...tools, item])} className={`rounded-full px-3 py-1 text-xs font-bold ${tools.includes(item) ? "bg-[#7C6FFF]/15 text-[#c6c1ff]" : "border border-white/10 text-zinc-500"}`}>{item}</button>)}</div>
            </div>
            <div className="mt-6 rounded-2xl border border-[#22D9A0]/20 bg-[#22D9A0]/10 p-4 text-sm text-emerald-50">NEXA says: Based on {effectiveIndustry || "this industry"} businesses I have worked with, I will help you collect all the right details. Let us go through your team next.</div>
            <button onClick={() => void saveCompany().then((ok) => ok && nextStep())} disabled={loading === "company"} className="mt-6 rounded-xl bg-[#22D9A0] px-5 py-3 text-sm font-bold text-black">{loading === "company" ? "Saving..." : "Save and continue"} <ChevronRight className="inline h-4 w-4" /></button>
          </section>
        ) : null}

        {step === 1 ? (
          <section className="space-y-5">
            <div className="rounded-2xl border border-[#7C6FFF]/25 bg-[#7C6FFF]/10 p-4 text-sm text-[#dedaff]">
              Start with the owner. You already told me {lead.name} is there — I have added them. Tell me about everyone else.
            </div>
            {employees.map((employee, index) => (
              <div key={index} className="rounded-2xl border border-white/10 bg-[#13131c] p-5">
                <div className="flex justify-between gap-3">
                  <h2 className="font-heading text-lg font-bold">Employee {index + 1}</h2>
                  <button onClick={() => setEmployees(employees.filter((_, itemIndex) => itemIndex !== index))} className="text-zinc-500 hover:text-red-300"><Trash2 className="h-4 w-4" /></button>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <input value={employee.name} onChange={(event) => setEmployees(employees.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item))} placeholder="Name" className="rounded-xl border border-white/10 bg-[#0d0d12] px-4 py-3 outline-none focus:border-[#22D9A0]" />
                  <input value={employee.title} onChange={(event) => setEmployees(employees.map((item, itemIndex) => itemIndex === index ? { ...item, title: event.target.value } : item))} placeholder="Title" className="rounded-xl border border-white/10 bg-[#0d0d12] px-4 py-3 outline-none focus:border-[#22D9A0]" />
                  <input value={employee.email} onChange={(event) => setEmployees(employees.map((item, itemIndex) => itemIndex === index ? { ...item, email: event.target.value } : item))} placeholder="Email" className="rounded-xl border border-white/10 bg-[#0d0d12] px-4 py-3 outline-none focus:border-[#22D9A0]" />
                  <input value={employee.phone} onChange={(event) => setEmployees(employees.map((item, itemIndex) => itemIndex === index ? { ...item, phone: event.target.value } : item))} placeholder="Phone" className="rounded-xl border border-white/10 bg-[#0d0d12] px-4 py-3 outline-none focus:border-[#22D9A0]" />
                  <select value={employee.reportsTo} onChange={(event) => setEmployees(employees.map((item, itemIndex) => itemIndex === index ? { ...item, reportsTo: event.target.value } : item))} className="rounded-xl border border-white/10 bg-[#0d0d12] px-4 py-3 outline-none focus:border-[#22D9A0]"><option>Owner/Boss</option>{employees.slice(0, index).map((item) => item.name ? <option key={item.name}>{item.name}</option> : null)}</select>
                  <select value={employee.systemRole} onChange={(event) => setEmployees(employees.map((item, itemIndex) => itemIndex === index ? { ...item, systemRole: event.target.value } : item))} className="rounded-xl border border-white/10 bg-[#0d0d12] px-4 py-3 outline-none focus:border-[#22D9A0]">{["Boss", "Manager", "Sales", "Technical", "Operations"].map((item) => <option key={item}>{item}</option>)}</select>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-zinc-400">Assigned products/pipelines</p>
                  <div className="mt-2 flex flex-wrap gap-2">{products.map((product) => <button key={product} onClick={() => setEmployees(employees.map((item, itemIndex) => itemIndex === index ? { ...item, assignedPipelines: item.assignedPipelines.includes(product) ? item.assignedPipelines.filter((pipeline) => pipeline !== product) : [...item.assignedPipelines, product] } : item))} className={`rounded-full px-3 py-1 text-xs font-bold ${employee.assignedPipelines.includes(product) ? "bg-[#22D9A0] text-black" : "border border-white/10 text-zinc-500"}`}>{product}</button>)}</div>
                </div>
                <textarea value={employee.operatingProcedures} onChange={(event) => setEmployees(employees.map((item, itemIndex) => itemIndex === index ? { ...item, operatingProcedures: event.target.value } : item))} placeholder={employeePlaceholder(employee.title)} className="mt-4 min-h-28 w-full rounded-xl border border-white/10 bg-[#0d0d12] px-4 py-3 outline-none focus:border-[#22D9A0]" />
                <textarea value={employee.decisionAuthority} onChange={(event) => setEmployees(employees.map((item, itemIndex) => itemIndex === index ? { ...item, decisionAuthority: event.target.value } : item))} placeholder="Decision authority - e.g. Can approve discounts up to 5%, assign callbacks, schedule demos..." className="mt-4 min-h-20 w-full rounded-xl border border-white/10 bg-[#0d0d12] px-4 py-3 outline-none focus:border-[#22D9A0]" />
                <div className="mt-4">
                  <div className="h-2 overflow-hidden rounded-full bg-white/10"><div className={`h-full ${completionClass(employee.completeness ?? 0)}`} style={{ width: `${employee.completeness ?? 0}%` }} /></div>
                  <p className="mt-2 text-xs text-zinc-500">NEXA completeness: {employee.completeness ?? 0}%</p>
                  {employee.nexaFlags?.length ? <ul className="mt-2 list-disc pl-5 text-xs text-amber-200">{employee.nexaFlags.map((flag) => <li key={flag}>{flag}</li>)}</ul> : null}
                </div>
                <button onClick={() => void checkEmployee(index)} disabled={loading === `employee-${index}`} className="mt-4 rounded-xl border border-[#22D9A0]/30 px-4 py-2 text-sm font-bold text-[#22D9A0]">{loading === `employee-${index}` ? "Checking..." : "Check completeness"}</button>
              </div>
            ))}
            <div className="flex justify-between"><button onClick={() => setEmployees([...employees, emptyEmployee()])} className="rounded-xl border border-white/10 px-4 py-3 text-sm font-bold"><Plus className="inline h-4 w-4" /> Add employee</button><button onClick={nextStep} className="rounded-xl bg-[#22D9A0] px-5 py-3 text-sm font-bold text-black">Continue</button></div>
          </section>
        ) : null}

        {step === 2 ? (
          <section className="space-y-4">
            {pipelines.map((pipeline) => (
              <details key={pipeline.id} open className="rounded-2xl border border-white/10 bg-[#13131c] p-5">
                <summary className="cursor-pointer font-heading text-lg font-bold">{pipeline.name}</summary>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <input value={pipeline.name} onChange={(event) => setPipelines(pipelines.map((item) => item.id === pipeline.id ? { ...item, name: event.target.value } : item))} className="rounded-xl border border-white/10 bg-[#0d0d12] px-4 py-3 outline-none focus:border-[#22D9A0]" />
                  <div className="flex flex-wrap gap-2">{colors.map((color) => <button key={color} onClick={() => setPipelines(pipelines.map((item) => item.id === pipeline.id ? { ...item, color } : item))} className={`h-8 w-8 rounded-full ${pipeline.color === color ? "ring-2 ring-white" : ""}`} style={{ background: color }} />)}</div>
                </div>
                <div className="mt-5 space-y-2">{pipeline.stages.map((stage, stageIndex) => <div key={`${stage}-${stageIndex}`} className="grid gap-2 md:grid-cols-[36px_1fr_120px_36px]"><button onClick={() => stageIndex > 0 && setPipelines(pipelines.map((item) => item.id === pipeline.id ? { ...item, stages: item.stages.map((s, i, arr) => i === stageIndex - 1 ? arr[stageIndex] : i === stageIndex ? arr[stageIndex - 1] : s) } : item))} className="rounded-lg border border-white/10 text-zinc-400"><ArrowUp className="mx-auto h-4 w-4" /></button><input value={stage} onChange={(event) => setPipelines(pipelines.map((item) => item.id === pipeline.id ? { ...item, stages: item.stages.map((s, i) => i === stageIndex ? event.target.value : s) } : item))} className="rounded-xl border border-white/10 bg-[#0d0d12] px-4 py-2 outline-none focus:border-[#22D9A0]" /><input type="number" value={pipeline.slaDays[stage] ?? 2} onChange={(event) => setPipelines(pipelines.map((item) => item.id === pipeline.id ? { ...item, slaDays: { ...item.slaDays, [stage]: Number(event.target.value) } } : item))} className="rounded-xl border border-white/10 bg-[#0d0d12] px-4 py-2 outline-none focus:border-[#22D9A0]" /><button onClick={() => setPipelines(pipelines.map((item) => item.id === pipeline.id ? { ...item, stages: item.stages.filter((_, i) => i !== stageIndex) } : item))} className="rounded-lg border border-white/10 text-red-300">×</button></div>)}</div>
                <button onClick={() => setPipelines(pipelines.map((item) => item.id === pipeline.id ? { ...item, stages: [...item.stages, "New stage"] } : item))} className="mt-3 rounded-xl border border-white/10 px-3 py-2 text-sm">Add stage</button>
                <div className="mt-5"><p className="text-sm text-zinc-400">Who can see this pipeline</p><div className="mt-2 flex flex-wrap gap-2">{employees.map((employee) => employee.name ? <button key={employee.name} onClick={() => setPipelines(pipelines.map((item) => item.id === pipeline.id ? { ...item, visibleTo: item.visibleTo.includes(employee.name) ? item.visibleTo.filter((name) => name !== employee.name) : [...item.visibleTo, employee.name] } : item))} className={`rounded-full px-3 py-1 text-xs font-bold ${pipeline.visibleTo.includes(employee.name) ? "bg-[#7C6FFF] text-white" : "border border-white/10 text-zinc-500"}`}>{employee.name}</button> : null)}</div></div>
              </details>
            ))}
            <div className="flex justify-between"><button onClick={() => setPipelines([...pipelines, buildPipeline("New Product", effectiveIndustry)])} className="rounded-xl border border-white/10 px-4 py-3 text-sm font-bold">Add pipeline</button><button onClick={() => void savePipelines().then((ok) => ok && nextStep())} disabled={loading === "pipelines"} className="rounded-xl bg-[#22D9A0] px-5 py-3 text-sm font-bold text-black">{loading === "pipelines" ? "Saving..." : "Save and continue"}</button></div>
          </section>
        ) : null}

        {step === 3 ? (
          <section className="rounded-2xl border border-white/10 bg-[#13131c] p-6">
            <h2 className="font-heading text-xl font-bold">Operating rules</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-[180px_1fr_auto]"><select value={newRule.type} onChange={(event) => setNewRule({ ...newRule, type: event.target.value })} className="rounded-xl border border-white/10 bg-[#0d0d12] px-4 py-3">{["Approval", "Time", "Reporting", "Escalation"].map((item) => <option key={item}>{item}</option>)}</select><input value={newRule.text} onChange={(event) => setNewRule({ ...newRule, text: event.target.value })} placeholder="Quotes above ₹50,000 need owner's approval" className="rounded-xl border border-white/10 bg-[#0d0d12] px-4 py-3 outline-none focus:border-[#22D9A0]" /><button onClick={() => { if (newRule.text.trim()) setRules([...rules, { id: uid(), ...newRule }]); setNewRule({ type: "Approval", text: "" }); }} className="rounded-xl bg-[#22D9A0] px-4 text-sm font-bold text-black">Add</button></div>
            <div className="mt-5 space-y-2">{rules.map((rule) => <div key={rule.id} className="flex justify-between rounded-xl border border-white/10 bg-[#0d0d12] p-3 text-sm"><span><b>{rule.type}:</b> {rule.text}</span><button onClick={() => setRules(rules.filter((item) => item.id !== rule.id))} className="text-red-300">Remove</button></div>)}</div>
            <div className="mt-6 rounded-xl border border-[#7C6FFF]/20 bg-[#7C6FFF]/10 p-4"><p className="text-sm font-bold text-[#c6c1ff]">Suggested rules</p><div className="mt-3 space-y-2">{suggestedRules.map((rule) => <button key={rule} onClick={() => setRules([...rules, { id: uid(), type: "Suggested", text: rule }])} className="block w-full rounded-lg border border-white/10 px-3 py-2 text-left text-sm text-zinc-300">+ {rule}</button>)}</div></div>
            <button onClick={() => void saveRules().then((ok) => ok && nextStep())} className="mt-6 rounded-xl bg-[#22D9A0] px-5 py-3 text-sm font-bold text-black">Save and start NEXA review</button>
          </section>
        ) : null}

        {step === 4 ? (
          <section className="space-y-5">
            <div className="rounded-2xl border border-[#22D9A0]/25 bg-[#22D9A0]/10 p-6">
              <h3 className="font-heading text-lg font-bold text-[#22D9A0]">From your call notes</h3>
              {lead.callNotes?.length ? (
                <div className="mt-4 space-y-3">
                  <textarea value={callNoteInsight} onChange={(event) => setCallNoteInsight(event.target.value)} className="min-h-24 w-full rounded-xl border border-white/10 bg-[#0d0d12] px-4 py-3 text-sm text-white outline-none focus:border-[#22D9A0]" />
                  <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-300">
                    {lead.callNotes.map((note) => (
                      <p key={note.id} className="mb-3 last:mb-0">{note.content}</p>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-sm text-zinc-400">No call notes were attached to this lead yet.</p>
              )}
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#13131c] p-6">
              <div className="flex items-center justify-between gap-4"><h2 className="font-heading text-xl font-bold">NEXA review</h2><button onClick={() => void runAnalysis()} disabled={loading === "analysis"} className="rounded-xl bg-[#7C6FFF] px-4 py-3 text-sm font-bold">{loading === "analysis" ? "Analyzing..." : "Run analysis"}</button></div>
              {analysis ? <><div className={`mt-5 inline-flex h-24 w-24 items-center justify-center rounded-full text-3xl font-bold text-black ${completionClass(analysis.score)}`}>{analysis.score}</div><div className="mt-5 grid gap-2">{analysis.checks.map((check) => <div key={check.label} className="rounded-xl border border-white/10 bg-[#0d0d12] p-3 text-sm"><span className={check.status === "ok" ? "text-[#22D9A0]" : check.status === "warning" ? "text-[#F5A623]" : "text-[#FF6B6B]"}>{check.status === "ok" ? "✓" : check.status === "warning" ? "!" : "×"}</span> <b>{check.label}</b> - {check.message}</div>)}</div></> : <p className="mt-4 text-sm text-zinc-500">Run NEXA analysis to see completeness, gaps, and suggestions.</p>}
            </div>
            {gaps.length ? <div className="rounded-2xl border border-white/10 bg-[#13131c] p-6"><h3 className="font-heading text-lg font-bold">NEXA gap questions</h3><div className="mt-4 rounded-2xl border border-[#22D9A0]/20 bg-[#22D9A0]/10 p-4 text-sm text-emerald-50">{gaps[activeGap]}</div><textarea value={gapAnswers[gaps[activeGap]] ?? ""} onChange={(event) => setGapAnswers({ ...gapAnswers, [gaps[activeGap]]: event.target.value })} className="mt-3 min-h-24 w-full rounded-xl border border-white/10 bg-[#0d0d12] px-4 py-3 outline-none focus:border-[#22D9A0]" placeholder="Type the answer..." /><button onClick={() => setActiveGap(Math.min(gaps.length - 1, activeGap + 1))} className="mt-3 rounded-xl border border-white/10 px-4 py-2 text-sm">NEXA acknowledges - next</button></div> : null}
            {suggestions.length ? <div className="rounded-2xl border border-white/10 bg-[#13131c] p-6"><h3 className="font-heading text-lg font-bold">NEXA suggestions</h3><div className="mt-4 grid gap-3">{suggestions.map((suggestion) => <div key={suggestion.suggestion} className="rounded-xl border border-white/10 bg-[#0d0d12] p-4"><p className="text-sm font-bold">{suggestion.type}: {suggestion.suggestion}</p><p className="mt-1 text-xs text-zinc-500">{suggestion.reason}</p><button onClick={() => setAcceptedSuggestions([...acceptedSuggestions, suggestion.suggestion])} className="mt-3 rounded-lg bg-[#22D9A0] px-3 py-1 text-xs font-bold text-black">{acceptedSuggestions.includes(suggestion.suggestion) ? "Accepted" : "Accept"}</button></div>)}</div></div> : null}
            <div className="rounded-2xl border border-white/10 bg-[#13131c] p-6">
              <button onClick={() => void generateSummary()} disabled={!canGenerateSummary || loading === "summary"} className={`rounded-xl px-5 py-3 text-sm font-bold ${canGenerateSummary ? "bg-[#22D9A0] text-black" : "bg-white/10 text-zinc-500"}`}>{loading === "summary" ? "Generating..." : "Generate summary"}</button>
              {summary ? <pre className="mt-5 max-h-96 overflow-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-[#0d0d12] p-4 text-sm text-zinc-300">{summary}</pre> : null}
              {summary ? <><div className="mt-5 grid gap-3 md:grid-cols-4">{planCards.map((plan) => <button key={plan.id} onClick={() => setSelectedPlan(plan.id)} className={`rounded-xl border p-4 text-left ${selectedPlan === plan.id ? "border-[#22D9A0] bg-[#22D9A0]/10" : "border-white/10 bg-[#0d0d12]"}`}><p className="font-bold">{plan.name}</p><p className="mt-1 text-sm text-[#22D9A0]">{plan.price}</p><p className="mt-2 text-xs text-[#F5A623]">Commission {plan.commission}</p><p className="mt-2 text-xs text-zinc-500">{plan.value}</p></button>)}</div><textarea value={bdmNotes} onChange={(event) => setBdmNotes(event.target.value)} placeholder="Private notes for SDE..." className="mt-5 min-h-24 w-full rounded-xl border border-white/10 bg-[#0d0d12] px-4 py-3 outline-none focus:border-[#22D9A0]" /><button onClick={() => void submitToSde()} disabled={loading === "submit"} className="mt-5 w-full rounded-xl bg-[#22D9A0] px-5 py-4 text-sm font-bold text-black">{loading === "submit" ? "Submitting..." : "Submit to SDE"}</button></> : null}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
