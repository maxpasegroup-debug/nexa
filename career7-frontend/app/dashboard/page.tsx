"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Career7Badge,
  Career7Card,
  Career7GradientPanel,
  Career7ProgressTracker,
} from "@/components/career7";
import { career7Api, getApiErrorMessage, type BgosSessionResponse, type Career7GrowthBoardResponse, type Career7MetricsResponse, type Career7UserProfile, type Career7WalletResponse } from "@/lib/api";
import { Career7DashboardShell } from "../dashboard-shell";

const progressItems = [
  { label: "Profile polish", value: "Done", complete: true },
  { label: "Resume scan", value: "In review", complete: true },
  { label: "Interview drill", value: "Next", complete: false },
];

const visionItems = [
  "Senior product role",
  "Proof-led portfolio",
  "Premium mentor circle",
];

const tasks = [
  { time: "10:00 AM", title: "Run Guardian Angel AI resume pass", tag: "Boost" },
  { time: "01:30 PM", title: "Add portfolio proof note", tag: "Vault" },
  { time: "05:00 PM", title: "Practice behavioral answer", tag: "Interview" },
];

type DashboardData = {
  profile: Career7UserProfile | null;
  session: BgosSessionResponse | null;
  metrics: Career7MetricsResponse | null;
  wallet: Career7WalletResponse | null;
  growthBoard: Career7GrowthBoardResponse | null;
};

function WidgetTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">{eyebrow}</p>
      <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950">{title}</h2>
      {description ? <p className="mt-2 text-sm leading-6 c7-muted">{description}</p> : null}
    </div>
  );
}

function LoadingBlock({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="h-3 w-24 animate-pulse rounded-full bg-slate-200" />
      <div className="mt-3 h-8 w-36 animate-pulse rounded-xl bg-slate-200" />
      <p className="mt-3 text-sm font-semibold text-slate-400">{label}</p>
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center">
      <p className="font-black text-slate-950">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 c7-muted">{description}</p>
    </div>
  );
}

function firstName(value: string) {
  return value.trim().split(" ")[0] || "there";
}

function boundedScore(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({
    profile: null,
    session: null,
    metrics: null,
    wallet: null,
    growthBoard: null,
  });
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      setLoading(true);
      const [profileResult, sessionResult, metricsResult, walletResult, boardResult] =
        await Promise.allSettled([
          career7Api.getProfile(),
          career7Api.getSession(),
          career7Api.getMetrics(),
          career7Api.getWallet(),
          career7Api.getGrowthBoard(),
        ]);

      if (!active) return;

      const nextErrors: string[] = [];
      const nextData: DashboardData = {
        profile: null,
        session: null,
        metrics: null,
        wallet: null,
        growthBoard: null,
      };

      if (profileResult.status === "fulfilled") {
        nextData.profile = profileResult.value;
      } else {
        nextErrors.push("Blizzway profile is not available yet.");
      }

      if (sessionResult.status === "fulfilled") {
        nextData.session = sessionResult.value;
      } else {
        nextErrors.push(getApiErrorMessage(sessionResult.reason));
      }

      if (metricsResult.status === "fulfilled") {
        nextData.metrics = metricsResult.value;
      } else {
        nextErrors.push("Career Score placeholder API could not be loaded.");
      }

      if (walletResult.status === "fulfilled") {
        nextData.wallet = walletResult.value;
      } else {
        nextErrors.push("Wallet balance could not be loaded.");
      }

      if (boardResult.status === "fulfilled") {
        nextData.growthBoard = boardResult.value;
      } else {
        nextErrors.push("My Pathway summary could not be loaded.");
      }

      setData(nextData);
      setErrors(nextErrors);
      setLoading(false);
    }

    void loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const userName = useMemo(
    () => data.profile?.name || data.session?.user?.name || "Blizzway User",
    [data.profile?.name, data.session?.user?.name],
  );
  const score = boundedScore(data.metrics?.metrics.careerScore);
  const walletCredits = data.wallet?.wallet.credits ?? data.growthBoard?.wallet.balance ?? null;
  const boardTotal = data.growthBoard?.activeCounts.total ?? 0;
  const learningCount = data.growthBoard?.activeCounts.learning ?? 0;
  const earningCount = data.growthBoard?.activeCounts.earning ?? 0;
  const marketplaceCount = data.growthBoard?.marketplaceAgents.length ?? 0;
  const tasksCompleted = data.metrics?.metrics.tasksCompleted ?? 0;

  return (
    <Career7DashboardShell
      activeHref="/dashboard"
      title={loading ? "Loading your Blizzway workspace" : `Good morning, ${firstName(userName)}`}
      description="Guardian Angel AI has prepared your next best growth actions."
      userName={userName}
      walletCredits={walletCredits}
    >
      {errors.length > 0 ? (
        <div className="mt-5 rounded-[24px] border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-800">
          Some BGOS data could not be loaded. Showing safe placeholders where needed.
        </div>
      ) : null}

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <Career7GradientPanel className="overflow-hidden">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">
                Guardian Angel AI insight
              </p>
              <h2 className="mt-3 max-w-2xl text-[1.65rem] font-black leading-tight tracking-tight sm:text-4xl">
                {loading
                  ? "Loading your next best action."
                  : data.growthBoard?.nexaRecommendation || "Your strongest next move is one focused proof sprint."}
              </h2>
              <p className="mt-4 max-w-2xl leading-7 text-white/72">
                {boardTotal > 0
                  ? `You have ${boardTotal} active My Pathway companion${boardTotal === 1 ? "" : "s"} across Learning Garden and Earning Universe.`
                  : "Add your first My Pathway companion when you are ready to turn planning into action."}
              </p>
            </div>
            <div className="rounded-[24px] bg-white/14 p-5 ring-1 ring-white/14 lg:min-w-52">
              <p className="text-sm font-bold text-white/70">Confidence</p>
              <p className="mt-2 text-4xl font-black sm:text-5xl">{score ?? 0}%</p>
              <p className="mt-2 text-sm text-white/66">
                {score === null ? "Awaiting Career Score" : "Career Score signal"}
              </p>
            </div>
          </div>
        </Career7GradientPanel>

        <Career7Card as="section" className="flex flex-col justify-between">
          {loading ? (
            <LoadingBlock label="Loading Career Score" />
          ) : (
            <>
              <WidgetTitle
                eyebrow="Career Score"
                title={score === null ? "Not scored yet" : `${score} / 100`}
                description="Loaded from the Blizzway metrics API."
              />
              <div className="mt-6">
                <div className="h-3 rounded-full bg-slate-200">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-indigo-600 via-purple-500 to-cyan-500"
                    style={{ width: `${score ?? 0}%` }}
                  />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Career7Badge tone={score === null ? "slate" : "emerald"}>
                    {score === null ? "Placeholder pending" : "Live metrics"}
                  </Career7Badge>
                  <Career7Badge tone="slate">{tasksCompleted} tasks done</Career7Badge>
                </div>
              </div>
            </>
          )}
        </Career7Card>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-3">
        <Career7Card as="section">
          <WidgetTitle
            eyebrow="Today's Progress"
            title={`${tasksCompleted || 3} of 5 actions`}
            description="A simple daily rhythm for keeping career momentum visible."
          />
          <div className="mt-6 space-y-3">
            {progressItems.map((item) => (
              <div key={item.label} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-black ${
                    item.complete ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {item.complete ? "OK" : "N"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-slate-950">{item.label}</p>
                  <p className="text-xs font-semibold c7-muted">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </Career7Card>

        <Career7Card as="section">
          <WidgetTitle
            eyebrow="My Pathway"
            title={loading ? "Loading board" : `${boardTotal} active companions`}
            description="Live summary from your Blizzway My Pathway."
          />
          <div className="mt-6 grid gap-3">
            {loading ? (
              <LoadingBlock label="Loading My Pathway" />
            ) : boardTotal === 0 ? (
              <EmptyState
                title="No active companions yet"
                description="Your My Pathway is ready. Add a Learning Garden or Earning Universe companion to start tracking momentum."
              />
            ) : (
              [
                ["Learning Garden", learningCount],
                ["Earning Universe", earningCount],
                ["Available companions", marketplaceCount],
              ].map(([label, value], index) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-black text-indigo-600">0{index + 1}</p>
                  <p className="mt-2 font-black text-slate-950">{label}</p>
                  <p className="mt-1 text-sm font-semibold c7-muted">{value} total</p>
                </div>
              ))
            )}
          </div>
        </Career7Card>

        <Career7Card as="section">
          <WidgetTitle
            eyebrow="Wallet Credits"
            title={walletCredits === null ? "Loading credits" : `${walletCredits.toLocaleString()} credits`}
            description="Live wallet balance for boosts, companions, and premium reviews."
          />
          <div className="mt-6 rounded-[24px] bg-slate-950 p-5 text-white">
            <p className="text-sm text-white/60">Available now</p>
            <p className="mt-2 text-4xl font-black">
              {walletCredits === null ? "--" : walletCredits.toLocaleString()}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-white/8 p-3">
                <p className="font-black">{data.wallet?.wallet.recentTransactions.length ?? 0}</p>
                <p className="mt-1 text-white/58">Recent entries</p>
              </div>
              <div className="rounded-2xl bg-white/8 p-3">
                <p className="font-black">{data.wallet?.payment.defaultGateway ?? "..."}</p>
                <p className="mt-1 text-white/58">Gateway</p>
              </div>
            </div>
          </div>
        </Career7Card>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
        <Career7Card as="section">
          <WidgetTitle
            eyebrow="Upcoming Tasks"
            title="Today's queue"
            description="Guided career actions remain visible while deeper task APIs are added."
          />
          <div className="mt-6 space-y-3">
            {tasks.map((task) => (
              <div key={task.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                      {task.time}
                    </p>
                    <p className="mt-2 font-black text-slate-950">{task.title}</p>
                  </div>
                  <Career7Badge tone="slate" className="self-start">{task.tag}</Career7Badge>
                </div>
              </div>
            ))}
          </div>
        </Career7Card>

        <Career7GradientPanel className="flex min-h-[320px] flex-col justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">
              Profile
            </p>
            <h2 className="mt-3 max-w-2xl text-[1.65rem] font-black leading-tight tracking-tight sm:text-3xl">
              {data.session?.user?.email || data.profile?.email
                ? `Signed in as ${data.session?.user?.email ?? data.profile?.email}`
                : "Your BGOS session keeps Blizzway scoped to your workspace."}
            </h2>
            <p className="mt-4 max-w-2xl leading-7 text-white/72">
              {data.profile
                ? "Blizzway profile data loaded successfully."
                : "Profile endpoint is not available yet, so the dashboard is using BGOS session data safely."}
            </p>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {visionItems.map((item) => (
              <div key={item} className="rounded-2xl bg-white/14 p-4 ring-1 ring-white/14">
                <p className="font-black">{item}</p>
                <p className="mt-2 text-sm text-white/70">Profile signal</p>
              </div>
            ))}
          </div>
        </Career7GradientPanel>
      </section>

      <Career7ProgressTracker />
    </Career7DashboardShell>
  );
}
