"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, BadgePercent, Bot, Clock, Sparkles } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { InstallModal } from "./agent-landing-page";
import type { AgentInstallationView, AgentOfferView, MarketplaceAgentView } from "./types";
import {
  categoryLabel,
  filters,
  money,
  recommendationFor,
  shortDescription,
} from "./marketplace-utils";

type BossMarketplacePageProps = {
  user: { id: string; name: string; email: string; role: string };
  business: { id: string; name: string; type: string };
  agents: MarketplaceAgentView[];
  installations: AgentInstallationView[];
  offers: AgentOfferView[];
};

function countdownLabel(seconds?: number | null) {
  if (!seconds) return null;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 24) return `${Math.floor(hours / 24)} days left`;
  return `${hours}h ${minutes}m left`;
}

function BossAgentCard({
  agent,
  installed,
  onInstall,
}: {
  agent: MarketplaceAgentView;
  installed?: AgentInstallationView;
  onInstall: (agent: MarketplaceAgentView) => void;
}) {
  return (
    <div
      className="flex min-h-[250px] flex-col rounded-2xl border border-white/10 p-5"
      style={{ background: agent.gradient }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: agent.colorPrimary }}>
            {categoryLabel(agent.category)}
          </p>
          <div className="mt-4 text-[28px]">{agent.icon}</div>
        </div>
        {installed ? (
          <span className="rounded-full border border-[#22D9A0]/30 bg-[#22D9A0]/10 px-2.5 py-1 text-[10px] font-bold text-[#22D9A0]">
            Installed
          </span>
        ) : null}
      </div>
      <div className="mt-5 flex-1">
        <h3 className="font-heading text-lg font-extrabold text-white">{agent.name}</h3>
        <p className="mt-1 truncate text-xs font-bold" style={{ color: agent.colorPrimary }}>
          {agent.tagline}
        </p>
        <p className="mt-3 line-clamp-2 text-[11px] leading-5 text-zinc-400">
          {shortDescription(agent)}
        </p>
      </div>
      <div className="mt-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] text-zinc-500">{money(agent.onboardingFee)} setup</p>
          <p className="font-heading text-base font-extrabold" style={{ color: agent.colorPrimary }}>
            {money(agent.monthlyFee)}/mo
          </p>
        </div>
        {installed ? (
          <Link href={`/marketplace/${agent.slug}`} className="rounded-full border border-white/10 px-3 py-2 text-xs font-bold text-white">
            View
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => onInstall(agent)}
            className="rounded-full bg-white px-3 py-2 text-xs font-extrabold text-black"
          >
            Install
          </button>
        )}
      </div>
    </div>
  );
}

export function BossMarketplacePage({
  user,
  business,
  agents,
  installations: initialInstallations,
  offers,
}: BossMarketplacePageProps) {
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [installations, setInstallations] = useState(initialInstallations);
  const [installingAgent, setInstallingAgent] = useState<MarketplaceAgentView | null>(null);

  const installationByAgent = useMemo(
    () => new Map(installations.map((installation) => [installation.agentId, installation])),
    [installations],
  );
  const recommendedSlug = recommendationFor(business.type);
  const recommendedAgent = agents.find((agent) => agent.slug === recommendedSlug) ?? agents[0];
  const filteredAgents =
    activeFilter === "ALL"
      ? agents
      : agents.filter((agent) => agent.category === activeFilter);
  const featuredOffer = offers[0];

  function markInstalled(agent: MarketplaceAgentView, status: string) {
    setInstallations((current) => [
      ...current,
      {
        id: `pending-${agent.id}`,
        agentId: agent.id,
        businessId: business.id,
        status,
        onboardingFeePaid: status === "PAYMENT_DONE",
        monthlyFeePaid: false,
        isWhitelabeled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        agent,
      },
    ]);
  }

  return (
    <div className="min-h-screen bg-[#070709] pl-[240px] text-white">
      <Sidebar role={user.role} userName={user.name} businessName={business.name} />
      <Navbar title="Marketplace" userName={user.name} role={user.role} />

      <main className="pt-[60px]">
        <div className="space-y-8 p-8">
          <section className="overflow-hidden rounded-2xl border border-[#7C6FFF]/30 bg-[#7C6FFF]/10 p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#7C6FFF]/20 text-[#c8c2ff]">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#c8c2ff]">
                    NEXA recommendation
                  </p>
                  <h1 className="mt-2 font-heading text-2xl font-extrabold text-white">
                    Based on your {business.type || "business"} setup I recommend {recommendedAgent?.name}
                  </h1>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-300">
                    {recommendedAgent
                      ? `${recommendedAgent.name} will help with ${recommendedAgent.tagline.toLowerCase()} ${money(recommendedAgent.onboardingFee)} setup + ${money(recommendedAgent.monthlyFee)}/mo.`
                      : "Browse agents below and install the right automation for your workspace."}
                  </p>
                </div>
              </div>
              {recommendedAgent ? (
                <button
                  type="button"
                  onClick={() => setInstallingAgent(recommendedAgent)}
                  className="rounded-full bg-white px-5 py-3 text-sm font-extrabold text-black"
                >
                  Install recommendation
                </button>
              ) : null}
            </div>
          </section>

          {featuredOffer ? (
            <section className="flex flex-col gap-4 rounded-2xl border border-[#7C6FFF]/30 bg-gradient-to-r from-[#21165d] to-[#111118] p-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <BadgePercent className="h-8 w-8 text-[#c8c2ff]" />
                <div>
                  <h2 className="font-heading text-lg font-extrabold text-white">{featuredOffer.name}</h2>
                  <p className="text-sm text-zinc-300">{featuredOffer.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {countdownLabel(featuredOffer.secondsUntilExpiry) ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs font-bold text-white">
                    <Clock className="h-3.5 w-3.5" /> {countdownLabel(featuredOffer.secondsUntilExpiry)}
                  </span>
                ) : null}
                <Link href="/marketplace" className="rounded-full bg-white px-4 py-2 text-xs font-extrabold text-black">
                  View offer
                </Link>
              </div>
            </section>
          ) : null}

          <section>
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#22D9A0]" />
              <h2 className="font-heading text-xl font-extrabold">My agents</h2>
            </div>
            {installations.length > 0 ? (
              <div className="grid gap-4 lg:grid-cols-3">
                {installations.map((installation) => (
                  <div key={installation.id} className="rounded-2xl border border-white/10 bg-[#13131c] p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{installation.agent.icon}</span>
                        <div>
                          <h3 className="font-heading font-extrabold text-white">{installation.agent.name}</h3>
                          <p className="text-xs text-zinc-500">{money(installation.agent.monthlyFee)}/mo</p>
                        </div>
                      </div>
                      <span className="rounded-full border border-[#22D9A0]/30 bg-[#22D9A0]/10 px-2.5 py-1 text-[10px] font-bold text-[#22D9A0]">
                        {installation.status}
                      </span>
                    </div>
                    <Link href={`/marketplace/${installation.agent.slug}`} className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-[#7C6FFF]">
                      Manage <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-[#13131c] p-6 text-sm text-zinc-400">
                Browse the marketplace below.
              </div>
            )}
          </section>

          <section>
            <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="font-heading text-xl font-extrabold">Browse agents</h2>
                <p className="mt-1 text-sm text-zinc-500">Install new capabilities into your BGOS workspace.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setActiveFilter(filter.value)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
                      activeFilter === filter.value
                        ? "border-[#7C6FFF] bg-[#7C6FFF] text-white"
                        : "border-white/10 bg-white/[0.03] text-zinc-400"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-3">
              {filteredAgents.map((agent) => (
                <BossAgentCard
                  key={agent.id}
                  agent={agent}
                  installed={installationByAgent.get(agent.id)}
                  onInstall={setInstallingAgent}
                />
              ))}
            </div>
          </section>
        </div>
      </main>

      {installingAgent ? (
        <InstallModal
          agent={installingAgent}
          businessId={business.id}
          onClose={() => setInstallingAgent(null)}
          onInstalled={(status) => {
            markInstalled(installingAgent, status);
            setInstallingAgent(null);
          }}
        />
      ) : null}
    </div>
  );
}
