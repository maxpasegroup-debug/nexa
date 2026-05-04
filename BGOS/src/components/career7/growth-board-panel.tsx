"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bot,
  BriefcaseBusiness,
  GraduationCap,
  Loader2,
  Plus,
  Sparkles,
  X,
} from "lucide-react";

type Career7Agent = {
  id: string;
  slug: string;
  name: string;
  category: string;
  type: string | null;
  creditPrice: number;
  description: string;
  icon: string;
  status: string;
  canAddToGrowthBoard: boolean;
  colorPrimary: string;
  colorSecondary: string;
};

type GrowthBoardItem = {
  id: string;
  path: "learning" | "earning";
  status: "active" | "inactive";
  addedAt: string;
  deactivatedAt?: string | null;
  agent: Career7Agent;
};

type GrowthBoardResponse = {
  board: {
    learning: GrowthBoardItem[];
    earning: GrowthBoardItem[];
    inactive: GrowthBoardItem[];
  };
  activeCounts: {
    learning: number;
    earning: number;
    total: number;
  };
  marketplaceAgents: Career7Agent[];
  wallet: {
    id: string;
    balance: number;
  };
  paymentModeEnabled: boolean;
  nexaRecommendation: string;
};

function pathForAgent(agent: Career7Agent): "learning" | "earning" {
  return agent.type === "earning" || agent.type === "finance" ? "earning" : "learning";
}

function AgentAvatar({ agent }: { agent: Career7Agent }) {
  return (
    <div
      className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-lg shadow-sm"
      style={{
        background: `linear-gradient(135deg, ${agent.colorPrimary || "#7C3AED"}, ${agent.colorSecondary || "#22D3EE"})`,
      }}
    >
      <span className="text-white">{agent.icon || "AI"}</span>
    </div>
  );
}

function BoardAgentCard({
  item,
  onDeactivate,
  busy,
}: {
  item: GrowthBoardItem;
  onDeactivate: (id: string) => void;
  busy: boolean;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <AgentAvatar agent={item.agent} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-bold text-slate-950">{item.agent.name}</p>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
              {item.agent.description}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onDeactivate(item.id)}
            disabled={busy}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
            aria-label={`Remove ${item.agent.name}`}
          >
            <X size={16} />
          </button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase text-slate-600">
            {item.agent.type ?? "career"}
          </span>
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
            {item.agent.creditPrice} credits
          </span>
        </div>
      </div>
    </div>
  );
}

function PathPanel({
  title,
  subtitle,
  path,
  items,
  count,
  onDeactivate,
  busyId,
}: {
  title: string;
  subtitle: string;
  path: "learning" | "earning";
  items: GrowthBoardItem[];
  count: number;
  onDeactivate: (id: string) => void;
  busyId: string | null;
}) {
  const Icon = path === "learning" ? GraduationCap : BriefcaseBusiness;
  const accent =
    path === "learning"
      ? "from-violet-600 to-indigo-500 text-violet-700 bg-violet-50"
      : "from-emerald-500 to-teal-500 text-emerald-700 bg-emerald-50";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
      <div className="mb-5 flex items-start gap-4">
        <div className={`grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br ${accent.split(" ").slice(0, 2).join(" ")} text-white`}>
          <Icon size={26} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-950">{title}</h3>
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${accent.split(" ").slice(2).join(" ")}`}>
              {count} Active
            </span>
          </div>
        </div>
      </div>

      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item) => (
            <BoardAgentCard
              key={item.id}
              item={item}
              onDeactivate={onDeactivate}
              busy={busyId === item.id}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
          <Bot className="mx-auto text-slate-400" size={28} />
          <p className="mt-3 text-sm font-semibold text-slate-700">No active agents yet</p>
          <p className="mt-1 text-xs text-slate-500">Add one from the marketplace list below.</p>
        </div>
      )}
    </section>
  );
}

export function GrowthBoardPanel() {
  const [data, setData] = useState<GrowthBoardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function loadBoard() {
    setError(null);
    const response = await fetch("/api/career7/growth-board", { cache: "no-store" });
    const payload = (await response.json()) as GrowthBoardResponse & { error?: string };

    if (!response.ok) {
      throw new Error(payload.error ?? "Unable to load Growth Board.");
    }

    setData(payload);
  }

  useEffect(() => {
    loadBoard()
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load Growth Board."))
      .finally(() => setLoading(false));
  }, []);

  const activeAgentKeys = useMemo(() => {
    const keys = new Set<string>();
    data?.board.learning.forEach((item) => keys.add(`${item.agent.id}:learning`));
    data?.board.earning.forEach((item) => keys.add(`${item.agent.id}:earning`));
    return keys;
  }, [data]);

  async function topUpCredits() {
    setBusyId("top-up");
    setError(null);

    try {
      const response = await fetch("/api/career7/wallet", { method: "POST" });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Unable to top up credits.");
      await loadBoard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to top up credits.");
    } finally {
      setBusyId(null);
    }
  }

  async function addAgent(agent: Career7Agent, path: "learning" | "earning") {
    setBusyId(`${agent.id}:${path}`);
    setError(null);

    try {
      const response = await fetch("/api/career7/growth-board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: agent.id, path }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Unable to add agent.");
      await loadBoard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add agent.");
    } finally {
      setBusyId(null);
    }
  }

  async function deactivateAgent(id: string) {
    setBusyId(id);
    setError(null);

    try {
      const response = await fetch("/api/career7/growth-board", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active: false }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Unable to remove agent.");
      await loadBoard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to remove agent.");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <div className="grid min-h-[360px] place-items-center rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
          <Loader2 className="animate-spin text-violet-600" size={20} />
          Loading Growth Board
        </div>
      </div>
    );
  }

  const marketplaceAgents = data?.marketplaceAgents ?? [];

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <section className="rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50 to-cyan-50 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-violet-600 shadow-sm">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="font-bold text-slate-950">NEXA Recommendation</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                {data?.nexaRecommendation}
              </p>
            </div>
          </div>
          <div className="rounded-2xl bg-white px-4 py-3 text-right shadow-sm">
            <p className="text-xs font-semibold uppercase text-slate-500">Credit Balance</p>
            <p className="text-2xl font-bold text-slate-950">{data?.wallet.balance ?? 0}</p>
            <button
              type="button"
              onClick={topUpCredits}
              disabled={busyId === "top-up"}
              className="mt-2 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
            >
              Dummy Top Up
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <PathPanel
          title="Learning Path"
          subtitle="Agents that improve skills, language, exams and career readiness."
          path="learning"
          items={data?.board.learning ?? []}
          count={data?.activeCounts.learning ?? 0}
          onDeactivate={deactivateAgent}
          busyId={busyId}
        />
        <PathPanel
          title="Earning Path"
          subtitle="Agents that help find jobs, income streams and financial momentum."
          path="earning"
          items={data?.board.earning ?? []}
          count={data?.activeCounts.earning ?? 0}
          onDeactivate={deactivateAgent}
          busyId={busyId}
        />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-950">Marketplace Agents</h3>
            <p className="mt-1 text-sm text-slate-500">
              Add requestable Career7 agents to your Learning or Earning path.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
            {data?.activeCounts.total ?? 0} total active
          </span>
        </div>

        {marketplaceAgents.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {marketplaceAgents.map((agent) => {
              const suggestedPath = pathForAgent(agent);
              const alternatePath = suggestedPath === "learning" ? "earning" : "learning";
              const suggestedActive = activeAgentKeys.has(`${agent.id}:${suggestedPath}`);
              const alternateActive = activeAgentKeys.has(`${agent.id}:${alternatePath}`);
              const insufficientCredits =
                Boolean(data?.paymentModeEnabled) &&
                agent.creditPrice > (data?.wallet.balance ?? 0);

              return (
                <div key={agent.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-start gap-3">
                    <AgentAvatar agent={agent} />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-950">{agent.name}</p>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
                        {agent.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-bold uppercase text-violet-700">
                      {agent.type ?? "career"}
                    </span>
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                      {agent.creditPrice} credits
                    </span>
                  </div>
                  {insufficientCredits && (
                    <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                      Insufficient credits to activate this agent.
                    </p>
                  )}
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => addAgent(agent, "learning")}
                      disabled={
                        insufficientCredits ||
                        busyId === `${agent.id}:learning` ||
                        (suggestedPath === "learning" ? suggestedActive : activeAgentKeys.has(`${agent.id}:learning`))
                      }
                      className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-3 py-2 text-xs font-bold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      <Plus size={14} />
                      Learning
                    </button>
                    <button
                      type="button"
                      onClick={() => addAgent(agent, "earning")}
                      disabled={
                        insufficientCredits ||
                        busyId === `${agent.id}:earning` ||
                        (alternatePath === "earning" ? alternateActive : activeAgentKeys.has(`${agent.id}:earning`))
                      }
                      className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      <Plus size={14} />
                      Earning
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="font-semibold text-slate-700">No Career7 marketplace agents available yet.</p>
            <p className="mt-1 text-sm text-slate-500">
              Add Career7-enabled agents in the existing marketplace admin.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
