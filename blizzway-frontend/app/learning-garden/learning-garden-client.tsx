"use client";

import { useEffect, useMemo, useState } from "react";

import { BlizzwayBadge, BlizzwayButton, BlizzwayCard, BlizzwayEmptyState, BlizzwayGradientPanel } from "@/components/blizzway";
import { BlizzwayApi, getApiErrorMessage, learningGardenApi, type BlizzwayGrowthBoardResponse, type LearningGardenResponse } from "@/lib/api";
import { agentToLearningCompanion, fallbackLearningCompanions, fallbackStreaks } from "@/lib/blizzway/pathway-data";
import { BlizzwayDashboardShell } from "../dashboard-shell";

type LearningState = {
  board: BlizzwayGrowthBoardResponse;
  learning: LearningGardenResponse | null;
  fallbackLabels: string[];
};

async function optionalLearning(fallbackLabels: string[]) {
  try {
    return await learningGardenApi.getLearningGarden();
  } catch {
    fallbackLabels.push("Learning Garden endpoint");
    return null;
  }
}

export function LearningGardenClient() {
  const [state, setState] = useState<LearningState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadLearning() {
      setLoading(true);
      setError("");
      const fallbackLabels: string[] = [];

      try {
        const [board, learning] = await Promise.all([
          BlizzwayApi.getGrowthBoard(),
          optionalLearning(fallbackLabels),
        ]);
        if (!active) return;
        setState({ board, learning, fallbackLabels });
      } catch (caught) {
        if (!active) return;
        setError(getApiErrorMessage(caught));
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadLearning();

    return () => {
      active = false;
    };
  }, []);

  const companions = useMemo(() => {
    if (!state) return [];
    const boardCompanions = state.board.board.learning.map((item, index) => agentToLearningCompanion(item.agent, index));
    return boardCompanions.length ? boardCompanions : fallbackLearningCompanions;
  }, [state]);

  const streaks = state?.learning
    ? [
        ["Active tracks", `${state.learning.garden.activeCount} active`],
        ["Completed", `${state.learning.garden.completedCount} completed`],
        ["Study streak", `${Math.max(1, state.learning.garden.activeCount + state.learning.garden.completedCount)} day streak`],
      ]
    : fallbackStreaks;

  return (
    <BlizzwayDashboardShell
      activeHref="/learning-garden"
      title="Learning Garden"
      description="A calm, premium learning space for language, exams, skill development, and study streaks."
    >
      {error ? (
        <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">{error}</div>
      ) : null}
      {state?.fallbackLabels.length ? (
        <div className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-sm font-bold text-indigo-700">
          Fallback learning data is active for: {state.fallbackLabels.join(", ")}.
        </div>
      ) : null}

      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.72fr]">
        <BlizzwayGradientPanel>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">Learning companions</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight">Grow skills like a garden, not a grind.</h2>
          <p className="mt-4 max-w-2xl leading-7 text-white/72">
            Active Blizzway companions organize language, exam, and career skills into joyful practice loops.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {streaks.map(([title, value]) => (
              <div key={title} className="rounded-2xl bg-white/14 p-4 ring-1 ring-white/14">
                <p className="font-black">{title}</p>
                <p className="mt-2 text-sm text-white/70">{value}</p>
              </div>
            ))}
          </div>
        </BlizzwayGradientPanel>

        <BlizzwayCard as="section" className="c7-magical-glow">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">NEXA learning note</p>
          <h2 className="mt-3 text-2xl font-black text-slate-950">Practice speaking before polishing documents.</h2>
          <p className="mt-3 text-sm leading-6 c7-muted">
            A confident introduction will make your resume and interviews feel more natural.
          </p>
          <BlizzwayButton href="/magic-market" variant="secondary" className="mt-5">
            Add companion
          </BlizzwayButton>
        </BlizzwayCard>
      </section>

      <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          [0, 1, 2, 3].map((item) => <div key={item} className="h-64 animate-pulse rounded-[22px] bg-white" />)
        ) : companions.length ? (
          companions.map((companion) => (
            <BlizzwayCard key={companion.id} as="article" variant="companion" className="c7-lift-card">
              <BlizzwayBadge tone="cyan">{companion.category}</BlizzwayBadge>
              <h3 className="mt-5 text-xl font-black text-slate-950">{companion.name}</h3>
              <p className="mt-3 text-sm leading-6 c7-muted">{companion.description}</p>
              <div className="mt-5 h-2 rounded-full bg-slate-200">
                <div className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500" style={{ width: companion.progress.includes("%") ? companion.progress : "88%" }} />
              </div>
              <p className="mt-3 text-sm font-black text-slate-700">{companion.progress}</p>
            </BlizzwayCard>
          ))
        ) : (
          <BlizzwayEmptyState title="No active learning companions" description="Add a learning companion from Magic Market to start your garden." />
        )}
      </section>
    </BlizzwayDashboardShell>
  );
}
