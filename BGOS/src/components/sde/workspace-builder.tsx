"use client";

import { useMemo, useState } from "react";

type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  businessType: string;
  employeeCount: string;
  challenge: string | null;
  selectedPlan: string | null;
  bdmNotes: string | null;
};

function parseNotes(notes: string | null) {
  if (!notes) return {} as Record<string, unknown>;
  try {
    return JSON.parse(notes) as Record<string, unknown>;
  } catch {
    return { privateNotes: notes };
  }
}

function asStrings(value: unknown, fallback: string[]) {
  if (Array.isArray(value)) {
    const strings = value
      .map((item) => (typeof item === "string" ? item : typeof item === "object" && item ? String((item as Record<string, unknown>).name ?? "") : ""))
      .filter(Boolean);
    if (strings.length) return strings;
  }
  return fallback;
}

export function WorkspaceBuilder({
  onboardingLead,
  onDelivered,
}: {
  onboardingLead: Lead;
  onDelivered: () => void;
}) {
  const notes = useMemo(() => parseNotes(onboardingLead.bdmNotes), [onboardingLead.bdmNotes]);
  const products = asStrings(notes.products, [onboardingLead.companyName]);
  const roleNames = asStrings(notes.teamStructure, ["Owner", "Sales Executive", "Technical"]);
  const [step, setStep] = useState(0);
  const [companyName, setCompanyName] = useState(onboardingLead.companyName);
  const [nexaPersonality, setNexaPersonality] = useState("Warm and friendly");
  const [language, setLanguage] = useState("English");
  const [welcome, setWelcome] = useState(`Welcome to ${onboardingLead.companyName}. NEXA is ready to help your team focus today.`);
  const [healthScore, setHealthScore] = useState(60);
  const [pipelineText, setPipelineText] = useState(
    products.map((product) => `${product}:New,Contacted,Demo,Proposal,Won,Lost`).join("\n"),
  );
  const [rolesText, setRolesText] = useState(roleNames.map((role) => `${role}:BDM`).join("\n"));
  const [tasksText, setTasksText] = useState(
    [
      "Review all active leads",
      "Invite team members",
      "Set this month's target",
      "Check NEXA insights",
      "Add first customer follow-up",
    ].join("\n"),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const pipelines = pipelineText
    .split("\n")
    .map((line) => {
      const [name, stages] = line.split(":");
      return {
        name: name?.trim(),
        pipelineStages: (stages ?? "New,Contacted,Demo,Proposal,Won,Lost").split(",").map((stage) => stage.trim()).filter(Boolean),
        color: "#7C6FFF",
        visibleToRoles: roleNames,
      };
    })
    .filter((pipeline) => pipeline.name);

  const teamRoles = rolesText
    .split("\n")
    .map((line) => {
      const [displayName, systemRole] = line.split(":");
      return {
        displayName: displayName?.trim(),
        systemRole: (systemRole?.trim() || "BDM").toUpperCase(),
        assignedProducts: pipelines.map((pipeline) => pipeline.name),
      };
    })
    .filter((role) => role.displayName);

  async function deliver() {
    if (!companyName.trim() || pipelines.length === 0 || teamRoles.length === 0) {
      setError("Company, at least one pipeline, and at least one team role are required.");
      return;
    }

    if (!window.confirm(`This will send the workspace access email to ${onboardingLead.email}. Are you ready?`)) {
      return;
    }

    setLoading(true);
    setError("");
    const response = await fetch("/api/onboarding/sde-deliver", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        onboardingLeadId: onboardingLead.id,
        notes: `Configured by SDE. Health score ${healthScore}.`,
        workspaceConfig: {
          companyName,
          products: pipelines,
          teamRoles,
          nexaPersonality,
          primaryLanguage: language,
          customWelcomeMessage: welcome,
          customInsights: [`Primary challenge: ${onboardingLead.challenge ?? "Not specified"}`],
          starterTasks: tasksText.split("\n").map((task) => task.trim()).filter(Boolean).slice(0, 5),
          healthScore,
        },
      }),
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string; previewUrl?: string };
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? "Unable to deliver workspace.");
      return;
    }

    setSuccess("Workspace delivered. The client has been notified.");
    onDelivered();
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#13131c] p-6">
      <div className="mb-5 flex flex-wrap gap-2">
        {["Configure", "Pipelines", "Team", "Review & Deliver"].map((label, index) => (
          <button key={label} onClick={() => setStep(index)} className={`rounded-full px-4 py-2 text-xs font-bold ${step === index ? "bg-[#22D9A0] text-black" : "bg-white/5 text-zinc-400"}`}>
            {index + 1}. {label}
          </button>
        ))}
      </div>

      {step === 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm text-zinc-300">Company name<input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#0d0d12] px-4 py-3 text-white" /></label>
          <label className="text-sm text-zinc-300">Industry<input defaultValue={onboardingLead.businessType} className="mt-2 w-full rounded-xl border border-white/10 bg-[#0d0d12] px-4 py-3 text-white" /></label>
          <label className="text-sm text-zinc-300">NEXA personality<select value={nexaPersonality} onChange={(e) => setNexaPersonality(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#0d0d12] px-4 py-3 text-white">{["Professional and formal", "Warm and friendly", "Sharp and direct", "Motivational"].map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="text-sm text-zinc-300">Primary language<select value={language} onChange={(e) => setLanguage(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#0d0d12] px-4 py-3 text-white">{["English", "Hindi", "Tamil", "Telugu", "Malayalam"].map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="md:col-span-2 text-sm text-zinc-300">Custom welcome message<textarea value={welcome} onChange={(e) => setWelcome(e.target.value)} className="mt-2 min-h-24 w-full rounded-xl border border-white/10 bg-[#0d0d12] px-4 py-3 text-white" /></label>
          <label className="md:col-span-2 text-sm text-zinc-300">Health score starting point: {healthScore}<input type="range" min={40} max={70} value={healthScore} onChange={(e) => setHealthScore(Number(e.target.value))} className="mt-2 w-full accent-[#22D9A0]" /></label>
        </div>
      ) : null}

      {step === 1 ? <textarea value={pipelineText} onChange={(e) => setPipelineText(e.target.value)} className="min-h-72 w-full rounded-xl border border-white/10 bg-[#0d0d12] px-4 py-3 font-mono text-sm text-white" /> : null}
      {step === 2 ? <textarea value={rolesText} onChange={(e) => setRolesText(e.target.value)} className="min-h-48 w-full rounded-xl border border-white/10 bg-[#0d0d12] px-4 py-3 font-mono text-sm text-white" /> : null}
      {step === 3 ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-[#0d0d12] p-4 text-sm text-zinc-300">
            <p><strong className="text-white">{companyName}</strong> · {onboardingLead.selectedPlan ?? "STARTER"}</p>
            <p className="mt-2">{pipelines.length} pipelines · {teamRoles.length} roles · {nexaPersonality} · {language}</p>
          </div>
          <textarea value={tasksText} onChange={(e) => setTasksText(e.target.value)} className="min-h-36 w-full rounded-xl border border-white/10 bg-[#0d0d12] px-4 py-3 text-sm text-white" />
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
          {success ? <p className="text-sm text-[#22D9A0]">{success}</p> : null}
          <button onClick={() => void deliver()} disabled={loading} className="w-full rounded-xl bg-[#22D9A0] px-5 py-4 text-sm font-bold text-black disabled:opacity-60">{loading ? "Delivering..." : "Deliver to client"}</button>
        </div>
      ) : null}
    </div>
  );
}
