"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { BlizzwayBadge, BlizzwayButton, BlizzwayCard, BlizzwayGradientPanel } from "@/components/blizzway";
import {
  BlizzwayApi,
  earningUniverseApi,
  getApiErrorMessage,
  learningGardenApi,
  nexaApi,
  pathwayApi,
  sessionApi,
  soulVaultApi,
  type BgosSessionResponse,
  type BlizzwayGrowthBoardResponse,
  type BlizzwayMetricsResponse,
  type BlizzwayWalletResponse,
  type EarningUniverseResponse,
  type LearningGardenResponse,
  type SoulVaultResponse,
  type BlizzwayPathwayResponse,
} from "@/lib/api";
import { BlizzwayDashboardShell } from "../dashboard-shell";

type MagicalStep = {
  time: string;
  title: string;
  tag: string;
};

type PreviewCard = {
  title: string;
  href: string;
  stat: string;
  description: string;
  fallback: boolean;
};

type ProgressCard = {
  title: string;
  value: string;
  description: string;
  fallback: boolean;
};

type NextAction = {
  title: string;
  area: string;
  time: string;
};

type DashboardData = {
  session: BgosSessionResponse;
  metrics: BlizzwayMetricsResponse;
  wallet: BlizzwayWalletResponse;
  growthBoard: BlizzwayGrowthBoardResponse;
  pathway: BlizzwayPathwayResponse | null;
  learningGarden: LearningGardenResponse | null;
  earningUniverse: EarningUniverseResponse | null;
  soulVault: SoulVaultResponse | null;
  nexaMessage: string | null;
  fallbackLabels: string[];
};

const fallbackMagicalSteps: MagicalStep[] = [
  { time: "09:00", title: "Water the Learning Garden with one communication drill", tag: "Learning" },
  { time: "12:30", title: "Add one proof note to Soul Vault", tag: "Vault" },
  { time: "17:00", title: "Review two Earning Universe opportunities", tag: "Earning" },
];

const fallbackNextActions: NextAction[] = [
  { title: "Add one proof story", area: "Soul Vault", time: "10 min" },
  { title: "Practice intro answer", area: "Quick Boosts", time: "15 min" },
  { title: "Review freelance lead", area: "Earning Universe", time: "20 min" },
];

function asPercent(value: number | null | undefined, fallback: number) {
  const safeValue = typeof value === "number" && Number.isFinite(value) ? value : fallback;
  return `${Math.min(100, Math.max(0, Math.round(safeValue)))}%`;
}

function firstName(name?: string | null) {
  return name?.trim().split(/\s+/)[0] || "Blizzway Explorer";
}

function getUserName(session: BgosSessionResponse) {
  return session.user?.name || session.user?.email || "Blizzway Explorer";
}

function buildProgressCards(data: DashboardData): ProgressCard[] {
  const learningProgress =
    data.learningGarden?.garden.items.length
      ? data.learningGarden.garden.items.reduce((total, item) => total + item.progress, 0) /
        data.learningGarden.garden.items.length
      : null;
  const earningProgress =
    data.earningUniverse?.universe.opportunities.length
      ? Math.min(100, data.earningUniverse.universe.completedCount * 25 + data.earningUniverse.universe.activeCount * 15)
      : null;
  const vaultProgress = data.soulVault
    ? Math.min(100, data.soulVault.vault.certificates * 10 + data.soulVault.vault.achievements * 8)
    : null;

  return [
    {
      title: "Learning Garden",
      value: asPercent(learningProgress, 72),
      description: data.learningGarden
        ? `${data.learningGarden.garden.activeCount} active tracks and ${data.learningGarden.garden.completedCount} completed items.`
        : "Language drills and portfolio practice are blooming.",
      fallback: !data.learningGarden,
    },
    {
      title: "Earning Universe",
      value: asPercent(earningProgress, 58),
      description: data.earningUniverse
        ? `${data.earningUniverse.universe.activeCount} active opportunities are ready for review.`
        : "Two opportunity leads are ready for review.",
      fallback: !data.earningUniverse,
    },
    {
      title: "Soul Vault",
      value: asPercent(vaultProgress, 81),
      description: data.soulVault
        ? `${data.soulVault.vault.certificates} certificates and ${data.soulVault.vault.achievements} achievements are saved.`
        : "Eight proof notes and confidence wins are saved.",
      fallback: !data.soulVault,
    },
  ];
}

function buildPreviews(data: DashboardData): PreviewCard[] {
  const activeBoardTotal = data.growthBoard.activeCounts.total;
  const marketplaceCount = data.growthBoard.marketplaceAgents.length;

  return [
    {
      title: "BDP",
      href: "/bdp",
      stat: "78% profile strength",
      description: "Your living career identity gathers assessment signals, proof, confidence, and readiness.",
      fallback: false,
    },
    {
      title: "Assessments",
      href: "/assessments",
      stat: "2 free starters",
      description: "Take NEXA-powered assessments to improve your BDP and pathway recommendations.",
      fallback: false,
    },
    {
      title: "My Pathway",
      href: "/my-pathway",
      stat: data.pathway ? `${data.pathway.pathway.steps.length} milestones` : `${activeBoardTotal || 3} active milestones`,
      description: data.pathway
        ? `${data.pathway.pathway.title} is ${Math.round(data.pathway.pathway.progress)}% complete.`
        : "Career clarity, proof, and launch actions are arranged for the week.",
      fallback: !data.pathway,
    },
    {
      title: "Learning Garden",
      href: "/learning-garden",
      stat: data.learningGarden ? `${data.learningGarden.garden.activeCount} active tracks` : "4 growth tracks",
      description: data.learningGarden
        ? `${data.learningGarden.garden.completedCount} learning items completed so far.`
        : "Communication, portfolio proof, exam readiness, and confidence practice.",
      fallback: !data.learningGarden,
    },
    {
      title: "Earning Universe",
      href: "/earning-universe",
      stat: data.earningUniverse
        ? `${data.earningUniverse.universe.opportunities.length} opportunity signals`
        : "2 opportunity signals",
      description: data.earningUniverse
        ? `${data.earningUniverse.universe.activeCount} opportunities are active now.`
        : "Fallback role ideas are ready for exploration.",
      fallback: !data.earningUniverse,
    },
    {
      title: "Magic Market",
      href: "/magic-market",
      stat: `${marketplaceCount} tools`,
      description: "Browse companions, boosts, and focused career utilities from BGOS marketplace data.",
      fallback: false,
    },
    {
      title: "Soul Vault",
      href: "/soul-vault",
      stat: data.soulVault
        ? `${data.soulVault.vault.vaultItems.length} saved items`
        : "8 saved wins",
      description: data.soulVault
        ? `Current tier: ${data.soulVault.vault.tier}.`
        : "Reflections, achievements, and confidence notes are safely organized.",
      fallback: !data.soulVault,
    },
  ];
}

function buildMagicalSteps(data: DashboardData): MagicalStep[] {
  const pathwaySteps = data.pathway?.pathway.steps
    .filter((step) => step.status === "active" || step.status === "available")
    .slice(0, 3)
    .map((step, index) => ({
      time: ["09:00", "12:30", "17:00"][index] ?? "Today",
      title: step.title,
      tag: step.status === "active" ? "Active" : "Next",
    }));

  return pathwaySteps?.length ? pathwaySteps : fallbackMagicalSteps;
}

async function optional<T>(request: Promise<T>, label: string, fallbacks: string[]) {
  try {
    return await request;
  } catch {
    fallbacks.push(label);
    return null;
  }
}

async function loadDashboardData(): Promise<DashboardData> {
  const fallbackLabels: string[] = [];
  const [session, metrics, wallet, growthBoard] = await Promise.all([
    sessionApi.getSession(),
    BlizzwayApi.getMetrics(),
    BlizzwayApi.getWallet(),
    BlizzwayApi.getGrowthBoard(),
  ]);

  const [pathway, learningGarden, earningUniverse, soulVault, nexa] = await Promise.all([
    optional(pathwayApi.getPathway(), "My Pathway endpoint", fallbackLabels),
    optional(learningGardenApi.getLearningGarden(), "Learning Garden endpoint", fallbackLabels),
    optional(earningUniverseApi.getEarningUniverse(), "Earning Universe endpoint", fallbackLabels),
    optional(soulVaultApi.getSoulVault(), "Soul Vault endpoint", fallbackLabels),
    optional(
      nexaApi.askNexa({
        quickAction: "dashboard_recommendation",
        message: "Give one concise Blizzway dashboard recommendation for today.",
      }),
      "NEXA recommendation endpoint",
      fallbackLabels,
    ),
  ]);

  return {
    session,
    metrics,
    wallet,
    growthBoard,
    pathway,
    learningGarden,
    earningUniverse,
    soulVault,
    nexaMessage: nexa?.message ?? null,
    fallbackLabels,
  };
}

function ScoreCard({
  title,
  value,
  description,
  tone,
}: {
  title: string;
  value: string;
  description: string;
  tone: "purple" | "gold";
}) {
  return (
    <BlizzwayCard as="section" className="flex min-h-full flex-col justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">{title}</p>
        <p className="mt-4 text-5xl font-black tracking-tight text-slate-950">{value}</p>
        <p className="mt-3 text-sm leading-6 c7-muted">{description}</p>
      </div>
      <div className="mt-6 h-3 rounded-full bg-slate-200">
        <div
          className={`h-3 rounded-full ${tone === "purple" ? "bg-gradient-to-r from-indigo-700 via-purple-500 to-cyan-400" : "bg-gradient-to-r from-amber-300 via-cyan-300 to-purple-400"}`}
          style={{ width: value }}
        />
      </div>
    </BlizzwayCard>
  );
}

function LoadingDashboard() {
  return (
    <BlizzwayDashboardShell
      activeHref="/dashboard"
      title="Your Blizzway command center"
      description="A clean, magical workspace for pathway clarity, learning momentum, earning signals, and NEXA guidance."
      userName="Blizzway Explorer"
      walletCredits={null}
    >
      <section className="mt-5 grid gap-5">
        <BlizzwayCard as="section">
          <p className="text-sm font-black text-slate-950">Loading your Blizzway dashboard...</p>
          <p className="mt-2 text-sm leading-6 c7-muted">Checking your BGOS session, wallet, marketplace, and pathway signals.</p>
        </BlizzwayCard>
      </section>
    </BlizzwayDashboardShell>
  );
}

function ErrorDashboard({ message, retry }: { message: string; retry: () => void }) {
  return (
    <BlizzwayDashboardShell
      activeHref="/dashboard"
      title="Your Blizzway command center"
      description="A clean, magical workspace for pathway clarity, learning momentum, earning signals, and NEXA guidance."
      userName="Blizzway Explorer"
      walletCredits={null}
    >
      <section className="mt-5 grid gap-5">
        <BlizzwayCard as="section">
          <p className="text-sm font-black text-rose-700">Unable to load dashboard data</p>
          <p className="mt-2 text-sm leading-6 c7-muted">{message}</p>
          <button type="button" onClick={retry} className="c7-button-primary mt-5">
            Try again
          </button>
        </BlizzwayCard>
      </section>
    </BlizzwayDashboardShell>
  );
}

export function DashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      setData(await loadDashboardData());
    } catch (caught) {
      setError(getApiErrorMessage(caught));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    loadDashboardData()
      .then((nextData) => {
        if (!cancelled) setData(nextData);
      })
      .catch((caught) => {
        if (!cancelled) setError(getApiErrorMessage(caught));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const derived = useMemo(() => {
    if (!data) return null;

    const pathwayScore = asPercent(data.metrics.metrics.careerScore, data.pathway?.pathway.progress ?? 86);
    const growthScore = asPercent(null, data.growthBoard.activeCounts.total ? Math.min(100, 70 + data.growthBoard.activeCounts.total * 5) : 91);

    return {
      userName: getUserName(data.session),
      pathwayScore,
      growthScore,
      previews: buildPreviews(data),
      progressCards: buildProgressCards(data),
      magicalSteps: buildMagicalSteps(data),
      walletCredits: data.wallet.wallet.credits,
      activeBoardTotal: data.growthBoard.activeCounts.total,
      nextActions: data.growthBoard.nexaRecommendation
        ? [{ title: data.growthBoard.nexaRecommendation, area: "Growth Board", time: "Today" }, ...fallbackNextActions.slice(0, 2)]
        : fallbackNextActions,
      nexaMessage:
        data.nexaMessage ||
        data.growthBoard.nexaRecommendation ||
        "Keep today light: one learning action, one confidence save, one earning review.",
      profileSummary: `${data.session.user?.role ?? "Blizzway member"}${data.session.user?.businessId ? " in a scoped Blizzway workspace" : ""}`,
    };
  }, [data]);

  if (loading && !data) return <LoadingDashboard />;
  if (error && !data) return <ErrorDashboard message={error} retry={refresh} />;
  if (!data || !derived) return null;

  return (
    <BlizzwayDashboardShell
      activeHref="/dashboard"
      title="Your Blizzway command center"
      description="A clean, magical workspace for pathway clarity, learning momentum, earning signals, and NEXA guidance."
      greeting={`Good morning, ${firstName(derived.userName)}`}
      userName={derived.userName}
      walletCredits={derived.walletCredits}
    >
      {error ? (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">
          Some dashboard data could not refresh: {error}
        </div>
      ) : null}

      {data.fallbackLabels.length ? (
        <div className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-sm font-bold text-indigo-700">
          Fallback preview data is active for: {data.fallbackLabels.join(", ")}.
        </div>
      ) : null}

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.32fr_0.68fr]">
        <BlizzwayGradientPanel className="overflow-hidden">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">Welcome hero</p>
              <h2 className="mt-3 max-w-3xl text-[1.8rem] font-black leading-tight tracking-tight sm:text-5xl">
                Build one beautiful career pathway at a time.
              </h2>
              <p className="mt-4 max-w-2xl leading-7 text-white/72">
                Blizzway keeps your next learning step, earning move, and confidence signal visible
                without clutter or pressure.
              </p>
            </div>
            <div className="rounded-[24px] bg-white/14 p-5 ring-1 ring-white/14 lg:min-w-56">
              <p className="text-sm font-bold text-white/70">Pathway week</p>
              <p className="mt-2 text-5xl font-black">{Math.max(1, derived.activeBoardTotal || 7)}</p>
              <p className="mt-2 text-sm text-white/66">Magical steps planned</p>
            </div>
          </div>
        </BlizzwayGradientPanel>

        <BlizzwayCard as="section" className="c7-magical-glow">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">NEXA Guardian Angel</p>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">
            Your next kind step is already clear.
          </h2>
          <p className="mt-3 text-sm leading-6 c7-muted">
            Complete one proof note, then choose a communication boost before browsing opportunities.
          </p>
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-black text-slate-950">{derived.userName}</p>
            <p className="mt-1 text-sm font-semibold c7-muted">{derived.profileSummary}</p>
          </div>
          <div className="mt-5 rounded-2xl bg-indigo-50 p-4">
            <p className="text-sm font-black text-indigo-700">NEXA suggestion</p>
            <p className="mt-1 text-sm leading-6 text-indigo-700/75">{derived.nexaMessage}</p>
          </div>
        </BlizzwayCard>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-2">
        <ScoreCard
          title="Pathway Score"
          value={derived.pathwayScore}
          tone="purple"
          description="BGOS-backed signal for clarity, consistency, and readiness across your pathway."
        />
        <ScoreCard
          title="Happiness / Growth Score"
          value={derived.growthScore}
          tone="gold"
          description="Growth signal derived from active Blizzway board momentum until a dedicated endpoint is available."
        />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[0.72fr_1fr]">
        <ScoreCard
          title="BDP Score"
          value="78%"
          tone="purple"
          description="Preview score for your Blizzway Digital Profile, shaped by assessments, proof, learning momentum, and readiness signals."
        />
        <BlizzwayCard as="section" className="c7-magical-glow">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Free BDP boost</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                Take free assessments to improve your BDP
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 c7-muted">
                Start with Career Compass Starter or Happiness Baseline. NEXA uses the results to make your pathway, recommendations, and confidence signals sharper.
              </p>
            </div>
            <BlizzwayButton href="/assessments" variant="dark" className="shrink-0">
              Open assessments
            </BlizzwayButton>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {["Pathway fit +9%", "BDP clarity +12%", "NEXA confidence +15%"].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-black text-slate-950">
                {item}
              </div>
            ))}
          </div>
        </BlizzwayCard>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.82fr]">
        <BlizzwayCard as="section">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Progress cards</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Where your magic is moving</h2>
            </div>
            <BlizzwayBadge tone={data.fallbackLabels.length ? "slate" : "purple"}>
              {data.fallbackLabels.length ? "Mixed data" : "BGOS data"}
            </BlizzwayBadge>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {derived.progressCards.map(({ title, value, description, fallback }) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-black text-slate-950">{title}</p>
                <p className="mt-3 text-3xl font-black text-slate-950">{value}</p>
                <div className="mt-3 h-2 rounded-full bg-slate-200">
                  <div className="h-2 rounded-full bg-gradient-to-r from-indigo-700 via-purple-500 to-cyan-400" style={{ width: value }} />
                </div>
                <p className="mt-3 text-sm leading-6 c7-muted">{description}</p>
                {fallback ? <BlizzwayBadge tone="slate" className="mt-3">Fallback</BlizzwayBadge> : null}
              </div>
            ))}
          </div>
        </BlizzwayCard>

        <BlizzwayCard as="section" className="c7-magical-glow">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Recommended next actions</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">NEXA&apos;s gentle queue</h2>
          <div className="mt-6 space-y-3">
            {derived.nextActions.map(({ title, area, time }) => (
              <div key={`${title}-${area}`} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <div>
                  <p className="font-black text-slate-950">{title}</p>
                  <p className="mt-1 text-sm font-semibold c7-muted">{area}</p>
                </div>
                <BlizzwayBadge tone="slate">{time}</BlizzwayBadge>
              </div>
            ))}
          </div>
        </BlizzwayCard>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <BlizzwayCard as="section">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Today&apos;s magical steps</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Calm actions, visible wins</h2>
            </div>
            <BlizzwayBadge tone="cyan">{derived.magicalSteps.length} steps</BlizzwayBadge>
          </div>
          <div className="mt-6 space-y-3">
            {derived.magicalSteps.length ? (
              derived.magicalSteps.map(({ time, title, tag }) => (
                <div key={`${time}-${title}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{time}</p>
                      <p className="mt-2 font-black text-slate-950">{title}</p>
                    </div>
                    <BlizzwayBadge tone="slate" className="self-start">{tag}</BlizzwayBadge>
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold c7-muted">
                No magical steps are scheduled yet.
              </p>
            )}
          </div>
        </BlizzwayCard>

        <section className="grid gap-4 sm:grid-cols-2">
          {derived.previews.map(({ title, href, stat, description, fallback }) => (
            <Link key={title} href={href} className="c7-card c7-lift-card block p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-600">{title}</p>
                {fallback ? <BlizzwayBadge tone="slate">Fallback</BlizzwayBadge> : null}
              </div>
              <p className="mt-3 text-2xl font-black text-slate-950">{stat}</p>
              <p className="mt-2 text-sm leading-6 c7-muted">{description}</p>
            </Link>
          ))}
        </section>
      </section>
    </BlizzwayDashboardShell>
  );
}
