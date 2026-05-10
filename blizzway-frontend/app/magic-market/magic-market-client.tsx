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

const filters = ["All", ...blizzwayMarketplaceCategories];

function CatalogueCard({ item }: { item: BlizzwayMarketplaceItem }) {
  return (
    <BlizzwayCard as="article" variant="companion" className="flex h-full flex-col c7-lift-card">
      <div className="flex items-start justify-between gap-3">
        <span className="c7-icon-tile">{item.icon || initials(item.name)}</span>
        {item.recommended ? (
          <BlizzwayBadge tone="emerald" className="shrink-0">Recommended</BlizzwayBadge>
        ) : (
          <BlizzwayBadge tone="slate" className="shrink-0">{item.level}</BlizzwayBadge>
        )}
      </div>
      <h3 className="mt-5 text-xl font-black leading-tight text-slate-950">{item.name}</h3>
      <p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-indigo-600">{item.category}</p>
      <p className="mt-3 flex-1 text-sm leading-6 c7-muted">{item.description}</p>
      <div className="mt-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">Credits</p>
          <p className="text-2xl font-black text-slate-950">{item.credits || 0}</p>
        </div>
        <BlizzwayButton href={`/agent-store/${item.slug}`} variant={item.recommended ? "primary" : "dark"} size="sm">
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

export function MagicMarketClient() {
  const [items, setItems] = useState<BlizzwayMarketplaceItem[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadMarketplace() {
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

    void loadMarketplace();

    return () => {
      active = false;
    };
  }, []);

  const visibleItems = useMemo(
    () => filterMarketplaceItems({ items, query: search, category: activeFilter }),
    [activeFilter, items, search],
  );
  const groups = useMemo(() => groupMarketplaceItems(visibleItems), [visibleItems]);
  const featured = useMemo(() => {
    const recommended = visibleItems.filter((item) => item.recommended).slice(0, 6);
    return recommended.length ? recommended : visibleItems.slice(0, 6);
  }, [visibleItems]);

  return (
    <BlizzwayDashboardShell
      activeHref="/magic-market"
      title="Magic Market"
      description="The complete Blizzway catalogue of services, companions, and premium career tools."
    >
      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.72fr]">
        <BlizzwayGradientPanel>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">Complete catalogue</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight">Every magical career service, powered by BGOS marketplace data.</h2>
          <p className="mt-4 max-w-2xl leading-7 text-white/72">
            Browse {items.length} tools across profile, language, exams, career growth, migration, earning, happiness, and premium pathways.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {["8 categories", `${items.length} tools`, `${featured.length} highlighted`].map((item) => (
              <div key={item} className="rounded-2xl bg-white/14 p-4 ring-1 ring-white/14">
                <p className="font-black">{item}</p>
                <p className="mt-2 text-sm text-white/70">BGOS catalogue</p>
              </div>
            ))}
          </div>
        </BlizzwayGradientPanel>

        <BlizzwayCard as="section" className="c7-magical-glow">
          <label className="block">
            <span className="text-sm font-black text-slate-700">Search catalogue</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search resume, IELTS, visa, confidence..."
              className="mt-3 h-12 w-full rounded-full border border-slate-200 bg-slate-50 px-5 text-sm font-semibold outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            />
          </label>
          <div className="mt-5 flex max-h-44 flex-wrap gap-2 overflow-y-auto pr-1">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full border px-4 py-2 text-xs font-black ${
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

      <section className="mt-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Featured companions</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Recommended by NEXA</h2>
          </div>
          <BlizzwayBadge tone="purple">Guardian picks</BlizzwayBadge>
        </div>
        <div className="mt-5">
          {loading ? (
            <LoadingCards />
          ) : featured.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {featured.map((item) => <CatalogueCard key={item.id} item={item} />)}
            </div>
          ) : (
            <BlizzwayEmptyState title="No companions found" description="BGOS returned no Blizzway marketplace agents for this view." />
          )}
        </div>
      </section>

      <section className="mt-7 grid gap-7">
        {groups.map((group) => (
          <div key={group.title}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">{group.tone}</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">{group.title}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 c7-muted">{group.summary}</p>
              </div>
              <BlizzwayBadge tone="slate">{group.items.length} services</BlizzwayBadge>
            </div>
            <div className="mt-4">
              {loading ? (
                <LoadingCards />
              ) : group.items.length ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {group.items.map((item) => <CatalogueCard key={item.id} item={item} />)}
                </div>
              ) : (
                <p className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold c7-muted">
                  No BGOS companions in this category yet.
                </p>
              )}
            </div>
          </div>
        ))}
      </section>
    </BlizzwayDashboardShell>
  );
}
