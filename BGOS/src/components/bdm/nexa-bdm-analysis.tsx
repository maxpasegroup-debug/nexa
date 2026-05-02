"use client";

import { useEffect, useState } from "react";

type Pattern = {
  title?: string;
  message?: string;
};

type Analysis = {
  callsMade: number;
  conversations: number;
  demoBookings: number;
  noteQualityScore: number;
  warnings: Pattern[];
  tips: Pattern[];
  urgentAlerts: string[];
  topHooks: string[];
  commonPains: string[];
  lastAnalysedAt: string;
};

function timeLabel(value?: string) {
  if (!value) return "Not analysed yet";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function scoreClass(score: number) {
  if (score > 70) return "text-[#22D9A0]";
  if (score >= 50) return "text-[#F5A623]";
  return "text-[#FF6B6B]";
}

function Skeleton() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((item) => (
        <div key={item} className="h-24 animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]" />
      ))}
    </div>
  );
}

export function NexaBDMAnalysis({ onPainClick }: { onPainClick?: (pain: string) => void }) {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [slow, setSlow] = useState(false);

  async function load(method: "GET" | "POST" = "GET") {
    setLoading(true);
    setSlow(false);
    const timer = window.setTimeout(() => setSlow(true), 10_000);
    const response = await fetch("/api/bdm/analysis", { method, cache: "no-store" });
    window.clearTimeout(timer);
    setLoading(false);
    if (!response.ok) return;
    const data = (await response.json()) as { analysis: Analysis | null };
    setAnalysis(data.analysis);
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <section className="rounded-2xl border border-white/10 bg-[#13131c] p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#7C6FFF]/20 font-heading font-bold text-[#c8c2ff]">
            NX
          </div>
          <div>
            <h2 className="font-heading text-xl font-bold text-white">NEXA — Your weekly analysis</h2>
            <p className="text-xs text-zinc-500">Last analysed: {timeLabel(analysis?.lastAnalysedAt)}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void load("POST")}
          disabled={loading}
          className="rounded-xl border border-[#7C6FFF]/40 px-4 py-2 text-sm font-bold text-[#c8c2ff] disabled:opacity-50"
        >
          Refresh →
        </button>
      </div>

      {loading ? (
        <div className="mt-6">
          <Skeleton />
          {slow ? (
            <p className="mt-4 text-sm text-zinc-400">
              NEXA is analysing your notes — this takes about 15 seconds.
            </p>
          ) : null}
        </div>
      ) : !analysis ? (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm text-zinc-400">
          Add call notes to your leads and NEXA will start coaching you here.
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <div className="grid gap-3 md:grid-cols-4">
            {[
              ["Calls made", analysis.callsMade],
              ["Meaningful conversations", analysis.conversations],
              ["Demo bookings", analysis.demoBookings],
              ["Note quality score", analysis.noteQualityScore],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-[#0e0e13] p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">{label}</p>
                <p className={`mt-2 font-heading text-2xl font-bold ${label === "Note quality score" ? scoreClass(Number(value)) : "text-white"}`}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {analysis.warnings.map((item, index) => (
              <div key={`warning-${index}`} className="rounded-2xl border border-[#F5A623]/30 bg-[#F5A623]/10 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#F5A623]">⚠️ Pattern detected</p>
                <h3 className="mt-2 font-heading font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-300">{item.message}</p>
              </div>
            ))}
            {analysis.tips.map((item, index) => (
              <div key={`tip-${index}`} className="rounded-2xl border border-[#22D9A0]/30 bg-[#22D9A0]/10 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#22D9A0]">💡 What is working</p>
                <h3 className="mt-2 font-heading font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-300">{item.message}</p>
              </div>
            ))}
          </div>

          {analysis.urgentAlerts.length > 0 ? (
            <div className="rounded-2xl border border-[#FF6B6B]/30 bg-[#FF6B6B]/10 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#FF6B6B]">🔴 Urgent</p>
              <div className="mt-3 space-y-2">
                {analysis.urgentAlerts.map((alert, index) => (
                  <button key={`${alert}-${index}`} type="button" className="block text-left text-sm text-red-100">
                    {alert}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {analysis.topHooks.length > 0 ? (
            <div>
              <h3 className="font-heading text-lg font-bold text-white">Your best opening lines this week</h3>
              <ul className="mt-3 space-y-2">
                {analysis.topHooks.slice(0, 3).map((hook) => (
                  <li key={hook} className="italic text-[#22D9A0]">“{hook}”</li>
                ))}
              </ul>
            </div>
          ) : null}

          {analysis.commonPains.length > 0 ? (
            <div>
              <h3 className="font-heading text-lg font-bold text-white">What prospects are telling you</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {analysis.commonPains.map((pain) => (
                  <button
                    key={pain}
                    type="button"
                    onClick={() => onPainClick?.(pain)}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-zinc-300"
                  >
                    {pain}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
