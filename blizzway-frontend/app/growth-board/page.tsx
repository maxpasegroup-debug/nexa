"use client";

import { useEffect, useMemo, useState } from "react";

import {
  BlizzwayBadge,
  BlizzwayButton,
  BlizzwayCard,
  BlizzwayEmptyState,
  BlizzwayGradientPanel,
  BlizzwayProgressTracker,
} from "@/components/blizzway";
import { BlizzwayApi, getApiErrorMessage, type BlizzwayAgent, type BlizzwayGrowthBoardItem, type BlizzwayGrowthBoardResponse } from "@/lib/api";
import { BlizzwayDashboardShell } from "../dashboard-shell";

type BoardPath = "learning" | "earning";
type AgentTone = "indigo" | "cyan" | "emerald" | "purple";

type BoardAgent = {
  id: string;
  name: string;
  focus: string;
  progress: number;
  status: string;
  tone: AgentTone;
  price: number;
};

const toneClasses: Record<AgentTone, string> = {
  indigo: "from-indigo-500 to-purple-500",
  cyan: "from-cyan-500 to-indigo-500",
  emerald: "from-emerald-500 to-cyan-500",
  purple: "from-purple-500 to-fuchsia-500",
};

const tones: AgentTone[] = ["indigo", "cyan", "emerald", "purple"];

function initials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function stableProgress(id: string) {
  const total = id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return 35 + (total % 56);
}

function mapBoardItem(item: BlizzwayGrowthBoardItem, index: number): BoardAgent {
  return {
    id: item.id,
    name: item.agent.name,
    focus: item.agent.description,
    progress: stableProgress(item.id),
    status: item.status,
    tone: tones[index % tones.length],
    price: item.agent.creditPrice,
  };
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs font-black text-slate-500">
        <span>Progress</span>
        <span>{value}%</span>
      </div>
      <div className="mt-2 h-3 rounded-full bg-slate-200">
        <div
          className="h-3 rounded-full bg-gradient-to-r from-indigo-600 via-purple-500 to-cyan-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function LoadingColumn() {
  return (
    <div className="grid gap-3">
      {[0, 1, 2].map((item) => (
        <div key={item} className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 animate-pulse rounded-2xl bg-slate-200" />
            <div className="min-w-0 flex-1">
              <div className="h-4 w-36 animate-pulse rounded-full bg-slate-200" />
              <div className="mt-3 h-3 w-full animate-pulse rounded-full bg-slate-100" />
              <div className="mt-2 h-3 w-4/5 animate-pulse rounded-full bg-slate-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AgentCard({
  companion,
  onRemove,
  busy,
}: {
  companion: BoardAgent;
  onRemove: (id: string) => void;
  busy: boolean;
}) {
  return (
    <article className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-sm font-black text-white shadow-lg shadow-indigo-500/15 ${toneClasses[companion.tone]}`}
        >
          {initials(companion.name)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3 className="font-black text-slate-950">{companion.name}</h3>
              <p className="mt-1 text-sm leading-6 c7-muted">{companion.focus}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2 self-start">
              <BlizzwayBadge tone="slate">{companion.status}</BlizzwayBadge>
              <button
                type="button"
                onClick={() => onRemove(companion.id)}
                disabled={busy}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-black text-slate-500 transition hover:border-rose-200 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          </div>
          <div className="mt-4">
            <ProgressBar value={companion.progress} />
          </div>
        </div>
      </div>
    </article>
  );
}

function CandidateList({
  path,
  companions,
  onAdd,
  busy,
}: {
  path: BoardPath;
  companions: BlizzwayAgent[];
  onAdd: (agentId: string, path: BoardPath) => void;
  busy: boolean;
}) {
  const candidates = companions
    .filter((companion) => companion.type?.toLowerCase() === path)
    .slice(0, 3);

  if (candidates.length === 0) return null;

  return (
    <div className="mt-4 rounded-[22px] border border-indigo-100 bg-indigo-50/70 p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-600">
        Available to add
      </p>
      <div className="mt-3 grid gap-2">
        {candidates.map((companion) => (
          <div key={companion.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-slate-950">{companion.name}</p>
              <p className="text-xs font-semibold c7-muted">{companion.creditPrice} credits</p>
            </div>
            <button
              type="button"
              onClick={() => onAdd(companion.id, path)}
              disabled={busy}
              className="shrink-0 rounded-full bg-slate-950 px-3 py-2 text-xs font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Add
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState({
  label,
  path,
  candidates,
  onAdd,
  busy,
}: {
  label: string;
  path: BoardPath;
  candidates: BlizzwayAgent[];
  onAdd: (agentId: string, path: BoardPath) => void;
  busy: boolean;
}) {
  return (
    <div className="rounded-[22px] border border-dashed border-slate-300 bg-slate-50/70 p-5 text-center">
      <p className="font-black text-slate-950">{label}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 c7-muted">
        Add a specialist from the Blizzway marketplace when Guardian Angel AI finds a gap in this lane.
      </p>
      {candidates[0] ? (
        <BlizzwayButton
          type="button"
          variant="secondary"
          size="sm"
          disabled={busy}
          onClick={() => onAdd(candidates[0].id, path)}
          className="mt-4 w-full sm:w-auto"
        >
          Add {candidates[0].name}
        </BlizzwayButton>
      ) : null}
    </div>
  );
}

function BoardColumn({
  title,
  description,
  path,
  companions,
  availableAgents,
  emptyLabel,
  loading,
  busy,
  onAdd,
  onRemove,
}: {
  title: string;
  description: string;
  path: BoardPath;
  companions: BoardAgent[];
  availableAgents: BlizzwayAgent[];
  emptyLabel: string;
  loading: boolean;
  busy: boolean;
  onAdd: (agentId: string, path: BoardPath) => void;
  onRemove: (id: string) => void;
}) {
  const averageProgress =
    companions.length > 0
      ? Math.round(companions.reduce((total, companion) => total + companion.progress, 0) / companions.length)
      : 0;
  const candidates = availableAgents.filter((companion) => companion.type?.toLowerCase() === path);

  return (
    <BlizzwayCard as="section" className="flex min-h-full flex-col">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">
            Growth lane
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">{title}</h2>
          <p className="mt-2 text-sm leading-6 c7-muted">{description}</p>
        </div>
        <BlizzwayButton
          type="button"
          variant="dark"
          size="sm"
          disabled={busy || !candidates[0]}
          onClick={() => candidates[0] && onAdd(candidates[0].id, path)}
          className="shrink-0"
        >
          Add companion
        </BlizzwayButton>
      </div>

      <div className="mt-5 rounded-2xl bg-slate-50 p-4">
        <ProgressBar value={averageProgress} />
      </div>

      <div className="mt-5 grid gap-3">
        {loading ? (
          <LoadingColumn />
        ) : companions.length > 0 ? (
          companions.map((companion) => (
            <AgentCard key={companion.id} companion={companion} onRemove={onRemove} busy={busy} />
          ))
        ) : (
          <EmptyState
            label={emptyLabel}
            path={path}
            candidates={candidates}
            onAdd={onAdd}
            busy={busy}
          />
        )}
      </div>

      {!loading && companions.length > 0 ? (
        <CandidateList path={path} companions={availableAgents} onAdd={onAdd} busy={busy} />
      ) : null}
    </BlizzwayCard>
  );
}

export default function GrowthBoardPage() {
  const [board, setBoard] = useState<BlizzwayGrowthBoardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function refreshBoard() {
    const response = await BlizzwayApi.getGrowthBoard();
    setBoard(response);
  }

  useEffect(() => {
    let active = true;

    async function loadInitialBoard() {
      try {
        const response = await BlizzwayApi.getGrowthBoard();
        if (!active) return;
        setBoard(response);
      } catch (caught) {
        if (!active) return;
        setError(getApiErrorMessage(caught));
        setBoard(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadInitialBoard();

    return () => {
      active = false;
    };
  }, []);

  async function handleAdd(agentId: string, path: BoardPath) {
    setBusy(true);
    setError("");
    setNotice("");

    try {
      await BlizzwayApi.addGrowthBoardAgent({ agentId, path });
      await refreshBoard();
      setNotice("Companion added to your Blizzway My Pathway. Beta billing is handled safely through your BGOS wallet.");
    } catch (caught) {
      setError(getApiErrorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove(id: string) {
    setBusy(true);
    setError("");
    setNotice("");

    try {
      await BlizzwayApi.updateGrowthBoardAgent({ id, active: false });
      await refreshBoard();
      setNotice("companion removed from active My Pathway view.");
    } catch (caught) {
      setError(getApiErrorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  const learningAgents = useMemo(
    () => (board?.board.learning ?? []).map(mapBoardItem),
    [board?.board.learning],
  );
  const earningAgents = useMemo(
    () => (board?.board.earning ?? []).map(mapBoardItem),
    [board?.board.earning],
  );
  const totalAgents = board?.activeCounts.total ?? 0;
  const learningCount = board?.activeCounts.learning ?? 0;
  const earningCount = board?.activeCounts.earning ?? 0;
  const availableAgents = board?.marketplaceAgents ?? [];
  const walletBalance = board?.wallet.balance ?? 0;
  const boardHealth = totalAgents > 0 ? Math.min(100, 40 + totalAgents * 12) : 0;

  return (
    <BlizzwayDashboardShell
      activeHref="/growth-board"
      eyebrow="My Pathway"
      title="My Pathway"
      description="Your visual command board for Learning Garden, Earning Universe, companions, and career momentum."
      walletCredits={board?.wallet.balance ?? null}
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "My Pathway" }]}
    >
      {error ? (
        <div className="mt-5 rounded-[24px] border border-rose-200 bg-rose-50 p-4 text-sm font-semibold leading-6 text-rose-700">
          {error}
        </div>
      ) : null}

      {notice ? (
        <div className="mt-5 rounded-[24px] border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold leading-6 text-emerald-700">
          {notice}
        </div>
      ) : null}

      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.72fr]">
        <BlizzwayGradientPanel>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">
                Guardian Angel AI recommendation
              </p>
              <h2 className="mt-3 max-w-2xl text-[1.65rem] font-black leading-tight tracking-tight sm:text-4xl">
                {loading
                  ? "Loading your Blizzway My Pathway."
                  : board?.nexaRecommendation || "Balance one Learning Garden sprint with one Earning Universe action today."}
              </h2>
              <p className="mt-4 max-w-2xl leading-7 text-white/72">
                {totalAgents > 0
                  ? `You have ${learningCount} Learning Garden and ${earningCount} Earning Universe companion${totalAgents === 1 ? "" : "s"} active for this authenticated Blizzway workspace.`
                  : "Your authenticated Blizzway workspace is ready for its first My Pathway companion."}
              </p>
            </div>
            <div className="rounded-[24px] bg-white/14 p-5 ring-1 ring-white/14 lg:min-w-56">
              <p className="text-sm font-bold text-white/70">Board health</p>
              <p className="mt-2 text-4xl font-black sm:text-5xl">{boardHealth}%</p>
              <p className="mt-2 text-sm text-white/66">
                {totalAgents > 0 ? "Momentum is active" : "Start by adding an companion"}
              </p>
            </div>
          </div>
        </BlizzwayGradientPanel>

        <BlizzwayCard as="section">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">
            Active companions
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
            {loading ? "Loading" : `${totalAgents} running`}
          </h2>
          <p className="mt-2 text-sm leading-6 c7-muted">
            Synced from BGOS Blizzway data scoped to the authenticated user.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {[
              ["Learning Garden", learningCount.toString()],
              ["Earning Universe", earningCount.toString()],
              ["Credits", walletBalance.toLocaleString()],
              ["Available", availableAgents.length.toString()],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
                  {label}
                </p>
                <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
              </div>
            ))}
          </div>
        </BlizzwayCard>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-2">
        <BoardColumn
          title="Learning Garden"
          description="companions that build communication, test readiness, and career assets."
          path="learning"
          companions={learningAgents}
          availableAgents={availableAgents}
          emptyLabel="Learning Garden slot available"
          loading={loading}
          busy={busy}
          onAdd={handleAdd}
          onRemove={handleRemove}
        />
        <BoardColumn
          title="Earning Universe"
          description="companions that turn skills into roles, freelance leads, and money habits."
          path="earning"
          companions={earningAgents}
          availableAgents={availableAgents}
          emptyLabel="Earning Universe slot available"
          loading={loading}
          busy={busy}
          onAdd={handleAdd}
          onRemove={handleRemove}
        />
      </section>

      {!loading && !error && totalAgents === 0 && availableAgents.length === 0 ? (
        <div className="mt-5">
          <BlizzwayEmptyState
            title="No Blizzway companions available"
            description="BGOS returned an empty Blizzway marketplace. Add Blizzway marketplace companions before building this board."
            actionLabel="Open Magic Market"
            actionHref="/agent-store"
          />
        </div>
      ) : null}

      <BlizzwayProgressTracker />
    </BlizzwayDashboardShell>
  );
}
