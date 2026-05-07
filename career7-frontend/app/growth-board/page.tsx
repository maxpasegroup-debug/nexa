"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Career7Badge,
  Career7Button,
  Career7Card,
  Career7EmptyState,
  Career7GradientPanel,
  Career7ProgressTracker,
} from "@/components/career7";
import { career7Api, getApiErrorMessage, type Career7Agent, type Career7GrowthBoardItem, type Career7GrowthBoardResponse } from "@/lib/api";
import { Career7DashboardShell } from "../dashboard-shell";

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

function mapBoardItem(item: Career7GrowthBoardItem, index: number): BoardAgent {
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
  agent,
  onRemove,
  busy,
}: {
  agent: BoardAgent;
  onRemove: (id: string) => void;
  busy: boolean;
}) {
  return (
    <article className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-sm font-black text-white shadow-lg shadow-indigo-500/15 ${toneClasses[agent.tone]}`}
        >
          {initials(agent.name)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3 className="font-black text-slate-950">{agent.name}</h3>
              <p className="mt-1 text-sm leading-6 c7-muted">{agent.focus}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2 self-start">
              <Career7Badge tone="slate">{agent.status}</Career7Badge>
              <button
                type="button"
                onClick={() => onRemove(agent.id)}
                disabled={busy}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-black text-slate-500 transition hover:border-rose-200 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          </div>
          <div className="mt-4">
            <ProgressBar value={agent.progress} />
          </div>
        </div>
      </div>
    </article>
  );
}

function CandidateList({
  path,
  agents,
  onAdd,
  busy,
}: {
  path: BoardPath;
  agents: Career7Agent[];
  onAdd: (agentId: string, path: BoardPath) => void;
  busy: boolean;
}) {
  const candidates = agents
    .filter((agent) => agent.type?.toLowerCase() === path)
    .slice(0, 3);

  if (candidates.length === 0) return null;

  return (
    <div className="mt-4 rounded-[22px] border border-indigo-100 bg-indigo-50/70 p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-600">
        Available to add
      </p>
      <div className="mt-3 grid gap-2">
        {candidates.map((agent) => (
          <div key={agent.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-slate-950">{agent.name}</p>
              <p className="text-xs font-semibold c7-muted">{agent.creditPrice} credits</p>
            </div>
            <button
              type="button"
              onClick={() => onAdd(agent.id, path)}
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
  candidates: Career7Agent[];
  onAdd: (agentId: string, path: BoardPath) => void;
  busy: boolean;
}) {
  return (
    <div className="rounded-[22px] border border-dashed border-slate-300 bg-slate-50/70 p-5 text-center">
      <p className="font-black text-slate-950">{label}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 c7-muted">
        Add a specialist from the Career7 marketplace when NEXA finds a gap in this lane.
      </p>
      {candidates[0] ? (
        <Career7Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={busy}
          onClick={() => onAdd(candidates[0].id, path)}
          className="mt-4 w-full sm:w-auto"
        >
          Add {candidates[0].name}
        </Career7Button>
      ) : null}
    </div>
  );
}

function BoardColumn({
  title,
  description,
  path,
  agents,
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
  agents: BoardAgent[];
  availableAgents: Career7Agent[];
  emptyLabel: string;
  loading: boolean;
  busy: boolean;
  onAdd: (agentId: string, path: BoardPath) => void;
  onRemove: (id: string) => void;
}) {
  const averageProgress =
    agents.length > 0
      ? Math.round(agents.reduce((total, agent) => total + agent.progress, 0) / agents.length)
      : 0;
  const candidates = availableAgents.filter((agent) => agent.type?.toLowerCase() === path);

  return (
    <Career7Card as="section" className="flex min-h-full flex-col">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">
            Growth lane
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">{title}</h2>
          <p className="mt-2 text-sm leading-6 c7-muted">{description}</p>
        </div>
        <Career7Button
          type="button"
          variant="dark"
          size="sm"
          disabled={busy || !candidates[0]}
          onClick={() => candidates[0] && onAdd(candidates[0].id, path)}
          className="shrink-0"
        >
          Add Agent
        </Career7Button>
      </div>

      <div className="mt-5 rounded-2xl bg-slate-50 p-4">
        <ProgressBar value={averageProgress} />
      </div>

      <div className="mt-5 grid gap-3">
        {loading ? (
          <LoadingColumn />
        ) : agents.length > 0 ? (
          agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} onRemove={onRemove} busy={busy} />
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

      {!loading && agents.length > 0 ? (
        <CandidateList path={path} agents={availableAgents} onAdd={onAdd} busy={busy} />
      ) : null}
    </Career7Card>
  );
}

export default function GrowthBoardPage() {
  const [board, setBoard] = useState<Career7GrowthBoardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function refreshBoard() {
    const response = await career7Api.getGrowthBoard();
    setBoard(response);
  }

  useEffect(() => {
    let active = true;

    async function loadInitialBoard() {
      try {
        const response = await career7Api.getGrowthBoard();
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
      await career7Api.addGrowthBoardAgent({ agentId, path });
      await refreshBoard();
      setNotice("Agent added to your Career7 Growth Board. Billing is not implemented in this frontend yet.");
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
      await career7Api.updateGrowthBoardAgent({ id, active: false });
      await refreshBoard();
      setNotice("Agent removed from active Growth Board view.");
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
    <Career7DashboardShell
      activeHref="/growth-board"
      eyebrow="Growth Board"
      title="Growth Board"
      description="Your visual command board for learning, earning, agents, and career momentum."
      walletCredits={board?.wallet.balance ?? null}
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Growth Board" }]}
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
        <Career7GradientPanel>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">
                NEXA recommendation
              </p>
              <h2 className="mt-3 max-w-2xl text-[1.65rem] font-black leading-tight tracking-tight sm:text-4xl">
                {loading
                  ? "Loading your Career7 Growth Board."
                  : board?.nexaRecommendation || "Balance one learning sprint with one earning action today."}
              </h2>
              <p className="mt-4 max-w-2xl leading-7 text-white/72">
                {totalAgents > 0
                  ? `You have ${learningCount} learning and ${earningCount} earning agent${totalAgents === 1 ? "" : "s"} active for this authenticated Career7 workspace.`
                  : "Your authenticated Career7 workspace is ready for its first Growth Board agent."}
              </p>
            </div>
            <div className="rounded-[24px] bg-white/14 p-5 ring-1 ring-white/14 lg:min-w-56">
              <p className="text-sm font-bold text-white/70">Board health</p>
              <p className="mt-2 text-4xl font-black sm:text-5xl">{boardHealth}%</p>
              <p className="mt-2 text-sm text-white/66">
                {totalAgents > 0 ? "Momentum is active" : "Start by adding an agent"}
              </p>
            </div>
          </div>
        </Career7GradientPanel>

        <Career7Card as="section">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">
            Active agents
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
            {loading ? "Loading" : `${totalAgents} running`}
          </h2>
          <p className="mt-2 text-sm leading-6 c7-muted">
            Synced from BGOS Career7 data scoped to the authenticated user.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {[
              ["Learning", learningCount.toString()],
              ["Earning", earningCount.toString()],
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
        </Career7Card>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-2">
        <BoardColumn
          title="Learning"
          description="Agents that build communication, test readiness, and career assets."
          path="learning"
          agents={learningAgents}
          availableAgents={availableAgents}
          emptyLabel="Learning slot available"
          loading={loading}
          busy={busy}
          onAdd={handleAdd}
          onRemove={handleRemove}
        />
        <BoardColumn
          title="Earning"
          description="Agents that turn skills into roles, freelance leads, and money habits."
          path="earning"
          agents={earningAgents}
          availableAgents={availableAgents}
          emptyLabel="Earning slot available"
          loading={loading}
          busy={busy}
          onAdd={handleAdd}
          onRemove={handleRemove}
        />
      </section>

      {!loading && !error && totalAgents === 0 && availableAgents.length === 0 ? (
        <div className="mt-5">
          <Career7EmptyState
            title="No Career7 agents available"
            description="BGOS returned an empty Career7 marketplace. Add Career7 marketplace agents before building this board."
            actionLabel="Open Agent Store"
            actionHref="/agent-store"
          />
        </div>
      ) : null}

      <Career7ProgressTracker />
    </Career7DashboardShell>
  );
}
