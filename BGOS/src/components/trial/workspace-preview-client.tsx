"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Lock, Send } from "lucide-react";

import { PLANS, type PlanKey } from "@/lib/plans";

type WorkspaceConfig = {
  id: string;
  companyName: string;
  products: unknown;
  teamRoles: unknown;
  pipelines: unknown;
  nexaConfig: unknown;
};

type PreviewPayload = {
  workspaceConfig: WorkspaceConfig;
  business: { id: string; name: string; healthScore: number };
  lead?: { name: string; email: string; phone: string; selectedPlan: string | null };
};

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

export function WorkspacePreviewClient({ token }: { token: string }) {
  const [data, setData] = useState<PreviewPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "nexa" | "user"; text: string }>>([]);

  useEffect(() => {
    async function loadPreview() {
      const response = await fetch(`/api/onboarding/preview?token=${encodeURIComponent(token)}`, { cache: "no-store" });
      const payload = (await response.json().catch(() => ({}))) as PreviewPayload & { error?: string };
      setLoading(false);
      if (!response.ok) {
        setError(payload.error ?? "Preview not found.");
        return;
      }
      setData(payload);
    }
    void loadPreview();
  }, [token]);

  const details = useMemo(() => {
    if (!data) return null;
    const products = asArray<{ name?: string; productName?: string; pipelineStages?: string[]; stages?: string[] }>(data.workspaceConfig.products);
    const pipelines = asArray<{ name?: string; productName?: string; stages?: string[]; pipelineStages?: string[] }>(data.workspaceConfig.pipelines);
    const roles = asArray<{ displayName?: string; name?: string; title?: string; systemRole?: string; assignedProducts?: string[] }>(data.workspaceConfig.teamRoles);
    const nexaConfig = (data.workspaceConfig.nexaConfig ?? {}) as Record<string, unknown>;
    const welcome = text(
      nexaConfig.customWelcomeMessage,
      text(nexaConfig.summary, `Welcome to ${data.workspaceConfig.companyName}. NEXA knows your configured pipelines, roles, and operating rules.`),
    );
    return { products, pipelines: pipelines.length ? pipelines : products, roles, welcome };
  }, [data]);

  useEffect(() => {
    if (details && messages.length === 0) {
      setMessages([{ role: "nexa", text: details.welcome }]);
    }
  }, [details, messages.length]);

  function askNexa() {
    const question = chatInput.trim();
    if (!question || !details || !data) return;
    setMessages((current) => [
      ...current,
      { role: "user", text: question },
      {
        role: "nexa",
        text: `For ${data.workspaceConfig.companyName}, I can already see ${details.pipelines.length} configured pipeline(s) and ${details.roles.length} team role(s). Start the trial and I will use live leads, tasks, and team activity to answer this precisely.`,
      },
    ]);
    setChatInput("");
  }

  if (loading) return <main className="min-h-screen bg-[#070709] p-8 text-white"><div className="h-96 animate-pulse rounded-2xl bg-white/10" /></main>;
  if (!data || !details || error) return <main className="flex min-h-screen items-center justify-center bg-[#070709] text-white">{error || "Preview unavailable."}</main>;

  const activateHref = `/activate-trial?businessId=${data.business.id}&token=${encodeURIComponent(token)}`;
  const planKey = data.lead?.selectedPlan && data.lead.selectedPlan in PLANS ? (data.lead.selectedPlan as PlanKey) : "GROWTH";
  const plan = PLANS[planKey];
  const trialNote = plan.price
    ? `${plan.priceDisplay}/month after 7-day free trial · + 18% GST · Autopay · Cancel anytime`
    : "Custom plan after 7-day free trial · Annual contract";

  return (
    <main className="min-h-screen bg-[#070709] pb-28 text-white">
      <div className="sticky top-0 z-30 border-b border-[#22D9A0]/20 bg-[#07100b]/95 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-heading text-lg font-bold">🎉 {data.workspaceConfig.companyName}&apos;s workspace is ready — built specifically for your business.</p>
            <p className="mt-1 text-xs text-emerald-100">
              {plan.name} · {plan.priceDisplay}{plan.period} · {plan.gstNote}
            </p>
          </div>
          <Link href={activateHref} className="rounded-xl bg-[#22D9A0] px-5 py-3 text-sm font-bold text-black">Activate your team — start free trial →</Link>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 p-6 lg:grid-cols-[1fr_360px]">
        <section className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-[#13131c] p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Boss dashboard preview</p>
            <h1 className="mt-3 font-heading text-3xl font-bold">{data.workspaceConfig.companyName}</h1>
            <p className="mt-2 text-sm text-zinc-400">Employee logins are locked until trial activation.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {["Total leads", "Won this month", "Revenue", "Team active"].map((label) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-[#13131c] p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{label}</p>
                <p className="mt-3 font-heading text-3xl font-bold">0</p>
                <p className="mt-2 text-xs text-zinc-500">Start your trial to see live data</p>
              </div>
            ))}
          </div>

          <section className="rounded-2xl border border-white/10 bg-[#13131c] p-6">
            <h2 className="font-heading text-lg font-bold">Custom pipelines</h2>
            <div className="mt-5 space-y-4">
              {details.pipelines.map((pipeline, index) => {
                const stages: string[] = pipeline.stages ?? pipeline.pipelineStages ?? ["New", "Contacted", "Won"];
                return (
                  <div key={`${pipeline.name}-${index}`} className="rounded-xl border border-white/10 bg-[#0d0d12] p-4">
                    <h3 className="font-heading text-base font-bold">{pipeline.name ?? pipeline.productName ?? `Pipeline ${index + 1}`}</h3>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {stages.map((stage, stageIndex) => (
                        <div key={`${stage}-${stageIndex}`} className="flex items-center gap-2">
                          <span className="rounded-full bg-[#7C6FFF]/20 px-3 py-1 text-xs font-bold text-[#d8d4ff]">{stage}</span>
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
            <h2 className="font-heading text-lg font-bold">Team</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {details.roles.map((role, index) => (
                <div key={`${role.displayName}-${index}`} className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0d0d12] p-4">
                  <div>
                    <p className="text-sm font-bold">{role.displayName ?? role.name ?? `Employee ${index + 1}`}</p>
                    <p className="mt-1 text-xs text-zinc-500">{role.systemRole ?? role.title ?? "Team member"}</p>
                    <p className="mt-2 text-xs text-zinc-500">Employees will be activated when you start your trial.</p>
                  </div>
                  <Lock className="h-5 w-5 text-zinc-500" />
                </div>
              ))}
            </div>
          </section>
        </section>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-[#22D9A0]/25 bg-[#102017] p-5">
            <h2 className="font-heading text-lg font-bold text-[#22D9A0]">NEXA active</h2>
            <div className="mt-4 max-h-[360px] space-y-3 overflow-auto">
              {messages.map((message, index) => (
                <div key={index} className={`rounded-xl p-3 text-sm ${message.role === "nexa" ? "bg-[#22D9A0]/10 text-emerald-50" : "bg-white/10 text-white"}`}>
                  {message.text}
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <input value={chatInput} onChange={(event) => setChatInput(event.target.value)} placeholder="Ask NEXA..." className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#0d0d12] px-3 py-2 text-sm outline-none focus:border-[#22D9A0]" />
              <button onClick={askNexa} className="rounded-xl bg-[#22D9A0] px-3 text-black"><Send className="h-4 w-4" /></button>
            </div>
          </section>
        </aside>
      </div>

      <div className="fixed bottom-5 right-5 z-40 max-w-sm rounded-2xl border border-[#22D9A0]/25 bg-[#0f1914]/95 p-5 shadow-2xl backdrop-blur">
        <p className="text-sm text-emerald-50">You are previewing {data.workspaceConfig.companyName}&apos;s BGOS workspace. Happy with what you see? Activate your 7-day free trial below.</p>
        <p className="mt-2 text-xs text-emerald-100/80">{trialNote}</p>
        <div className="mt-4 flex gap-3">
          <Link href={activateHref} className="rounded-xl bg-[#22D9A0] px-4 py-3 text-sm font-bold text-black">Start trial →</Link>
          <a href="tel:+910000000000" className="rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-zinc-300">Call our team</a>
        </div>
      </div>
    </main>
  );
}
