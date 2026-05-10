"use client";

import { useEffect, useMemo, useState } from "react";

import { BlizzwayBadge, BlizzwayButton, BlizzwayCard, BlizzwayEmptyState, BlizzwayGradientPanel } from "@/components/blizzway";
import { BlizzwayApi, earningUniverseApi, getApiErrorMessage, type BlizzwayGrowthBoardResponse, type EarningUniverseResponse } from "@/lib/api";
import { agentToEarningOpportunity, fallbackOpportunities, fallbackPipeline, fallbackTrackers } from "@/lib/blizzway/pathway-data";
import { BlizzwayDashboardShell } from "../dashboard-shell";

type EarningState = {
  board: BlizzwayGrowthBoardResponse;
  earning: EarningUniverseResponse | null;
  fallbackLabels: string[];
};

async function optionalEarning(fallbackLabels: string[]) {
  try {
    return await earningUniverseApi.getEarningUniverse();
  } catch {
    fallbackLabels.push("Earning Universe endpoint");
    return null;
  }
}

export function EarningUniverseClient() {
  const [state, setState] = useState<EarningState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadEarning() {
      setLoading(true);
      setError("");
      const fallbackLabels: string[] = [];

      try {
        const [board, earning] = await Promise.all([
          BlizzwayApi.getGrowthBoard(),
          optionalEarning(fallbackLabels),
        ]);
        if (!active) return;
        setState({ board, earning, fallbackLabels });
      } catch (caught) {
        if (!active) return;
        setError(getApiErrorMessage(caught));
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadEarning();

    return () => {
      active = false;
    };
  }, []);

  const opportunities = useMemo(() => {
    if (!state) return [];
    const boardOpportunities = state.board.board.earning.map((item) => agentToEarningOpportunity(item.agent));
    if (state.earning?.universe.opportunities.length) {
      return state.earning.universe.opportunities.map((item) => ({
        title: item.title,
        type: item.category,
        fit: item.status,
        value: item.estimatedValue ? `$${item.estimatedValue}` : "Suggested",
      }));
    }

    return boardOpportunities.length ? boardOpportunities : fallbackOpportunities;
  }, [state]);

  const pipeline = state?.earning
    ? [
        ["Suggested", state.earning.universe.opportunities.filter((item) => item.status === "suggested").length.toString()],
        ["Saved", state.earning.universe.opportunities.filter((item) => item.status === "saved").length.toString()],
        ["Active", state.earning.universe.activeCount.toString()],
        ["Completed", state.earning.universe.completedCount.toString()],
      ]
    : fallbackPipeline;

  const activeCompanions = state?.board.board.earning.length ?? 0;
  const trackers = state?.earning
    ? [
        ["Money discipline", `${Math.min(100, 60 + state.earning.universe.completedCount * 8)}%`, "Weekly savings and spending awareness."],
        ["Earning goal", `${Math.min(100, 45 + state.earning.universe.activeCount * 10)}%`, "First meaningful project pathway."],
        ["Opportunity rhythm", `${Math.min(100, 55 + state.earning.universe.opportunities.length * 5)}%`, "Regular opportunity reviews."],
      ]
    : fallbackTrackers;

  return (
    <BlizzwayDashboardShell
      activeHref="/earning-universe"
      title="Earning Universe"
      description="Opportunity boards for jobs, freelance work, money discipline, and earning goals."
    >
      {error ? (
        <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">{error}</div>
      ) : null}
      {state?.fallbackLabels.length ? (
        <div className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-sm font-bold text-indigo-700">
          Fallback earning data is active for: {state.fallbackLabels.join(", ")}.
        </div>
      ) : null}

      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.72fr]">
        <BlizzwayGradientPanel>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">Opportunity pipeline</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight">Turn proof into earning momentum.</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            {pipeline.map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-white/14 p-4 ring-1 ring-white/14">
                <p className="text-sm text-white/70">{label}</p>
                <p className="mt-2 text-3xl font-black">{value}</p>
              </div>
            ))}
          </div>
        </BlizzwayGradientPanel>

        <BlizzwayCard as="section" className="c7-magical-glow">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">NEXA earning note</p>
          <h2 className="mt-3 text-2xl font-black text-slate-950">Package one skill into one small offer.</h2>
          <p className="mt-3 text-sm leading-6 c7-muted">
            Start with a simple service idea before chasing every opportunity.
          </p>
          <div className="mt-5 rounded-2xl bg-amber-50 p-4">
            <p className="text-sm font-black text-amber-800">{activeCompanions} active earning companions</p>
          </div>
          <BlizzwayButton href="/magic-market" variant="secondary" className="mt-5">
            Add companion
          </BlizzwayButton>
        </BlizzwayCard>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.8fr]">
        <BlizzwayCard as="section">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Job and freelance opportunities</p>
          <div className="mt-6 grid gap-3">
            {loading ? (
              [0, 1, 2].map((item) => <div key={item} className="h-24 animate-pulse rounded-2xl bg-slate-100" />)
            ) : opportunities.length ? (
              opportunities.map(({ title, type, fit, value }) => (
                <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-black text-slate-950">{title}</p>
                      <p className="mt-1 text-sm c7-muted">{type} - {value}</p>
                    </div>
                    <BlizzwayBadge tone="emerald">{fit}</BlizzwayBadge>
                  </div>
                </div>
              ))
            ) : (
              <BlizzwayEmptyState title="No earning opportunities yet" description="Add earning companions to build your opportunity pipeline." />
            )}
          </div>
        </BlizzwayCard>

        <div className="grid gap-4">
          {trackers.map(([title, value, description]) => (
            <BlizzwayCard key={title} as="section">
              <p className="font-black text-slate-950">{title}</p>
              <p className="mt-2 text-sm c7-muted">{description}</p>
              <div className="mt-4 h-3 rounded-full bg-slate-200">
                <div className="h-3 rounded-full bg-gradient-to-r from-amber-300 via-cyan-300 to-purple-500" style={{ width: value }} />
              </div>
              <p className="mt-2 text-sm font-black text-slate-700">{value}</p>
            </BlizzwayCard>
          ))}
        </div>
      </section>
    </BlizzwayDashboardShell>
  );
}
