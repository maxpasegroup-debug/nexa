"use client";

import { useEffect, useMemo, useState } from "react";

import { Career7Badge, Career7Card, Career7EmptyState, Career7GradientPanel } from "@/components/career7";
import { career7Api, getApiErrorMessage, pathwayApi, type Career7GrowthBoardResponse, type BlizzwayPathwayResponse } from "@/lib/api";
import { boardItemsToMilestones, fallbackGoals, fallbackMilestones, fallbackTimeline } from "@/lib/blizzway/pathway-data";
import { Career7DashboardShell } from "../dashboard-shell";

type PathwayState = {
  board: Career7GrowthBoardResponse;
  pathway: BlizzwayPathwayResponse | null;
  fallbackLabels: string[];
};

async function optionalPathway(fallbackLabels: string[]) {
  try {
    return await pathwayApi.getPathway();
  } catch {
    fallbackLabels.push("long-range pathway endpoint");
    return null;
  }
}

export function MyPathwayClient() {
  const [state, setState] = useState<PathwayState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPathway() {
      setLoading(true);
      setError("");
      const fallbackLabels: string[] = [];

      try {
        const [board, pathway] = await Promise.all([
          career7Api.getGrowthBoard(),
          optionalPathway(fallbackLabels),
        ]);
        if (!active) return;
        setState({ board, pathway, fallbackLabels });
      } catch (caught) {
        if (!active) return;
        setError(getApiErrorMessage(caught));
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadPathway();

    return () => {
      active = false;
    };
  }, []);

  const derived = useMemo(() => {
    if (!state) return null;
    const activeItems = [...state.board.board.learning, ...state.board.board.earning];
    const milestones = boardItemsToMilestones(activeItems);
    const pathwaySteps = state.pathway?.pathway.steps;
    const timeline = pathwaySteps?.length
      ? pathwaySteps.slice(0, 4).map((step, index) => [
          ["Discover", "Grow", "Prove", "Launch"][index] ?? `Step ${index + 1}`,
          step.title,
          step.status,
          `${Math.round(step.progress)}%`,
        ])
      : fallbackTimeline;

    return {
      timeline,
      milestones: milestones.length ? milestones : fallbackMilestones,
      goals: fallbackGoals,
      score: state.pathway?.pathway.progress ?? Math.min(100, 70 + state.board.activeCounts.total * 5),
      activeCount: state.board.activeCounts.total,
    };
  }, [state]);

  return (
    <Career7DashboardShell
      activeHref="/my-pathway"
      title="My Pathway"
      description="A visual pathway timeline for your dreams, milestones, proof, and long-term career vision."
    >
      {error ? (
        <Career7Card as="section" className="mt-5">
          <p className="text-sm font-black text-rose-700">Unable to load pathway data</p>
          <p className="mt-2 text-sm leading-6 c7-muted">{error}</p>
        </Career7Card>
      ) : null}

      {state?.fallbackLabels.length ? (
        <div className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-sm font-bold text-indigo-700">
          Fallback pathway data is active for: {state.fallbackLabels.join(", ")}.
        </div>
      ) : null}

      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.72fr]">
        <Career7GradientPanel>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">Visual pathway timeline</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight">Dream to launch, one calm stage at a time.</h2>
          <div className="mt-8 grid gap-4">
            {loading ? (
              [0, 1, 2, 3].map((item) => (
                <div key={item} className="h-24 animate-pulse rounded-2xl bg-white/14 ring-1 ring-white/14" />
              ))
            ) : derived ? (
              derived.timeline.map(([stage, title, status, progress]) => (
                <div key={`${stage}-${title}`} className="rounded-2xl bg-white/14 p-4 ring-1 ring-white/14">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100">{stage}</p>
                      <p className="mt-1 text-lg font-black">{title}</p>
                    </div>
                    <span className="rounded-full bg-white/16 px-3 py-1 text-xs font-black">{status}</span>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-white/16">
                    <div className="h-2 rounded-full bg-gradient-to-r from-amber-200 via-cyan-200 to-white" style={{ width: progress }} />
                  </div>
                </div>
              ))
            ) : null}
          </div>
        </Career7GradientPanel>

        <Career7Card as="section" className="c7-magical-glow">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">NEXA pathway note</p>
          <h2 className="mt-3 text-2xl font-black text-slate-950">Your proof stage needs one visible win.</h2>
          <p className="mt-3 text-sm leading-6 c7-muted">
            NEXA recommends saving one portfolio proof note today, then linking it to your next role direction.
          </p>
          <div className="mt-6 rounded-2xl bg-cyan-50 p-4">
            <p className="text-sm font-black text-cyan-800">Pathway Score</p>
            <p className="mt-2 text-4xl font-black text-slate-950">{Math.round(derived?.score ?? 0)}%</p>
            <p className="mt-1 text-sm font-semibold text-cyan-800/70">{derived?.activeCount ?? 0} active companions</p>
          </div>
        </Career7Card>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Career7Card as="section">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Milestones</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">Weekly magical markers</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {loading ? (
              [0, 1, 2, 3].map((item) => <div key={item} className="h-28 animate-pulse rounded-2xl bg-slate-100" />)
            ) : derived?.milestones.length ? (
              derived.milestones.map(({ title, tone, status }) => (
                <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <Career7Badge tone="slate">{status}</Career7Badge>
                  <p className="mt-4 font-black text-slate-950">{title}</p>
                  <p className="mt-1 text-sm c7-muted">{tone}</p>
                </div>
              ))
            ) : (
              <Career7EmptyState title="No milestones yet" description="Add a companion to your Growth Board to create pathway milestones." />
            )}
          </div>
        </Career7Card>

        <Career7Card as="section">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Vision goals</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">6 months to 5 years</h2>
            </div>
            <Career7Badge tone="slate">Fallback</Career7Badge>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {(derived?.goals ?? fallbackGoals).map(({ time, description }) => (
              <div key={time} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <p className="text-lg font-black text-slate-950">{time}</p>
                <p className="mt-2 text-sm leading-6 c7-muted">{description}</p>
              </div>
            ))}
          </div>
        </Career7Card>
      </section>
    </Career7DashboardShell>
  );
}
