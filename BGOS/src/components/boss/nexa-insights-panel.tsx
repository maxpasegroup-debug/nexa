"use client";

import { RefreshCw } from "lucide-react";

import { EmptyState } from "@/components/ui/EmptyState";

type NexaInsight = {
  id: string;
  type: string;
  message: string;
  action?: string | null;
};

type NexaInsightsPanelProps = {
  insights: NexaInsight[];
  onRefresh: () => void;
  loading: boolean;
};

function insightStyle(type: string) {
  if (type === "warning") {
    return {
      border: "#FF6B6B",
      background: "rgba(255,107,107,0.1)",
      badge: "text-[#FF6B6B] border-[#FF6B6B]/30 bg-[#FF6B6B]/10",
    };
  }

  if (type === "opportunity") {
    return {
      border: "#22D9A0",
      background: "rgba(34,217,160,0.1)",
      badge: "text-[#22D9A0] border-[#22D9A0]/30 bg-[#22D9A0]/10",
    };
  }

  return {
    border: "#7C6FFF",
    background: "rgba(124,111,255,0.12)",
    badge: "text-[#b8b2ff] border-[#7C6FFF]/30 bg-[#7C6FFF]/10",
  };
}

export function NexaInsightsPanel({
  insights,
  onRefresh,
  loading,
}: NexaInsightsPanelProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#13131c] p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-heading text-lg font-bold">NEXA Insights</h2>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-[#7C6FFF]/40 px-3 py-2 text-sm font-semibold text-[#b8b2ff] transition hover:border-[#7C6FFF] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {insights.length > 0 ? (
          insights.map((insight) => {
            const style = insightStyle(insight.type);

            return (
              <div
                key={insight.id}
                className="rounded-xl border border-white/10 border-l-4 p-4 transition duration-200 hover:-translate-y-0.5 hover:border-white/20"
                style={{
                  borderLeftColor: style.border,
                  backgroundColor: style.background,
                }}
              >
                <span
                  className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${style.badge}`}
                >
                  {insight.type}
                </span>
                <p className="mt-3 text-[13px] font-medium leading-5 text-white">
                  {insight.message}
                </p>
                {insight.action ? (
                  <p className="mt-2 text-xs text-zinc-400">
                    → {insight.action}
                  </p>
                ) : null}
              </div>
            );
          })
        ) : (
          <EmptyState
            title="Nexa is analyzing your business data"
            description="Check back tomorrow for insights."
          />
        )}
      </div>
    </section>
  );
}

export type { NexaInsight };
