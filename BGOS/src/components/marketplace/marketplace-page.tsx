"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ExternalLink } from "lucide-react";

import { NexaCaptureWidget } from "@/components/landing/nexa-capture-widget";
import type { MarketplaceAgentView } from "./types";
import {
  categoryLabel,
  filters,
  modeLabel,
  money,
  positioningFor,
} from "./marketplace-utils";

type MarketplacePageProps = {
  initialAgents?: MarketplaceAgentView[];
};

type AgentResponse = {
  agents: MarketplaceAgentView[];
  featured: MarketplaceAgentView | null;
};

declare global {
  interface Window {
    openNexaWidget?: () => void;
    openMarketplaceWidget?: () => void;
  }
}

function openNexa() {
  if (typeof window === "undefined") return;
  if (window.innerWidth < 768 && window.openMobileNexaChat) {
    window.openMobileNexaChat();
    return;
  }
  if (window.openNexaWidget) {
    window.openNexaWidget();
    return;
  }
  window.openMarketplaceWidget?.();
}

function ChannelMockup() {
  const rows = [
    ["WhatsApp", 138, "#25D366", "86%"],
    ["Instagram", 74, "#E4405F", "58%"],
    ["Facebook", 51, "#1877F2", "43%"],
    ["Email", 39, "#7C6FFF", "32%"],
    ["SMS", 24, "#F5A623", "22%"],
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-5 shadow-2xl shadow-black/30">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Live leads</p>
          <p className="font-heading text-3xl font-extrabold tracking-normal text-white">326</p>
        </div>
        <div className="rounded-full border border-[#22D9A0]/30 bg-[#22D9A0]/10 px-3 py-1 text-[11px] font-bold text-[#22D9A0]">
          +31 today
        </div>
      </div>
      <div className="space-y-4">
        {rows.map(([name, count, color, width]) => (
          <div key={name}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-zinc-300">{name}</span>
              <span className="font-bold text-white">{count}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full"
                style={{ width: String(width), backgroundColor: String(color) }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AgentCard({ agent }: { agent: MarketplaceAgentView }) {
  const positioning = positioningFor(agent);

  return (
    <Link
      href={`/marketplace/${agent.slug}`}
      className="group flex min-h-[210px] flex-col rounded-2xl border border-white/10 p-4 transition hover:-translate-y-1 hover:border-white/20 md:min-h-[236px] md:p-5"
      style={{
        background:
          agent.gradient ||
          `linear-gradient(135deg, ${agent.colorPrimary}22, rgba(10,10,15,0.96))`,
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className="text-[10px] font-bold uppercase tracking-[0.22em]"
            style={{ color: agent.colorPrimary }}
          >
            {categoryLabel(agent.category)}
          </p>
          <div className="mt-4 text-2xl leading-none md:text-[28px]">{agent.icon}</div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-bold text-zinc-200">
            {modeLabel(agent)}
          </span>
          {agent.installed ? (
            <span className="rounded-full border border-[#22D9A0]/30 bg-[#22D9A0]/10 px-2.5 py-1 text-[10px] font-bold text-[#22D9A0]">
              Installed
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-5 min-h-0 flex-1">
        <h3 className="font-heading text-[15px] font-extrabold tracking-normal text-white md:text-lg">
          {agent.name}
        </h3>
        <p className="mt-1 text-xs font-bold" style={{ color: agent.colorPrimary }}>
          {positioning.problem}
        </p>
        <p className="mt-3 line-clamp-2 text-[11px] leading-5 text-zinc-300">
          {positioning.does}
        </p>
        <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
          {positioning.setup}
        </p>
      </div>

      <div className="mt-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] text-zinc-500">{money(agent.onboardingFee)} setup</p>
          <p
            className="font-heading text-base font-extrabold tracking-normal"
            style={{ color: agent.colorPrimary }}
          >
            {money(agent.monthlyFee)}/mo
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-2 text-xs font-bold text-white transition group-hover:bg-white group-hover:text-black">
          View <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}

export function MarketplacePage({ initialAgents = [] }: MarketplacePageProps) {
  const [agents, setAgents] = useState(initialAgents);
  const [loading, setLoading] = useState(initialAgents.length === 0);
  const [activeFilter, setActiveFilter] = useState("ALL");

  useEffect(() => {
    async function loadAgents() {
      setLoading(true);
      const response = await fetch("/api/marketplace/agents", { cache: "no-store" });
      setLoading(false);
      if (!response.ok) return;
      const data = (await response.json()) as AgentResponse;
      setAgents(data.agents);
    }

    void loadAgents();
  }, []);

  const filteredAgents = useMemo(
    () =>
      activeFilter === "ALL"
        ? agents
        : agents.filter((agent) => agent.category === activeFilter),
    [activeFilter, agents],
  );
  const featured = agents.find((agent) => agent.slug === "sales-booster") ?? agents.find((agent) => agent.isFeatured);
  const featuredPositioning = featured ? positioningFor(featured) : null;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#070709] text-white">
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-[#070709]/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <Link href="/" className="font-heading text-xl font-extrabold tracking-normal">
            <span>BG</span>
            <span className="text-[#7C6FFF]">OS</span>
          </Link>
          <p className="hidden text-sm text-zinc-500 sm:block">Marketplace</p>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="hidden items-center gap-1 text-sm font-semibold text-zinc-400 transition hover:text-white md:inline-flex"
            >
              Back to bgos.online <ExternalLink className="h-3.5 w-3.5" />
            </Link>
            <button
              type="button"
              onClick={openNexa}
              className="rounded-full bg-white px-4 py-2 text-sm font-bold text-black transition hover:bg-[#22D9A0]"
            >
              Get your workspace →
            </button>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-4 pb-10 pt-12 md:px-5 md:pb-16 md:pt-24">
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#7C6FFF]">
          BGOS MARKETPLACE
        </p>
        <div className="mt-5 max-w-4xl">
          <h1 className="font-heading text-[28px] font-extrabold leading-[1.05] tracking-normal text-white md:text-[56px]">
            AI agents for your business
          </h1>
          <p className="mt-4 line-clamp-2 max-w-2xl text-sm font-light leading-6 text-zinc-400 md:mt-5 md:text-base md:leading-7">
            Plug-and-play agents built for your industry. Our team sets up every agent in 24 hours. Autopay - cancel anytime.
          </p>
        </div>

        <div className="mt-7 flex gap-2 overflow-x-auto scroll-x-hidden md:mt-9 md:flex-wrap md:overflow-visible">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setActiveFilter(filter.value)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition ${
                activeFilter === filter.value
                  ? "border-[#7C6FFF] bg-[#7C6FFF] text-white"
                  : "border-white/10 bg-white/[0.03] text-zinc-400 hover:text-white"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </section>

      {featured ? (
        <section className="mx-auto max-w-7xl px-5 pb-10">
          <Link
            href={`/marketplace/${featured.slug}`}
            className="grid overflow-hidden rounded-3xl border border-white/10 p-5 transition hover:border-[#7C6FFF]/50 md:grid-cols-[1.1fr_0.9fr] md:p-8"
            style={{ background: featured.gradient }}
          >
            <div className="flex flex-col justify-center">
              <span className="mb-5 w-fit rounded-full border border-[#22D9A0]/30 bg-[#22D9A0]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#22D9A0]">
                Recommended
              </span>
              <h2 className="font-heading text-[28px] font-extrabold tracking-normal text-transparent md:text-5xl" style={{ backgroundImage: `linear-gradient(135deg, ${featured.colorPrimary}, ${featured.colorSecondary})`, WebkitBackgroundClip: "text" }}>
                {featured.name}
              </h2>
              <p className="mt-3 text-xl font-semibold text-white">
                {featuredPositioning?.problem ?? featured.tagline}
              </p>
              <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-300">
                {featuredPositioning?.does ?? featured.description}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["WhatsApp", "Instagram", "Facebook", "Email", "SMS"].map((item) => (
                  <span key={item} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-zinc-200">
                    {item}
                  </span>
                ))}
              </div>
              <div className="mt-7 flex flex-wrap items-end gap-5">
                <div>
                  <p className="text-xs text-zinc-500">Onboarding</p>
                  <p className="font-heading text-2xl font-extrabold text-white">{money(featured.onboardingFee)}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Monthly</p>
                  <p className="font-heading text-2xl font-extrabold text-[#22D9A0]">{money(featured.monthlyFee)}/mo</p>
                </div>
              </div>
              <span className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-extrabold text-black md:w-fit">
                View Sales Booster <ArrowRight className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-8 md:mt-0">
              <ChannelMockup />
            </div>
          </Link>
        </section>
      ) : null}

      <section className="mx-auto max-w-7xl px-5 pb-10">
        <button
          type="button"
          onClick={openNexa}
          className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-left transition hover:border-[#7C6FFF]/50 hover:bg-white/[0.06]"
        >
          <span>
            <span className="block text-sm font-extrabold text-white">
              Questions? Chat with our team →
            </span>
            <span className="mt-1 block text-xs text-zinc-500">
              Tell NEXA what you need and we will route you to the right person.
            </span>
          </span>
          <ArrowRight className="h-4 w-4 shrink-0 text-[#7C6FFF]" />
        </button>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20">
        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-sm text-zinc-400">
            Loading marketplace agents...
          </div>
        ) : (
          <div className="marketplace-agent-grid grid grid-cols-2 gap-3.5 max-[400px]:grid-cols-1 xl:grid-cols-3">
            {filteredAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        )}
      </section>

      <NexaCaptureWidget />
    </main>
  );
}
