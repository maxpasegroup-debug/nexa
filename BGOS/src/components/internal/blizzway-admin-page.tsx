"use client";

import { useEffect, useState } from "react";

import { InternalSidebar, InternalTopbar } from "@/components/internal/bgos-internal-dashboard";

type User = { id: string; name: string; email: string; role: string };
type ApiState = Record<string, unknown> | null;

const sections = [
  ["overview", "Overview", "/api/internal/blizzway/overview"],
  ["companions", "Companions", "/api/internal/blizzway/companions"],
  ["assessments", "Assessments", "/api/internal/blizzway/assessments"],
  ["admissions", "Admissions", "/api/internal/blizzway/admissions"],
  ["wallet", "Wallet & Pricing", "/api/internal/blizzway/wallet"],
  ["users", "Users", "/api/internal/blizzway/users"],
  ["requests", "Custom Requests", "/api/internal/blizzway/requests"],
  ["content", "Content Config", "/api/internal/blizzway/content"],
] as const;

const companionDraft = {
  name: "New Companion Draft",
  slug: `admin-companion-${Date.now()}`,
  companionCategory: "Career Growth",
  career7Type: "CAREER",
  creditPrice: 0,
  pricingMode: "free",
  description: "Admin-created companion placeholder.",
  requiredInputs: ["Goal", "Current status"],
  expectedOutput: ["Summary", "Checklist"],
  career7Status: "DRAFT",
  isActive: false,
};

const assessmentDraft = {
  title: "Admin Assessment Draft",
  slug: `admin-assessment-${Date.now()}`,
  category: "Career Tests",
  description: "Admin-created assessment placeholder.",
  creditCost: 0,
  pricingMode: "free",
  repeatable: true,
  questionSet: ["What goal are you exploring?"],
};

const admissionDraft = {
  title: "Admin Admission Pathway Draft",
  slug: `admin-admission-${Date.now()}`,
  countryRegion: "Global",
  level: "UG",
  deadline: "Admin review required",
  eligibilitySummary: "Admin-created admission pathway placeholder.",
  documents: ["Academic transcript"],
  scholarships: ["Scholarship review pending"],
};

function isArrayPayload(value: ApiState, keys: string[]) {
  if (!value) return [];
  for (const key of keys) {
    const item = value[key];
    if (Array.isArray(item)) return item;
  }
  return [];
}

function compactJson(value: unknown) {
  return JSON.stringify(value, null, 2).slice(0, 2200);
}

export function BlizzwayAdminPage({ user, initialSection = "overview" }: { user: User; initialSection?: string }) {
  const [section, setSection] = useState(initialSection);
  const [data, setData] = useState<ApiState>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const active = sections.find(([key]) => key === section) ?? sections[0];

  async function load() {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(active[2], { cache: "no-store" });
      const payload = (await response.json()) as ApiState;
      if (!response.ok) throw new Error((payload?.error as string) || "Request failed");
      setData(payload);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load section.");
    } finally {
      setLoading(false);
    }
  }

  async function mutate(body: Record<string, unknown>, method = "POST") {
    setMessage("");
    const response = await fetch(active[2], {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setMessage(payload.error || "Action failed.");
      return;
    }
    setMessage("Action completed.");
    await load();
  }

  useEffect(() => {
    void load();
  }, [section]);

  const rows = isArrayPayload(data, ["companions", "assessments", "pathways", "packages", "users", "requests", "configs"]);

  return (
    <div className="min-h-screen bg-[#050506] text-white">
      <InternalSidebar user={user} />
      <InternalTopbar user={user} />
      <main className="px-4 py-6 md:ml-[240px] md:px-8 md:pt-[84px]">
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#22D9A0]">Blizzway operations</p>
            <h1 className="mt-2 text-3xl font-black">Admin control panel</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
              Manage Blizzway content, credits, companions, users, requests, and catalogue placeholders from BGOS.
            </p>
          </div>
          <button onClick={() => void load()} className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-zinc-200">
            Refresh
          </button>
        </div>

        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
          {sections.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSection(key)}
              className={`shrink-0 rounded-xl px-4 py-2 text-sm font-bold ${section === key ? "bg-[#7C6FFF] text-white" : "bg-white/[0.04] text-zinc-400"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {message ? <div className="mb-5 rounded-xl border border-[#F5A623]/30 bg-[#F5A623]/10 p-4 text-sm font-bold text-[#F5A623]">{message}</div> : null}

        <section className="grid gap-5 xl:grid-cols-[0.72fr_1.28fr]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <h2 className="text-xl font-black">{active[1]}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">Admin-only Blizzway scope. Sensitive raw onboarding answers are not displayed here.</p>

            {section === "companions" ? (
              <button onClick={() => void mutate(companionDraft)} className="mt-5 w-full rounded-xl bg-[#7C6FFF] px-4 py-3 text-sm font-bold">Create companion draft</button>
            ) : null}
            {section === "assessments" ? (
              <button onClick={() => void mutate(assessmentDraft)} className="mt-5 w-full rounded-xl bg-[#7C6FFF] px-4 py-3 text-sm font-bold">Create assessment draft</button>
            ) : null}
            {section === "admissions" ? (
              <button onClick={() => void mutate(admissionDraft)} className="mt-5 w-full rounded-xl bg-[#7C6FFF] px-4 py-3 text-sm font-bold">Create admission draft</button>
            ) : null}
            {section === "content" ? (
              <button onClick={() => void mutate({ key: "dashboard_announcements", title: "Dashboard announcements", value: { message: "Complete one meaningful pathway action today." } })} className="mt-5 w-full rounded-xl bg-[#7C6FFF] px-4 py-3 text-sm font-bold">Save announcement</button>
            ) : null}
            {section === "wallet" ? (
              <p className="mt-5 rounded-xl bg-white/[0.04] p-4 text-sm text-zinc-400">Manual credit grants are available through the wallet API and are smoke-tested with audit reason metadata.</p>
            ) : null}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            {loading ? (
              <p className="text-sm font-bold text-zinc-400">Loading Blizzway admin data...</p>
            ) : rows.length ? (
              <div className="grid gap-3">
                {rows.slice(0, 12).map((row, index) => (
                  <pre key={index} className="overflow-x-auto rounded-xl border border-white/10 bg-black/30 p-4 text-xs leading-5 text-zinc-300">
                    {compactJson(row)}
                  </pre>
                ))}
              </div>
            ) : (
              <pre className="overflow-x-auto rounded-xl border border-white/10 bg-black/30 p-4 text-xs leading-5 text-zinc-300">
                {compactJson(data)}
              </pre>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
