"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

import { BlizzwayBadge, BlizzwayButton, BlizzwayCard, BlizzwayEmptyState, BlizzwayGradientPanel } from "@/components/blizzway";
import { companionsApi, getApiErrorMessage, type BlizzwayAgent } from "@/lib/api";
import { blizzwayMarketplaceCategories, filterMarketplaceItems, initials, toBlizzwayMarketplaceItem } from "@/lib/blizzway/marketplace";
import { BlizzwayDashboardShell } from "../dashboard-shell";

function pricingLabel(companion: BlizzwayAgent) {
  if (companion.pricingMode === "free" || companion.creditPrice === 0) return "Free";
  if (companion.pricingMode === "premium") return "Premium";
  if (companion.pricingMode === "subscription") return "Subscription";
  return `${companion.creditPrice} credits`;
}

function CompanionCard({ companion }: { companion: BlizzwayAgent }) {
  const item = toBlizzwayMarketplaceItem(companion);

  return (
    <BlizzwayCard as="article" variant="companion" className="flex h-full flex-col c7-lift-card">
      <div className="flex items-start justify-between gap-3">
        <span className="c7-icon-tile">{item.icon || initials(item.name)}</span>
        <div className="flex flex-wrap justify-end gap-2">
          {companion.active ? <BlizzwayBadge tone="emerald">Active</BlizzwayBadge> : null}
          <BlizzwayBadge tone={companion.pricingMode === "free" || companion.creditPrice === 0 ? "cyan" : "slate"}>
            {pricingLabel(companion)}
          </BlizzwayBadge>
        </div>
      </div>
      <h3 className="mt-5 text-xl font-black leading-tight text-slate-950">{companion.name}</h3>
      <p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-indigo-600">{item.category}</p>
      <p className="mt-3 flex-1 text-sm leading-6 c7-muted">{companion.shortDescription || companion.description}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {companion.isFeatured ? <BlizzwayBadge tone="purple">Featured</BlizzwayBadge> : null}
        {companion.isTrending ? <BlizzwayBadge tone="emerald">Trending</BlizzwayBadge> : null}
        {companion.isRequestable ? <BlizzwayBadge tone="slate">Requestable</BlizzwayBadge> : null}
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-sm font-black text-slate-950">{companion.activation?.attachedTo || "pathway"}</p>
        <BlizzwayButton href={`/companions/${companion.slug}`} size="sm" variant={companion.active ? "secondary" : "dark"}>
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
        </div>
      ))}
    </div>
  );
}

export function CompanionsClient() {
  const [companions, setCompanions] = useState<BlizzwayAgent[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestStatus, setRequestStatus] = useState("");
  const [requestForm, setRequestForm] = useState({
    title: "",
    category: "Requestable / Custom",
    description: "",
    expectedOutput: "",
  });

  useEffect(() => {
    let cancelled = false;

    companionsApi
      .getCompanions()
      .then((response) => {
        if (!cancelled) setCompanions(response.companions);
      })
      .catch((caught) => {
        if (!cancelled) {
          setCompanions([]);
          setError(getApiErrorMessage(caught));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleCompanions = useMemo(() => {
    const normalized = filterMarketplaceItems({
      items: companions.map(toBlizzwayMarketplaceItem),
      query: search,
      category: activeFilter,
    });
    const ids = new Set(normalized.map((item) => item.id));
    return companions.filter((item) => ids.has(item.id));
  }, [activeFilter, companions, search]);
  const featured = useMemo(() => companions.filter((item) => item.isFeatured).slice(0, 4), [companions]);
  const trending = useMemo(() => companions.filter((item) => item.isTrending).slice(0, 4), [companions]);
  const active = useMemo(() => companions.filter((item) => item.active), [companions]);

  async function submitCustomRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRequestStatus("Saving request...");

    try {
      const response = await companionsApi.requestCustomCompanion(requestForm);
      setRequestStatus(`Custom companion request saved as ${response.request.status}.`);
      setRequestForm({ title: "", category: "Requestable / Custom", description: "", expectedOutput: "" });
    } catch (caught) {
      setRequestStatus(getApiErrorMessage(caught));
    }
  }

  return (
    <BlizzwayDashboardShell
      activeHref="/companions"
      title="Companions"
      description="Discover, activate, and use Blizzway AI companions for profile, learning, earning, admissions, migration, communication, and growth."
    >
      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.78fr]">
        <BlizzwayGradientPanel>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">NEXA Companion System</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight">Build your personal career support team.</h2>
          <p className="mt-4 max-w-2xl leading-7 text-white/72">
            {companions.length} real BGOS companions are available across learning, earning, admissions, migration, communication, profile, and growth.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[[active.length, "active"], [featured.length, "featured"], [trending.length, "trending"]].map(([value, label]) => (
              <div key={label} className="rounded-2xl bg-white/14 p-4 ring-1 ring-white/14">
                <p className="text-3xl font-black">{value}</p>
                <p className="mt-1 text-sm text-white/70">{label}</p>
              </div>
            ))}
          </div>
        </BlizzwayGradientPanel>

        <BlizzwayCard as="section" className="c7-magical-glow">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Find companions</p>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search resume, IELTS, visa, focus..."
            className="mt-4 h-12 w-full rounded-full border border-slate-200 bg-slate-50 px-5 text-sm font-semibold outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          />
          <div className="mt-5 flex max-h-36 flex-wrap gap-2 overflow-y-auto pr-1">
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

      {error ? <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">{error}</div> : null}

      <section className="mt-5 grid gap-5 lg:grid-cols-2">
        <BlizzwayCard as="section">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Active companions</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Attached to your pathway</h2>
            </div>
            <BlizzwayBadge tone="emerald">{active.length} active</BlizzwayBadge>
          </div>
          <div className="mt-5 grid gap-3">
            {active.length ? active.slice(0, 4).map((item) => (
              <a key={item.id} href={`/companions/${item.slug}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-black text-slate-950">{item.name}</p>
                <p className="mt-1 text-sm font-semibold c7-muted">Attached to {item.activation?.attachedTo || "pathway"}</p>
              </a>
            )) : <BlizzwayEmptyState title="No active companions yet" description="Activate a free companion to attach it to My Pathway, Learning Garden, or Earning Universe." />}
          </div>
        </BlizzwayCard>

        <BlizzwayCard as="section">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Custom request</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Request a companion</h2>
          <form onSubmit={submitCustomRequest} className="mt-5 grid gap-3">
            <input value={requestForm.title} onChange={(event) => setRequestForm((form) => ({ ...form, title: event.target.value }))} placeholder="Companion title" className="h-11 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none focus:border-indigo-400" required />
            <input value={requestForm.description} onChange={(event) => setRequestForm((form) => ({ ...form, description: event.target.value }))} placeholder="What should it help you do?" className="h-11 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none focus:border-indigo-400" required />
            <input value={requestForm.expectedOutput} onChange={(event) => setRequestForm((form) => ({ ...form, expectedOutput: event.target.value }))} placeholder="Expected output" className="h-11 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none focus:border-indigo-400" />
            <BlizzwayButton type="submit" variant="dark">Save custom request</BlizzwayButton>
          </form>
          {requestStatus ? <p className="mt-3 text-sm font-bold text-indigo-700">{requestStatus}</p> : null}
        </BlizzwayCard>
      </section>

      <section className="mt-7 grid gap-7">
        {loading ? <LoadingCards /> : visibleCompanions.length ? (
          <div>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-2xl font-black tracking-tight text-slate-950">All companions</h2>
              <BlizzwayBadge tone="slate">{visibleCompanions.length} shown</BlizzwayBadge>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visibleCompanions.map((item) => <CompanionCard key={item.id} companion={item} />)}
            </div>
          </div>
        ) : <BlizzwayEmptyState title="No companions match this view" description="Try clearing search or switching category filters." />}
      </section>
    </BlizzwayDashboardShell>
  );
}
