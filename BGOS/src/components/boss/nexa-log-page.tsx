"use client";

import { useEffect, useMemo, useState } from "react";
import { Bot, CheckCircle2, Database, Play, Sparkles } from "lucide-react";

type Tab = "insights" | "actions" | "memory";

type Insight = {
  id: string;
  type: string;
  message: string;
  action: string | null;
  priority: string;
  read: boolean;
  createdAt: string;
};

type NexaAction = {
  id: string;
  type: string;
  description: string;
  payload: unknown;
  status: string;
  triggeredBy: string;
  createdAt: string;
};

type Memory = {
  id: string;
  key: string;
  value: unknown;
  expiresAt: string | null;
  updatedAt: string;
};

type NexaLogPageProps = {
  cronSecret: string;
};

function badgeClass(value: string) {
  if (value === "warning" || value === "high" || value === "failed") {
    return "border-[#FF6B6B]/30 bg-[#FF6B6B]/10 text-[#FF6B6B]";
  }
  if (value === "opportunity" || value === "completed") {
    return "border-[#22D9A0]/30 bg-[#22D9A0]/10 text-[#22D9A0]";
  }
  if (value === "requested" || value === "medium") {
    return "border-[#F5A623]/30 bg-[#F5A623]/10 text-[#F5A623]";
  }
  return "border-[#7C6FFF]/30 bg-[#7C6FFF]/10 text-[#c6c1ff]";
}

function formatDate(value: string | null) {
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function truncateJson(value: unknown) {
  const text = JSON.stringify(value);
  if (!text) return "-";
  return text.length > 120 ? `${text.slice(0, 120)}...` : text;
}

function DevTools({ cronSecret }: { cronSecret: string }) {
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [result, setResult] = useState<unknown>(null);
  const isDevelopment = process.env.NODE_ENV === "development";

  const tools = [
    {
      key: "morning",
      label: "Run morning briefing now",
      url: "/api/cron/morning-briefing",
    },
    {
      key: "health",
      label: "Run health check now",
      url: "/api/cron/health-check",
    },
    {
      key: "stale",
      label: "Run stale lead check",
      url: "/api/cron/stale-leads",
    },
    {
      key: "snapshot",
      label: "Generate test snapshot",
      url: "/api/cron/daily-snapshot",
    },
  ];

  async function runTool(tool: (typeof tools)[number]) {
    setLoadingKey(tool.key);
    const response = await fetch(tool.url, {
      headers: {
        Authorization: `Bearer ${cronSecret}`,
      },
      cache: "no-store",
    });
    setResult(await response.json());
    setLoadingKey(null);
  }

  if (!isDevelopment) return null;

  return (
    <section className="rounded-2xl border border-[#F5A623]/20 bg-[#F5A623]/[0.04] p-6">
      <div className="mb-4 flex items-center gap-3">
        <Play className="h-5 w-5 text-[#F5A623]" />
        <div>
          <h2 className="font-heading text-lg font-bold text-white">
            Developer tools
          </h2>
          <p className="text-sm text-zinc-500">
            Manually trigger NEXA cron jobs while developing.
          </p>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {tools.map((tool) => (
          <button
            key={tool.key}
            type="button"
            onClick={() => void runTool(tool)}
            disabled={!cronSecret || loadingKey === tool.key}
            className="rounded-xl border border-white/10 bg-[#13131c] px-4 py-3 text-sm font-bold text-white transition hover:border-[#7C6FFF]/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingKey === tool.key ? "Running..." : tool.label}
          </button>
        ))}
      </div>
      {result ? (
        <pre className="mt-4 max-h-72 overflow-auto rounded-xl border border-white/10 bg-[#070709] p-4 text-xs text-zinc-300">
          {JSON.stringify(result, null, 2)}
        </pre>
      ) : null}
    </section>
  );
}

export function NexaLogPage({ cronSecret }: NexaLogPageProps) {
  const [tab, setTab] = useState<Tab>("insights");
  const [insights, setInsights] = useState<Insight[]>([]);
  const [actions, setActions] = useState<NexaAction[]>([]);
  const [memory, setMemory] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadLog() {
    setLoading(true);
    const response = await fetch("/api/nexa/log", { cache: "no-store" });
    setLoading(false);

    if (!response.ok) return;

    const data = (await response.json()) as {
      insights: Insight[];
      actions: NexaAction[];
      memory: Memory[];
    };
    setInsights(data.insights);
    setActions(data.actions);
    setMemory(data.memory);
  }

  async function markInsightRead(insightId: string) {
    await fetch("/api/nexa/log", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ insightId }),
    });
    setInsights((current) =>
      current.map((insight) =>
        insight.id === insightId ? { ...insight, read: true } : insight,
      ),
    );
  }

  async function markAllRead() {
    await fetch("/api/nexa/log", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    setInsights((current) =>
      current.map((insight) => ({ ...insight, read: true })),
    );
  }

  async function clearExpired() {
    await fetch("/api/nexa/log", { method: "DELETE" });
    await loadLog();
  }

  useEffect(() => {
    void loadLog();
  }, []);

  const tabs = useMemo(
    () => [
      { key: "insights" as const, label: "Insights", icon: Sparkles },
      { key: "actions" as const, label: "Actions", icon: CheckCircle2 },
      { key: "memory" as const, label: "Memory", icon: Database },
    ],
    [],
  );

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7C6FFF]/15 text-[#7C6FFF]">
            <Bot className="h-6 w-6" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-white">
            NEXA Activity Log
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-500">
            Review every insight, action, and memory NEXA has created for this
            business.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#13131c]">
        <div className="flex gap-2 border-b border-white/10 p-3">
          {tabs.map((item) => {
            const Icon = item.icon;
            const active = tab === item.key;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${
                  active
                    ? "bg-[#7C6FFF]/15 text-white"
                    : "text-zinc-500 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="p-5">
          {loading ? (
            <div className="h-48 animate-pulse rounded-xl bg-white/[0.04]" />
          ) : null}

          {!loading && tab === "insights" ? (
            <div>
              <div className="mb-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => void markAllRead()}
                  className="rounded-lg border border-[#7C6FFF]/30 px-3 py-2 text-xs font-bold text-[#c6c1ff] transition hover:bg-[#7C6FFF]/10"
                >
                  Mark all read
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] text-left text-sm">
                  <thead className="text-xs uppercase text-zinc-500">
                    <tr>
                      <th className="pb-3">Type</th>
                      <th className="pb-3">Message</th>
                      <th className="pb-3">Action</th>
                      <th className="pb-3">Priority</th>
                      <th className="pb-3">Read</th>
                      <th className="pb-3">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {insights.map((insight) => (
                      <tr
                        key={insight.id}
                        onClick={() => void markInsightRead(insight.id)}
                        className="cursor-pointer border-t border-white/5 transition hover:bg-white/[0.03]"
                      >
                        <td className="py-3">
                          <span className={`rounded-full border px-2 py-1 text-xs font-bold ${badgeClass(insight.type)}`}>
                            {insight.type}
                          </span>
                        </td>
                        <td className="max-w-[320px] py-3 text-white">
                          {insight.message}
                        </td>
                        <td className="py-3 text-zinc-400">
                          {insight.action ?? "-"}
                        </td>
                        <td className="py-3">
                          <span className={`rounded-full border px-2 py-1 text-xs font-bold ${badgeClass(insight.priority)}`}>
                            {insight.priority}
                          </span>
                        </td>
                        <td className="py-3 text-zinc-400">
                          {insight.read ? "Read" : "Unread"}
                        </td>
                        <td className="py-3 text-zinc-500">
                          {formatDate(insight.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {!loading && tab === "actions" ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="text-xs uppercase text-zinc-500">
                  <tr>
                    <th className="pb-3">Type</th>
                    <th className="pb-3">Description</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Triggered by</th>
                    <th className="pb-3">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {actions.map((action) => (
                    <tr key={action.id} className="border-t border-white/5">
                      <td className="py-3 text-[#c6c1ff]">{action.type}</td>
                      <td className="max-w-[420px] py-3 text-white">
                        {action.description}
                      </td>
                      <td className="py-3">
                        <span className={`rounded-full border px-2 py-1 text-xs font-bold ${badgeClass(action.status)}`}>
                          {action.status}
                        </span>
                      </td>
                      <td className="py-3 text-zinc-400">{action.triggeredBy}</td>
                      <td className="py-3 text-zinc-500">
                        {formatDate(action.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {!loading && tab === "memory" ? (
            <div>
              <div className="mb-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => void clearExpired()}
                  className="rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-zinc-300 transition hover:bg-white/5 hover:text-white"
                >
                  Clear expired
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="text-xs uppercase text-zinc-500">
                    <tr>
                      <th className="pb-3">Key</th>
                      <th className="pb-3">Value</th>
                      <th className="pb-3">Expires at</th>
                    </tr>
                  </thead>
                  <tbody>
                    {memory.map((item) => (
                      <tr key={item.id} className="border-t border-white/5">
                        <td className="py-3 font-semibold text-white">{item.key}</td>
                        <td className="max-w-[520px] py-3 font-mono text-xs text-zinc-400">
                          {truncateJson(item.value)}
                        </td>
                        <td className="py-3 text-zinc-500">
                          {formatDate(item.expiresAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <DevTools cronSecret={cronSecret} />
    </div>
  );
}
