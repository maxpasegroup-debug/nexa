"use client";

import { useEffect, useMemo, useState } from "react";

import { BlizzwayBadge, BlizzwayButton, BlizzwayCard, BlizzwayEmptyState, BlizzwayGradientPanel } from "@/components/blizzway";
import { BlizzwayApi, getApiErrorMessage } from "@/lib/api";
import {
  blizzwayMarketplaceCategories,
  filterMarketplaceItems,
  groupMarketplaceItems,
  initials,
  toBlizzwayMarketplaceItem,
  type BlizzwayMarketplaceItem,
} from "@/lib/blizzway/marketplace";
import { BlizzwayDashboardShell } from "../dashboard-shell";

function CompanionCard({ item }: { item: BlizzwayMarketplaceItem }) {
  return (
    <BlizzwayCard as="article" variant="companion" className="flex h-full flex-col c7-lift-card">
      <div className="flex items-start justify-between gap-3">
        <span className="c7-icon-tile">{item.icon || initials(item.name)}</span>
        <BlizzwayBadge tone={item.recommended ? "emerald" : "slate"}>
          {item.recommended ? "Recommended" : item.level}
        </BlizzwayBadge>
      </div>
      <h3 className="mt-5 text-xl font-black leading-tight text-slate-950">{item.name}</h3>
      <p className="mt-3 flex-1 text-sm leading-6 c7-muted">{item.description}</p>
      <div className="mt-5 rounded-2xl bg-indigo-50 p-3">
        <p className="text-xs font-black uppercase tracking-[0.12em] text-indigo-700">Guardian-style role</p>
        <p className="mt-1 text-sm font-semibold text-indigo-700/80">
          Guides with warmth, clarity, and practical next actions.
        </p>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="font-black text-slate-950">{item.credits || 0} credits</p>
        <BlizzwayButton href={`/agent-store/${item.slug}`} size="sm" variant={item.recommended ? "primary" : "secondary"}>
          Details
        </BlizzwayButton>
      </div>
    </BlizzwayCard>
  );
}

function LoadingCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {[0, 1, 2, 3, 4, 5].map((item) => (
        <div key={item} className="rounded-[22px] border border-slate-200 bg-white p-5">
          <div className="h-12 w-12 animate-pulse rounded-2xl bg-slate-200" />
          <div className="mt-5 h-5 w-40 animate-pulse rounded-full bg-slate-200" />
          <div className="mt-4 h-4 w-full animate-pulse rounded-full bg-slate-100" />
          <div className="mt-3 h-4 w-4/5 animate-pulse rounded-full bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

export function CompanionsClient() {
  const [items, setItems] = useState<BlizzwayMarketplaceItem[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCompanions() {
      setLoading(true);
      setError("");

      try {
        const response = await BlizzwayApi.getMarketplaceAgents();
        if (!active) return;
        setItems(response.agents.map(toBlizzwayMarketplaceItem));
      } catch (caught) {
        if (!active) return;
        setItems([]);
        setError(getApiErrorMessage(caught));
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadCompanions();

    return () => {
      active = false;
    };
  }, []);

  const visibleItems = useMemo(
    () => filterMarketplaceItems({ items, query: search, category: activeFilter }),
    [activeFilter, items, search],
  );
  const categoryHighlights = useMemo(
    () =>
      groupMarketplaceItems(items).map((group) => ({
        title: group.title,
        count: group.items.length,
        summary: group.summary,
      })),
    [items],
  );
  const groups = useMemo(() => groupMarketplaceItems(visibleItems), [visibleItems]);

  return (
    <BlizzwayDashboardShell
      activeHref="/companions"
      title="Companions"
      description="The full BGOS-powered companion catalogue, grouped by Blizzway service families."
    >
      <section className="mt-5 grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <BlizzwayGradientPanel>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">Companion catalogue</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight">Build your personal support constellation.</h2>
          <p className="mt-4 max-w-2xl leading-7 text-white/72">
            {items.length} BGOS companions and tools are visible across every major Blizzway growth category.
          </p>
        </BlizzwayGradientPanel>

        <BlizzwayCard as="section" className="c7-magical-glow">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">NEXA suggestion</p>
          <h2 className="mt-3 text-2xl font-black text-slate-950">Start with three companions.</h2>
          <p className="mt-3 text-sm leading-6 c7-muted">
            NEXA recommends one profile companion, one learning companion, and one happiness companion before expanding.
          </p>
          <label className="mt-5 block">
            <span className="text-sm font-black text-slate-700">Search companions</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by companion, goal, or category..."
              className="mt-3 h-12 w-full rounded-full border border-slate-200 bg-slate-50 px-5 text-sm font-semibold outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            />
          </label>
          <div className="mt-5 flex max-h-32 flex-wrap gap-2 overflow-y-auto pr-1">
            {["All", ...blizzwayMarketplaceCategories].map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full border px-3 py-2 text-[11px] font-black ${
                  activeFilter === filter
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-700"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </BlizzwayCard>
      </section>

      {error ? (
        <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">
          {error}
        </div>
      ) : null}

      <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {categoryHighlights.map((category) => (
          <BlizzwayCard key={category.title} as="section" className="c7-magical-glow">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-600">{category.title}</p>
            <p className="mt-3 text-4xl font-black text-slate-950">{category.count}</p>
            <p className="mt-2 text-sm leading-6 c7-muted">{category.summary}</p>
          </BlizzwayCard>
        ))}
      </section>

      <section className="mt-7 grid gap-7">
        {loading ? (
          <LoadingCards />
        ) : visibleItems.length ? (
          groups.map((group) => (
            <div key={group.title}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">{group.tone}</p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">{group.title}</h2>
                </div>
                <BlizzwayBadge tone="slate">{group.items.length} companions</BlizzwayBadge>
              </div>
              <div className="mt-4">
                {group.items.length ? (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {group.items.map((item) => <CompanionCard key={item.id} item={item} />)}
                  </div>
                ) : (
                  <p className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold c7-muted">
                    No BGOS companions in this category yet.
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <BlizzwayEmptyState
            title="No companions match this view"
            description="Try clearing search or switching category filters."
          />
        )}
      </section>
    </BlizzwayDashboardShell>
  );
}
