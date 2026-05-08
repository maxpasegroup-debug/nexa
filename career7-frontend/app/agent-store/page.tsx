"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Career7Badge, Career7Button, Career7Card, Career7EmptyState } from "@/components/career7";
import { career7Api, getApiErrorMessage, type Career7Agent } from "@/lib/api";
import { Career7DashboardShell } from "../dashboard-shell";

type AgentCategory =
  | "Learning Garden"
  | "Earning Universe"
  | "Career"
  | "Language"
  | "Exam"
  | "Migration"
  | "Finance"
  | "Blizzway";

type StoreTab = "All" | AgentCategory;
type AgentAccent = "indigo" | "cyan" | "emerald" | "amber" | "rose" | "violet" | "slate" | "teal";

type StoreAgent = {
  id: string;
  slug: string;
  icon: string;
  title: string;
  category: AgentCategory;
  description: string;
  price: number;
  accent: AgentAccent;
  trending: boolean;
  featured: boolean;
  status: string;
};

const tabs: StoreTab[] = [
  "All",
  "Learning Garden",
  "Earning Universe",
  "Career",
  "Language",
  "Exam",
  "Migration",
  "Finance",
  "Blizzway",
];

const accentCycle: AgentAccent[] = ["indigo", "cyan", "emerald", "violet", "teal", "amber", "rose", "slate"];

const accentClass: Record<AgentAccent, string> = {
  indigo: "from-indigo-600 to-sky-500 shadow-indigo-500/18",
  cyan: "from-cyan-500 to-blue-600 shadow-cyan-500/18",
  emerald: "from-emerald-500 to-teal-600 shadow-emerald-500/18",
  amber: "from-amber-400 to-orange-500 shadow-amber-500/18",
  rose: "from-rose-500 to-pink-600 shadow-rose-500/18",
  violet: "from-violet-500 to-fuchsia-600 shadow-violet-500/18",
  slate: "from-slate-800 to-slate-600 shadow-slate-500/18",
  teal: "from-teal-500 to-cyan-600 shadow-teal-500/18",
};

function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function toAgentCategory(value: string | null): AgentCategory {
  const title = toTitleCase(value || "Career");
  if (title === "Learning") return "Learning Garden";
  if (title === "Earning") return "Earning Universe";
  return tabs.includes(title as StoreTab) && title !== "All" ? (title as AgentCategory) : "Career";
}

function initials(value: string) {
  return value
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function mapAgent(companion: Career7Agent, index: number): StoreAgent {
  return {
    id: companion.id,
    slug: companion.slug,
    icon: companion.icon || initials(companion.name),
    title: companion.name,
    category: toAgentCategory(companion.type),
    description: companion.description,
    price: companion.creditPrice,
    accent: accentCycle[index % accentCycle.length],
    trending: Boolean(companion.isFeatured || (companion.sortOrder !== undefined && companion.sortOrder <= 3)),
    featured: Boolean(companion.isFeatured),
    status: companion.status,
  };
}

function tabToApiType(tab: StoreTab) {
  if (tab === "All") return undefined;
  if (tab === "Learning Garden") return "LEARNING";
  if (tab === "Earning Universe") return "EARNING";
  return tab.toUpperCase();
}

function AgentIcon({ companion }: { companion: StoreAgent }) {
  return (
    <span
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-gradient-to-br text-sm font-black text-white shadow-lg ${accentClass[companion.accent]}`}
      aria-hidden="true"
    >
      {companion.icon.slice(0, 3).toUpperCase()}
    </span>
  );
}

function StoreSectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">{eyebrow}</p>
      <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">{title}</h2>
      <p className="mt-2 text-sm leading-6 c7-muted">{description}</p>
    </div>
  );
}

function LoadingGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {[0, 1, 2, 3, 4, 5].map((item) => (
        <div key={item} className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 animate-pulse rounded-[16px] bg-slate-200" />
            <div className="min-w-0 flex-1">
              <div className="h-4 w-32 animate-pulse rounded-full bg-slate-200" />
              <div className="mt-2 h-3 w-20 animate-pulse rounded-full bg-slate-100" />
            </div>
          </div>
          <div className="mt-5 h-4 w-full animate-pulse rounded-full bg-slate-100" />
          <div className="mt-3 h-4 w-4/5 animate-pulse rounded-full bg-slate-100" />
          <div className="mt-6 h-9 w-full animate-pulse rounded-full bg-slate-200" />
        </div>
      ))}
    </div>
  );
}

function AgentCard({ companion }: { companion: StoreAgent }) {
  return (
    <article className="group flex h-full flex-col rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm c7-lift-card">
      <div className="flex items-start gap-3">
        <AgentIcon companion={companion} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link
                href={`/agent-store/${companion.slug}`}
                className="block truncate text-base font-black text-slate-950 transition hover:text-indigo-700"
              >
                {companion.title}
              </Link>
              <p className="mt-1 text-xs font-bold text-slate-500">{companion.category}</p>
            </div>
            {companion.trending ? (
              <Career7Badge tone="emerald" className="shrink-0 px-2 py-1 text-[11px]">
                Hot
              </Career7Badge>
            ) : null}
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 c7-muted">{companion.description}</p>

      <div className="mt-5 flex flex-1 items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">
            Credits
          </p>
          <p className="mt-1 text-lg font-black text-slate-950">
            {companion.price.toLocaleString()}
          </p>
        </div>
        <Career7Button href={`/agent-store/${companion.slug}`} size="sm" variant="dark" className="min-w-20">
          Details
        </Career7Button>
      </div>
    </article>
  );
}

function FeaturedAgent({ companion }: { companion: StoreAgent }) {
  return (
    <article className="flex min-h-full flex-col rounded-[22px] border border-white/16 bg-white/12 p-4 text-white ring-1 ring-white/10">
      <div className="flex items-start justify-between gap-4">
        <AgentIcon companion={companion} />
        <span className="rounded-full bg-white/16 px-3 py-1 text-xs font-black text-white/82">
          {companion.price.toLocaleString()} credits
        </span>
      </div>
      <Link
        href={`/agent-store/${companion.slug}`}
        className="mt-6 text-xl font-black tracking-tight transition hover:text-cyan-100"
      >
        {companion.title}
      </Link>
      <p className="mt-2 text-sm leading-6 text-white/72">{companion.description}</p>
      <div className="mt-5 flex flex-1 items-end justify-between gap-3">
        <span className="text-xs font-black uppercase tracking-[0.14em] text-white/58">
          {companion.category}
        </span>
        <Link
          href={`/agent-store/${companion.slug}`}
          className="inline-flex min-h-10 items-center rounded-full bg-white px-4 text-sm font-black text-slate-950 transition hover:bg-cyan-50"
        >
          Details
        </Link>
      </div>
    </article>
  );
}

export default function AgentStorePage() {
  const [activeTab, setActiveTab] = useState<StoreTab>("All");
  const [search, setSearch] = useState("");
  const [companions, setAgents] = useState<StoreAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadAgents() {
      setLoading(true);
      setError("");

      try {
        const response = await career7Api.getMarketplaceAgents({
          type: tabToApiType(activeTab),
        });

        if (!active) return;

        setAgents(response.agents.map(mapAgent));
      } catch (caught) {
        if (!active) return;
        setAgents([]);
        setError(getApiErrorMessage(caught));
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadAgents();

    return () => {
      active = false;
    };
  }, [activeTab]);

  const filteredAgents = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return companions;

    return companions.filter((companion) =>
      [companion.title, companion.category, companion.description, companion.status].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  }, [companions, search]);

  const featuredAgents = useMemo(() => {
    const featured = companions.filter((companion) => companion.featured).slice(0, 4);
    return featured.length > 0 ? featured : companions.slice(0, 4);
  }, [companions]);

  const trendingAgents = useMemo(() => {
    const trending = companions.filter((companion) => companion.trending).slice(0, 5);
    return trending.length > 0 ? trending : companions.slice(0, 5);
  }, [companions]);

  const lowestPrice = companions.length > 0 ? Math.min(...companions.map((companion) => companion.price)) : 0;
  const highestPrice = companions.length > 0 ? Math.max(...companions.map((companion) => companion.price)) : 0;

  return (
    <Career7DashboardShell
      activeHref="/agent-store"
      eyebrow="Magic Market"
      title="Magic Market"
      description="Install focused Companions for Learning Garden, Earning Universe, career moves, exams, migration, finance, and Blizzway growth."
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Magic Market" }]}
    >
      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.38fr]">
        <div className="overflow-hidden rounded-[28px] bg-slate-950 p-5 text-white shadow-2xl shadow-slate-950/16">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">
                Featured companions
              </p>
              <h2 className="mt-3 max-w-2xl text-[1.65rem] font-black leading-tight tracking-tight sm:text-4xl">
                Build your personal career operating team.
              </h2>
              <p className="mt-4 max-w-2xl leading-7 text-white/70">
                Pick specialist companions for one focused job: practice, apply, earn, prepare, move,
                or manage money with a clearer plan.
              </p>
            </div>
            <div className="rounded-[22px] bg-white/10 p-4 ring-1 ring-white/10 lg:min-w-48">
              <p className="text-sm font-bold text-white/62">Marketplace</p>
              <p className="mt-2 text-4xl font-black">{companions.length}</p>
              <p className="mt-1 text-sm text-white/58">Blizzway companions</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {loading ? (
              [0, 1, 2, 3].map((item) => (
                <div key={item} className="min-h-56 rounded-[22px] border border-white/10 bg-white/10 p-4">
                  <div className="h-12 w-12 animate-pulse rounded-[16px] bg-white/20" />
                  <div className="mt-6 h-5 w-32 animate-pulse rounded-full bg-white/20" />
                  <div className="mt-4 h-4 w-full animate-pulse rounded-full bg-white/10" />
                  <div className="mt-3 h-4 w-4/5 animate-pulse rounded-full bg-white/10" />
                </div>
              ))
            ) : featuredAgents.length > 0 ? (
              featuredAgents.map((companion) => <FeaturedAgent key={companion.id} companion={companion} />)
            ) : (
              <div className="md:col-span-2 xl:col-span-4">
                <Career7EmptyState
                  title="No featured companions yet"
                  description="BGOS returned an empty Blizzway marketplace. Add Blizzway companions in BGOS to populate this shelf."
                />
              </div>
            )}
          </div>
        </div>

        <Career7Card as="section" className="flex flex-col justify-between">
          <StoreSectionTitle
            eyebrow="Store pulse"
            title="Marketplace signals"
            description="Live Blizzway companion counts and credit pricing from BGOS marketplace data."
          />
          <div className="mt-5 grid grid-cols-2 gap-3">
            {[
              ["companions", companions.length.toString()],
              ["Trending", trendingAgents.length.toString()],
              ["Lowest", lowestPrice.toString()],
              ["Highest", highestPrice.toString()],
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

      {error ? (
        <div className="mt-5 rounded-[24px] border border-rose-200 bg-rose-50 p-4 text-sm font-semibold leading-6 text-rose-700">
          {error}
        </div>
      ) : null}

      <section className="mt-5">
        <Career7Card as="div" className="p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Search companions</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by companion, category, or goal..."
                className="h-12 w-full rounded-full border border-slate-200 bg-slate-50 px-5 text-sm font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              />
            </label>

            <div className="flex max-w-full gap-2 overflow-x-auto pb-1 lg:max-w-[620px]" aria-label="companion filters">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`shrink-0 rounded-full border px-4 py-2 text-xs font-black transition ${
                    activeTab === tab
                      ? "border-slate-950 bg-slate-950 text-white shadow-lg shadow-slate-950/12"
                      : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </Career7Card>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[0.42fr_1fr]">
        <Career7Card as="section">
          <StoreSectionTitle
            eyebrow="Trending"
            title="Fast installs"
            description="Popular Blizzway companions from the currently loaded marketplace view."
          />
          <div className="mt-5 grid gap-3">
            {loading ? (
              [0, 1, 2, 3, 4].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-[20px] bg-slate-50 p-3">
                  <div className="h-6 w-6 animate-pulse rounded-full bg-slate-200" />
                  <div className="h-12 w-12 animate-pulse rounded-[16px] bg-slate-200" />
                  <div className="min-w-0 flex-1">
                    <div className="h-4 w-28 animate-pulse rounded-full bg-slate-200" />
                    <div className="mt-2 h-3 w-20 animate-pulse rounded-full bg-slate-100" />
                  </div>
                </div>
              ))
            ) : trendingAgents.length > 0 ? (
              trendingAgents.map((companion, index) => (
                <div key={companion.id} className="flex items-center gap-3 rounded-[20px] bg-slate-50 p-3">
                  <span className="w-6 text-center text-sm font-black text-slate-400">
                    {index + 1}
                  </span>
                  <AgentIcon companion={companion} />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/agent-store/${companion.slug}`}
                      className="block truncate text-sm font-black text-slate-950 transition hover:text-indigo-700"
                    >
                      {companion.title}
                    </Link>
                    <p className="text-xs font-semibold c7-muted">{companion.category}</p>
                  </div>
                  <span className="shrink-0 text-sm font-black text-slate-950">{companion.price}</span>
                </div>
              ))
            ) : (
              <Career7EmptyState
                title="No trending companions"
                description="Trending companions will appear when BGOS returns featured or high-priority Blizzway companions."
              />
            )}
          </div>
        </Career7Card>

        <section>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <StoreSectionTitle
              eyebrow="Browse"
              title={activeTab === "All" ? "All companions" : `${activeTab} companions`}
              description={`${filteredAgents.length} Blizzway companion${filteredAgents.length === 1 ? "" : "s"} match your current view.`}
            />
            <Career7Badge tone="slate" className="self-start sm:self-auto">
              BGOS marketplace
            </Career7Badge>
          </div>

          <div className="mt-5">
            {loading ? (
              <LoadingGrid />
            ) : filteredAgents.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredAgents.map((companion) => (
                  <AgentCard key={companion.id} companion={companion} />
                ))}
              </div>
            ) : (
              <Career7EmptyState
                title="No companions match this view"
                description="Try a softer search, switch categories, or return to the full store to keep browsing."
                actionLabel="Show all companions"
                actionHref="/agent-store"
                secondaryLabel="Open Quick Boosts"
                secondaryHref="/quick-boosts"
              />
            )}
          </div>
        </section>
      </section>
    </Career7DashboardShell>
  );
}
