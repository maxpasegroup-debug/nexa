"use client";

import { useEffect, useMemo, useState } from "react";

import {
  BlizzwayBadge,
  BlizzwayButton,
  BlizzwayCard,
  BlizzwayEmptyState,
  BlizzwayGradientPanel,
} from "@/components/blizzway";
import {
  BlizzwayApi,
  getApiErrorMessage,
  pathwayApi,
  type BlizzwayGrowthBoardResponse,
  type BlizzwayPathwayGamification,
  type BlizzwayPathwayResponse,
} from "@/lib/api";
import { boardItemsToMilestones, fallbackMilestones, fallbackTimeline } from "@/lib/blizzway/pathway-data";
import { BlizzwayDashboardShell } from "../dashboard-shell";

type PathwayState = {
  board: BlizzwayGrowthBoardResponse;
  pathway: BlizzwayPathwayResponse | null;
  gamification: BlizzwayPathwayGamification | null;
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

async function optionalGamification(fallbackLabels: string[]) {
  try {
    return (await pathwayApi.getGamification()).gamification;
  } catch {
    fallbackLabels.push("gamification endpoint");
    return null;
  }
}

function progressWidth(value: number) {
  return `${Math.max(0, Math.min(100, Math.round(value)))}%`;
}

export function MyPathwayClient() {
  const [state, setState] = useState<PathwayState | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState("");
  const [error, setError] = useState("");
  const [celebration, setCelebration] = useState("");

  async function loadPathway() {
    setLoading(true);
    setError("");
    const fallbackLabels: string[] = [];

    try {
      const [board, pathway, gamification] = await Promise.all([
        BlizzwayApi.getGrowthBoard(),
        optionalPathway(fallbackLabels),
        optionalGamification(fallbackLabels),
      ]);
      setState({ board, pathway, gamification, fallbackLabels });
    } catch (caught) {
      setError(getApiErrorMessage(caught));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");
      const fallbackLabels: string[] = [];

      try {
        const [board, pathway, gamification] = await Promise.all([
          BlizzwayApi.getGrowthBoard(),
          optionalPathway(fallbackLabels),
          optionalGamification(fallbackLabels),
        ]);
        if (active) setState({ board, pathway, gamification, fallbackLabels });
      } catch (caught) {
        if (active) setError(getApiErrorMessage(caught));
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  async function completeQuest(questKey: string) {
    setBusyKey(questKey);
    setError("");
    try {
      const response = await pathwayApi.completeQuest(questKey, { source: "my_pathway" });
      setState((current) => current ? { ...current, gamification: response.gamification } : current);
      setCelebration(response.quest.duplicate ? "Quest already completed." : `Quest complete: +${response.quest.xpAwarded} XP`);
    } catch (caught) {
      setError(getApiErrorMessage(caught));
    } finally {
      setBusyKey("");
    }
  }

  async function claimReward(achievementKey: string) {
    setBusyKey(achievementKey);
    setError("");
    try {
      const response = await pathwayApi.claimAchievement(achievementKey);
      setState((current) => current ? { ...current, gamification: response.gamification } : current);
      setCelebration(response.achievement.duplicate ? "Reward already claimed." : `Reward claimed: +${response.achievement.rewardCredits} credits`);
    } catch (caught) {
      setError(getApiErrorMessage(caught));
    } finally {
      setBusyKey("");
    }
  }

  async function checkIn() {
    setBusyKey("streak");
    setError("");
    try {
      const response = await pathwayApi.checkInStreak();
      setState((current) => current ? { ...current, gamification: response.gamification } : current);
      setCelebration(response.streak.duplicate ? "Today already checked in." : "Pathway streak checked in.");
    } catch (caught) {
      setError(getApiErrorMessage(caught));
    } finally {
      setBusyKey("");
    }
  }

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
          progressWidth(step.progress),
        ])
      : fallbackTimeline;

    return {
      timeline,
      milestones: milestones.length ? milestones : fallbackMilestones,
      score: state.pathway?.pathway.progress ?? Math.min(100, 70 + state.board.activeCounts.total * 5),
      activeCount: state.board.activeCounts.total,
      gamification: state.gamification,
    };
  }, [state]);

  const gamification = derived?.gamification ?? null;
  const claimableAchievements = gamification?.achievements.filter((item) => item.claimable) ?? [];
  const unlockedAchievements = gamification?.achievements.filter((item) => item.status !== "locked") ?? [];

  return (
    <BlizzwayDashboardShell
      activeHref="/my-pathway"
      title="My Pathway"
      description="A magical career quest map for milestones, quests, XP, streaks, achievements, and platform credit rewards."
    >
      {error ? (
        <BlizzwayCard as="section" className="mt-5">
          <p className="text-sm font-black text-rose-700">Unable to load pathway data</p>
          <p className="mt-2 text-sm leading-6 c7-muted">{error}</p>
          <BlizzwayButton type="button" onClick={() => void loadPathway()} variant="secondary" size="sm" className="mt-4">
            Try again
          </BlizzwayButton>
        </BlizzwayCard>
      ) : null}

      {celebration ? (
        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-black text-amber-800">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-500" />
          </span>
          {celebration}
        </div>
      ) : null}

      {state?.fallbackLabels.length ? (
        <div className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-sm font-bold text-indigo-700">
          Fallback pathway data is active for: {state.fallbackLabels.join(", ")}.
        </div>
      ) : null}

      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.72fr]">
        <BlizzwayGradientPanel>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">Magical career quest</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight">
            {gamification ? `Level ${gamification.progress.currentLevel}: ${gamification.progress.currentLevelTitle}` : "Dream to launch, one calm stage at a time."}
          </h2>
          <div className="mt-6 rounded-2xl bg-white/14 p-4 ring-1 ring-white/14">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-black text-white/82">{gamification?.progress.totalXp ?? 0} XP earned</p>
              <p className="text-sm font-black text-white/82">{gamification?.progress.levelXp ?? 0}/{gamification?.progress.nextLevelXp ?? 100}</p>
            </div>
            <div className="mt-3 h-3 rounded-full bg-white/16">
              <div className="h-3 rounded-full bg-gradient-to-r from-amber-200 via-cyan-200 to-white transition-all" style={{ width: progressWidth(gamification?.progress.progress ?? 0) }} />
            </div>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {loading ? (
              [0, 1, 2, 3, 4, 5].map((item) => <div key={item} className="h-24 animate-pulse rounded-2xl bg-white/14 ring-1 ring-white/14" />)
            ) : gamification ? (
              gamification.levels.map((level) => (
                <div key={level.key} className="rounded-2xl bg-white/14 p-4 ring-1 ring-white/14">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100">Level {level.level}</p>
                  <p className="mt-2 font-black">{level.title}</p>
                  <span className="mt-3 inline-flex rounded-full bg-white/16 px-3 py-1 text-xs font-black">{level.status}</span>
                </div>
              ))
            ) : null}
          </div>
        </BlizzwayGradientPanel>

        <BlizzwayCard as="section" className="c7-magical-glow">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">NEXA Guardian Angel</p>
          <h2 className="mt-3 text-2xl font-black text-slate-950">
            {gamification?.nextQuest?.title ?? "Your next quest will appear here."}
          </h2>
          <p className="mt-3 text-sm leading-6 c7-muted">
            {gamification?.nextQuest?.nexaNote ?? "Complete onboarding or refresh your pathway to let NEXA choose the next safe growth action."}
          </p>
          <div className="mt-6 rounded-2xl bg-cyan-50 p-4">
            <p className="text-sm font-black text-cyan-800">Pathway Score</p>
            <p className="mt-2 text-4xl font-black text-slate-950">{Math.round(derived?.score ?? 0)}%</p>
            <p className="mt-1 text-sm font-semibold text-cyan-800/70">{derived?.activeCount ?? 0} active companions</p>
          </div>
          <div className="mt-4 rounded-2xl bg-amber-50 p-4">
            <p className="text-sm font-black text-amber-800">Streak</p>
            <p className="mt-2 text-3xl font-black text-slate-950">{gamification?.streak.currentCount ?? 0} days</p>
            <BlizzwayButton type="button" onClick={() => void checkIn()} disabled={busyKey === "streak" || gamification?.streak.checkedInToday} variant="dark" size="sm" className="mt-4">
              {gamification?.streak.checkedInToday ? "Checked in" : "Check in"}
            </BlizzwayButton>
          </div>
        </BlizzwayCard>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <BlizzwayCard as="section">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Quest board</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">Starter quests</h2>
            </div>
            <BlizzwayBadge tone="cyan">{gamification?.quests.filter((item) => item.status === "completed").length ?? 0} complete</BlizzwayBadge>
          </div>
          <div className="mt-6 grid gap-3">
            {loading ? (
              [0, 1, 2, 3].map((item) => <div key={item} className="h-24 animate-pulse rounded-2xl bg-slate-100" />)
            ) : gamification?.quests.length ? (
              gamification.quests.map((quest) => (
                <div key={quest.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <BlizzwayBadge tone={quest.status === "completed" ? "emerald" : "slate"}>{quest.status}</BlizzwayBadge>
                        <BlizzwayBadge tone="purple">+{quest.xpReward} XP</BlizzwayBadge>
                      </div>
                      <p className="mt-3 font-black text-slate-950">{quest.title}</p>
                      <p className="mt-1 text-sm leading-6 c7-muted">{quest.description}</p>
                    </div>
                    <BlizzwayButton
                      type="button"
                      onClick={() => void completeQuest(quest.key)}
                      disabled={quest.status === "completed" || busyKey === quest.key}
                      variant={quest.status === "completed" ? "secondary" : "dark"}
                      size="sm"
                      className="shrink-0"
                    >
                      {quest.status === "completed" ? "Done" : "Complete"}
                    </BlizzwayButton>
                  </div>
                </div>
              ))
            ) : (
              <BlizzwayEmptyState title="No quests yet" description="NEXA will create starter quests after BGOS returns gamification data." />
            )}
          </div>
        </BlizzwayCard>

        <BlizzwayCard as="section">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Achievements</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">Badges and rewards</h2>
            </div>
            <BlizzwayBadge tone="emerald">{claimableAchievements.length} claimable</BlizzwayBadge>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {loading ? (
              [0, 1, 2, 3].map((item) => <div key={item} className="h-32 animate-pulse rounded-2xl bg-slate-100" />)
            ) : gamification?.achievements.length ? (
              gamification.achievements.map((achievement) => (
                <div key={achievement.key} className={`rounded-2xl border p-4 ${achievement.status === "locked" ? "border-slate-200 bg-slate-50" : "border-amber-200 bg-amber-50"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <BlizzwayBadge tone={achievement.status === "locked" ? "slate" : achievement.status === "claimed" ? "emerald" : "purple"}>
                        {achievement.status}
                      </BlizzwayBadge>
                      <p className="mt-3 font-black text-slate-950">{achievement.title}</p>
                      <p className="mt-1 text-sm leading-6 c7-muted">{achievement.description}</p>
                    </div>
                    <p className="shrink-0 text-sm font-black text-slate-950">+{achievement.rewardCredits}</p>
                  </div>
                  {achievement.claimable ? (
                    <BlizzwayButton type="button" onClick={() => void claimReward(achievement.key)} disabled={busyKey === achievement.key} variant="dark" size="sm" className="mt-4">
                      Claim credits
                    </BlizzwayButton>
                  ) : null}
                </div>
              ))
            ) : (
              <BlizzwayEmptyState title="No achievements yet" description="Complete quests to unlock meaningful badges and platform credit rewards." />
            )}
          </div>
        </BlizzwayCard>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <BlizzwayCard as="section">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Milestones</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">Weekly magical markers</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {loading ? (
              [0, 1, 2, 3].map((item) => <div key={item} className="h-28 animate-pulse rounded-2xl bg-slate-100" />)
            ) : derived?.milestones.length ? (
              derived.milestones.map(({ title, tone, status }) => (
                <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <BlizzwayBadge tone="slate">{status}</BlizzwayBadge>
                  <p className="mt-4 font-black text-slate-950">{title}</p>
                  <p className="mt-1 text-sm c7-muted">{tone}</p>
                </div>
              ))
            ) : (
              <BlizzwayEmptyState title="No milestones yet" description="Add a companion to your Growth Board to create pathway milestones." />
            )}
          </div>
        </BlizzwayCard>

        <BlizzwayCard as="section">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Reward wallet</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">Platform credits only</h2>
            </div>
            <BlizzwayBadge tone="slate">{gamification?.rewards.walletCredits ?? 0} credits</BlizzwayBadge>
          </div>
          <p className="mt-4 text-sm leading-6 c7-muted">
            Achievements reward Blizzway platform credits. They do not promise jobs, admissions, visas, scholarships, income, test outcomes, or migration results.
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {(claimableAchievements.length ? claimableAchievements : unlockedAchievements.slice(0, 4)).map((achievement) => (
              <div key={achievement.key} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <p className="font-black text-slate-950">{achievement.title}</p>
                <p className="mt-2 text-sm leading-6 c7-muted">{achievement.claimable ? "Ready to claim" : achievement.status}</p>
                <p className="mt-3 text-lg font-black text-indigo-700">+{achievement.rewardCredits} credits</p>
              </div>
            ))}
            {!claimableAchievements.length && !unlockedAchievements.length ? (
              <BlizzwayEmptyState title="No rewards yet" description="Complete a quest to unlock your first pathway badge." />
            ) : null}
          </div>
        </BlizzwayCard>
      </section>
    </BlizzwayDashboardShell>
  );
}
