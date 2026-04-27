"use client";

import { useEffect, useState } from "react";

import type { IntegrationHealthItem } from "@/components/sde/types";
import { EmptyState } from "@/components/ui/EmptyState";

type IntegrationHealthProps = {
  integrations: IntegrationHealthItem[];
  compact?: boolean;
};

function statusColor(status: string) {
  if (status === "healthy") return "bg-[#22D9A0]";
  if (status === "degraded") return "bg-[#F5A623]";
  if (status === "down") return "bg-[#FF6B6B]";
  return "bg-zinc-500";
}

function timeAgo(value: string | Date) {
  const minutes = Math.floor((Date.now() - new Date(value).getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  return `${Math.floor(minutes / 60)} hours ago`;
}

export function IntegrationHealth({ integrations, compact = false }: IntegrationHealthProps) {
  const [items, setItems] = useState(integrations);
  const [checking, setChecking] = useState(false);
  const hasDown = items.some((item) => item.status === "down");

  async function runCheck() {
    setChecking(true);
    const response = await fetch("/api/sde/integrations/check", { method: "POST" });
    setChecking(false);
    if (response.ok) {
      const data = (await response.json()) as { integrations: IntegrationHealthItem[] };
      setItems(data.integrations);
    }
  }

  useEffect(() => {
    if (compact) return;
    const interval = window.setInterval(() => void runCheck(), 300000);
    return () => window.clearInterval(interval);
  }, [compact]);

  return (
    <section className="rounded-2xl border border-white/10 bg-[#13131c] p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-heading text-base font-bold text-white">Integration Health</h2>
        {!compact ? <button type="button" onClick={() => void runCheck()} className="rounded-lg bg-[#7C6FFF] px-3 py-2 text-xs font-bold text-white">{checking ? "Checking..." : "Run health check"}</button> : null}
      </div>
      {hasDown ? <div className="mb-4 rounded-xl border border-[#FF6B6B]/30 bg-[#FF6B6B]/10 p-3 text-sm text-[#FF6B6B]">Integration issue detected. Check the escalation feed.</div> : null}
      {items.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((item) => (
          <div key={item.id} className={`rounded-xl border border-white/10 bg-[#0e0e13] p-4 ${checking ? "animate-pulse" : ""}`}>
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-heading text-sm font-bold text-white">{item.name}</h3>
              <span className={`h-4 w-4 rounded-full ${statusColor(item.status)}`} />
            </div>
            <span className="mt-2 inline-flex rounded-full bg-white/5 px-2 py-1 text-[10px] font-bold text-zinc-500">{item.type}</span>
            <div className="mt-3 text-xs text-zinc-500">
              <p>{item.responseTime ?? "-"} ms</p>
              <p>Checked {timeAgo(item.lastChecked)}</p>
            </div>
          </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No integrations tracked yet"
          description="Run a health check to initialize the default integrations."
        />
      )}
    </section>
  );
}
