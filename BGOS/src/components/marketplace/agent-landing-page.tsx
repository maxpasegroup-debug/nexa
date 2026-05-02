"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowLeft, Check } from "lucide-react";

import type { AgentOfferView, MarketplaceAgentView } from "./types";
import { MarketplaceNexaWidget } from "./marketplace-nexa-widget";
import { benefitsFor, featuresFor, money, stepsFor } from "./marketplace-utils";

type AgentLandingPageProps = {
  agent: MarketplaceAgentView;
  isInstalled: boolean;
  installStatus: string | null;
  businessId?: string | null;
  offers?: AgentOfferView[];
};

function openMarketplaceWidget() {
  if (typeof window === "undefined") return;
  if (window.innerWidth < 768 && window.openMobileNexaChat) {
    window.openMobileNexaChat();
    return;
  }
  if (window.openMarketplaceWidget) {
    window.openMarketplaceWidget();
  }
}

function SalesBoosterMockup({ agent }: { agent: MarketplaceAgentView }) {
  const rows = [
    ["WhatsApp", 138, "#25D366"],
    ["Instagram", 74, "#E4405F"],
    ["Facebook", 51, "#1877F2"],
    ["Email", 39, agent.colorPrimary],
    ["SMS", 24, "#F5A623"],
  ];

  return (
    <div className="rounded-3xl border border-white/10 bg-black/35 p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Lead hub</p>
          <p className="font-heading text-4xl font-extrabold text-white">326</p>
        </div>
        <span className="rounded-full bg-[#22D9A0] px-3 py-1 text-xs font-extrabold text-black">
          NEXA scoring
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {rows.map(([name, count, color]) => (
          <div key={name} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-xs text-zinc-400">{name}</p>
            <p className="mt-2 font-heading text-2xl font-extrabold text-white">{count}</p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-2/3 rounded-full" style={{ backgroundColor: String(color) }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WazzupMockup({ agent }: { agent: MarketplaceAgentView }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#07140c] p-5">
      <div className="mb-4 flex items-center gap-3 border-b border-white/10 pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-lg">
          {agent.icon}
        </div>
        <div>
          <p className="font-heading text-sm font-extrabold text-white">NEXA on WhatsApp</p>
          <p className="text-xs text-[#25D366]">online</p>
        </div>
      </div>
      <div className="space-y-3 text-sm">
        <div className="max-w-[82%] rounded-2xl rounded-tl-sm bg-white/10 px-4 py-3 text-zinc-100">
          Good morning. You have 18 new leads, 4 overdue tasks, and 2 approvals pending.
        </div>
        <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-[#25D366] px-4 py-3 font-semibold text-black">
          Send follow-ups to hot leads.
        </div>
        <div className="max-w-[84%] rounded-2xl rounded-tl-sm bg-white/10 px-4 py-3 text-zinc-100">
          Done. I sent WhatsApp follow-ups and scheduled reminders for your team.
        </div>
      </div>
    </div>
  );
}

function MetricsMockup({ agent }: { agent: MarketplaceAgentView }) {
  const labels: Record<string, [string, string, string]> = {
    HEALTHCARE: ["Appointments", "No-show risk", "Follow-ups"],
    EDUCATION: ["Students", "Fees pending", "Parent updates"],
    REAL_ESTATE: ["Site visits", "Matched leads", "Agreements"],
    CONSTRUCTION: ["Milestones", "Site visits", "Delays flagged"],
    RETAIL: ["Orders", "Dealers", "Payments"],
    FINANCE: ["Invoices", "GST reminders", "Outstanding"],
  };
  const selected = labels[agent.category] ?? ["Tasks", "Automations", "Insights"];

  return (
    <div className="rounded-3xl border border-white/10 bg-black/35 p-5">
      <p className="text-[10px] uppercase tracking-[0.24em]" style={{ color: agent.colorPrimary }}>
        {agent.name} console
      </p>
      <div className="mt-5 grid gap-3">
        {selected.map((label, index) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-300">{label}</span>
              <span className="font-heading text-2xl font-extrabold text-white">
                {[42, 17, 93][index]}
              </span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full"
                style={{ width: `${[72, 44, 86][index]}%`, backgroundColor: agent.colorPrimary }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AgentMockup({ agent }: { agent: MarketplaceAgentView }) {
  if (agent.slug === "sales-booster") return <SalesBoosterMockup agent={agent} />;
  if (agent.slug === "wazzup") return <WazzupMockup agent={agent} />;
  return <MetricsMockup agent={agent} />;
}

export function AgentLandingPage({
  agent,
  offers = [],
}: AgentLandingPageProps) {
  const features = useMemo(() => featuresFor(agent), [agent]);
  const benefits = useMemo(() => benefitsFor(agent), [agent]);
  const steps = useMemo(() => stepsFor(agent), [agent]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#070709] text-white">
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-[#070709]/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-5 md:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/marketplace" className="text-zinc-400 sm:hidden">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <span className="text-2xl">{agent.icon}</span>
            <span className="truncate font-heading text-lg font-extrabold">{agent.name}</span>
          </div>
          <p className="hidden text-sm text-zinc-500 md:block">Part of BGOS Marketplace</p>
          <div className="flex items-center gap-2">
            <Link href="/marketplace" className="hidden items-center gap-1 text-sm font-semibold text-zinc-400 hover:text-white sm:inline-flex">
              <ArrowLeft className="h-4 w-4" /> Back to Marketplace
            </Link>
            <button
              type="button"
              onClick={openMarketplaceWidget}
              className="rounded-full px-4 py-2 text-sm font-extrabold text-black"
              style={{ backgroundColor: agent.colorPrimary }}
            >
              <span className="sm:hidden">Install</span>
              <span className="hidden sm:inline">Install - {money(agent.onboardingFee)} setup</span>
            </button>
          </div>
        </div>
      </nav>

      <section className="relative mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[1fr_0.9fr] md:px-5 md:py-24">
        <div className="absolute inset-x-0 top-0 h-56 opacity-30 blur-3xl" style={{ background: `linear-gradient(90deg, transparent, ${agent.colorPrimary}55, transparent)` }} />
        <div className="relative z-10">
          <span className="inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em]" style={{ borderColor: `${agent.colorPrimary}66`, color: agent.colorPrimary, backgroundColor: `${agent.colorPrimary}12` }}>
            {agent.icon} {agent.category.replace("_", " ")}
          </span>
          <h1 className="mt-5 line-clamp-2 max-w-3xl font-heading text-[32px] font-extrabold leading-[1.06] tracking-normal text-white md:text-7xl">
            {agent.name}
            <span className="block" style={{ color: agent.colorPrimary }}>{agent.tagline}</span>
          </h1>
          <p className="mt-4 line-clamp-2 max-w-2xl text-sm font-light leading-6 text-zinc-400 md:mt-6 md:text-lg md:leading-7">
            {agent.description}
          </p>
          {agent.slug === "sales-booster" ? (
            <div className="mt-5 flex gap-2 overflow-x-auto scroll-x-hidden md:mt-6 md:flex-wrap md:overflow-visible">
              {["WhatsApp", "Instagram", "Facebook", "Email", "SMS"].map((channel) => (
                <span key={channel} className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-zinc-200">{channel}</span>
              ))}
            </div>
          ) : null}
          <button
            type="button"
            onClick={openMarketplaceWidget}
            className="mt-7 w-full rounded-full px-6 py-3 text-sm font-extrabold text-black md:mt-8 md:w-auto"
            style={{ background: `linear-gradient(135deg, ${agent.colorPrimary}, ${agent.colorSecondary})` }}
          >
            Get {agent.name}
          </button>
          <p className="mt-3 text-[11px] text-zinc-500 md:mt-4 md:text-xs">
            {money(agent.onboardingFee)} one-time setup + {money(agent.monthlyFee)}/mo · +18% GST · Autopay - cancel anytime
          </p>
        </div>
        <div className="relative z-10 max-h-[280px] overflow-y-auto md:max-h-none md:overflow-visible">
          <AgentMockup agent={agent} />
          {offers.length > 0 ? (
            <div className="mt-4 rounded-2xl border border-[#7C6FFF]/30 bg-[#7C6FFF]/10 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c8c2ff]">Active offer</p>
              <p className="mt-2 font-heading text-lg font-extrabold text-white">{offers[0].name}</p>
              <p className="mt-1 text-sm text-zinc-400">{offers[0].description}</p>
            </div>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14">
        <p className="text-[11px] font-bold uppercase tracking-[0.24em]" style={{ color: agent.colorPrimary }}>How it works</p>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {steps.slice(0, 4).map((step, index) => (
            <div key={`${step.title}-${index}`} className="relative flex min-h-0 gap-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:block md:min-h-[220px]">
              <span className="font-heading text-xl font-extrabold text-white/30 md:absolute md:right-4 md:top-2 md:text-6xl md:text-white/[0.04]">{step.step ?? `0${index + 1}`}</span>
              <div className="min-w-0 flex-1">
                <span className="text-2xl">{step.icon ?? "⚡"}</span>
                <h3 className="mt-2 font-heading text-base font-extrabold text-white md:mt-6 md:text-lg">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-400 md:mt-3">{step.desc ?? step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14">
        <p className="text-[11px] font-bold uppercase tracking-[0.24em]" style={{ color: agent.colorPrimary }}>Benefits</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {benefits.map((benefit, index) => (
            <div key={`${benefit.title}-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl text-xl" style={{ backgroundColor: `${agent.colorPrimary}22` }}>{benefit.icon ?? "✓"}</div>
              <h3 className="mt-5 font-heading text-lg font-extrabold text-white">{benefit.title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{benefit.desc ?? benefit.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#0c0c12] py-16">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em]" style={{ color: agent.colorPrimary }}>Pricing</p>
          <h2 className="mt-4 font-heading text-5xl font-extrabold tracking-[-1px]" style={{ color: agent.colorPrimary }}>
            {money(agent.monthlyFee)}
            <span className="text-xl text-zinc-500">/month + 18% GST</span>
          </h2>
          <p className="mt-4 text-sm text-zinc-400">
            {money(agent.onboardingFee)} one-time onboarding fee · Set up by our team in 24 hours
          </p>
          <div className="mt-8 grid gap-3 text-left sm:grid-cols-2">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-200">
                <Check className="h-4 w-4 shrink-0" style={{ color: agent.colorPrimary }} />
                <span>{feature}</span>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={openMarketplaceWidget}
            className="mt-8 w-full rounded-full px-6 py-4 text-sm font-extrabold text-black"
            style={{ background: `linear-gradient(135deg, ${agent.colorPrimary}, ${agent.colorSecondary})` }}
          >
            Get started
          </button>
          <p className="mt-4 text-xs text-zinc-500">
            Requires active BGOS subscription · Autopay setup · Cancel anytime · +18% GST on all charges
          </p>
        </div>
      </section>

      <MarketplaceNexaWidget
        agentSlug={agent.slug}
        agentName={agent.name}
        agentColor={agent.colorPrimary}
      />
    </main>
  );
}
