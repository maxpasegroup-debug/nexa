"use client";

import { useEffect, useState } from "react";

import { BlizzwayBadge, BlizzwayButton, BlizzwayCard, BlizzwayEmptyState, BlizzwayGradientPanel } from "@/components/blizzway";
import { getApiErrorMessage, quickBoostsApi, type QuickBoostsResponse } from "@/lib/api";
import { BlizzwayDashboardShell } from "../dashboard-shell";

export default function QuickBoostsPage() {
  const [data, setData] = useState<QuickBoostsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    quickBoostsApi.getQuickBoosts()
      .then((response) => {
        if (active) setData(response);
      })
      .catch((caught) => {
        if (active) setError(getApiErrorMessage(caught));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <BlizzwayDashboardShell
      activeHref="/quick-boosts"
      title="Quick Boosts"
      description="Fast, focused Blizzway tools for resume, interview, language, migration, finance, and proof-building progress."
    >
      {error ? (
        <BlizzwayCard as="section" className="mt-5">
          <p className="text-sm font-black text-rose-700">Unable to load quick boosts</p>
          <p className="mt-2 text-sm leading-6 c7-muted">{error}</p>
        </BlizzwayCard>
      ) : null}

      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.72fr]">
        <BlizzwayGradientPanel>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">Quick tools</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight">Pick a small boost. Feel better today.</h2>
          <p className="mt-4 max-w-2xl leading-7 text-white/72">
            {data?.total ?? 0} BGOS-backed boosts are available for small, focused career progress.
          </p>
        </BlizzwayGradientPanel>
        <BlizzwayCard as="section" className="c7-magical-glow">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">NEXA boost note</p>
          <h2 className="mt-3 text-2xl font-black text-slate-950">Choose the boost that removes friction.</h2>
          <p className="mt-3 text-sm leading-6 c7-muted">Resume, interview, language, migration, or finance. One bite-sized improvement is enough.</p>
        </BlizzwayCard>
      </section>

      <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          [0, 1, 2].map((item) => <div key={item} className="h-64 animate-pulse rounded-[22px] bg-white" />)
        ) : data?.boosts.length ? (
          data.boosts.map((boost) => (
            <BlizzwayCard key={boost.id} as="article" className="c7-lift-card bg-gradient-to-b from-white to-amber-50/50">
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 via-purple-400 to-cyan-300 text-sm font-black text-white">
                  {boost.title.split(" ").map((part) => part[0]).join("").slice(0, 2)}
                </span>
                <BlizzwayBadge tone="slate">{boost.category ?? boost.status}</BlizzwayBadge>
              </div>
              <h3 className="mt-5 text-xl font-black text-slate-950">{boost.title}</h3>
              <p className="mt-3 text-sm leading-6 c7-muted">{boost.description}</p>
              <div className="mt-5 flex items-center justify-between">
                <p className="text-lg font-black text-slate-950">{boost.creditPrice} credits</p>
                <BlizzwayButton type="button" size="sm">Preview</BlizzwayButton>
              </div>
            </BlizzwayCard>
          ))
        ) : (
          <BlizzwayEmptyState title="No quick boosts yet" description="Quick boosts will appear here once BGOS has active tools for your workspace." />
        )}
      </section>
    </BlizzwayDashboardShell>
  );
}
