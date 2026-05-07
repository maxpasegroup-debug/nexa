"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Career7Badge, Career7Button, Career7Card, Career7EmptyState } from "@/components/career7";
import { career7Api, getApiErrorMessage, type Career7Agent } from "@/lib/api";
import { Career7DashboardShell } from "../dashboard-shell";

type AgentCategory =
  | "Learning"
  | "Earning"
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
  "Learning",
  "Earning",
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

function mapAgent(agent: Career7Agent, index: number): StoreAgent {
  return {
    id: agent.id,
    slug: agent.slug,
    icon: agent.icon || initials(agent.name),
    title: agent.name,
    category: toAgentCategory(agent.type),
    description: agent.description,
    price: agent.creditPrice,
    accent: accentCycle[index % accentCycle.length],
    trending: Boolean(agent.isFeatured || (agent.sortOrder !== undefined && agent.sortOrder <= 3)),
    featured: Boolean(agent.isFeatured),
    status: agent.status,
  };
}

function tabToApiType(tab: StoreTab) {
  return tab === "All" ? undefined : tab.toUpperCase();
}

function AgentIcon({ agent }: { agent: StoreAgent }) {
  return (
    <span
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-gradient-to-br text-sm font-black text-white shadow-lg ${accentClass[agent.accent]}`}
      aria-hidden="true"
    >
      {agent.icon.slice(0, 3).toUpperCase()}
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

function AgentCard({ agent }: { agent: StoreAgent }) {
  return (
    <article className="group flex h-full flex-col rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm c7-lift-card">
      <div className="flex items-start gap-3">
        <AgentIcon agent={agent} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link
                href={`/agent-store/${agent.slug}`}
                className="block truncate text-base font-black text-slate-950 transition hover:text-indigo-700"
              >
                {agent.title}
              </Link>
              <p className="mt-1 text-xs font-bold text-slate-500">{agent.category}</p>
            </div>
            {agent.trending ? (
              <Career7Badge tone="emerald" className="shrink-0 px-2 py-1 text-[11px]">
                Hot
              </Career7Badge>
            ) : null}
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 c7-muted">{agent.description}</p>

      <div className="mt-5 flex flex-1 items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">
            Credits
          </p>
          <p className="mt-1 text-lg font-black text-slate-950">
            {agent.price.toLocaleString()}
          </p>
        </div>
        <Career7Button href={`/agent-store/${agent.slug}`} size="sm" variant="dark" className="min-w-20">
          Details
        </Career7Button>
      </div>
    </article>
  );
}

function FeaturedAgent({ agent }: { agent: StoreAgent }) {
  return (
    <article className="flex min-h-full flex-col rounded-[22px] border border-white/16 bg-white/12 p-4 text-white ring-1 ring-white/10">
      <div className="flex items-start justify-between gap-4">
        <AgentIcon agent={agent} />
        <span className="rounded-full bg-white/16 px-3 py-1 text-xs font-black text-white/82">
          {agent.price.toLocaleString()} credits
        </span>
      </div>
      <Link
        href={`/agent-store/${agent.slug}`}
        className="mt-6 text-xl font-black tracking-tight transition hover:text-cyan-100"
      >
        {agent.title}
      </Link>
      <p className="mt-2 text-sm leading-6 text-white/72">{agent.description}</p>
      <div className="mt-5 flex flex-1 items-end justify-between gap-3">
        <span className="text-xs font-black uppercase tracking-[0.14em] text-white/58">
          {agent.category}
        </span>
        <Link
          href={`/agent-store/${agent.slug}`}
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
  const [agents, setAgents] = useState<StoreAgent[]>([]);
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
    if (!query) return agents;

    return agents.filter((agent) =>
      [agent.title, agent.category, agent.description, agent.status].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  }, [agents, search]);

  const featuredAgents = useMemo(() => {
    const featured = agents.filter((agent) => agent.featured).slice(0, 4);
    return featured.length > 0 ? featured : agents.slice(0, 4);
  }, [agents]);

  const trendingAgents = useMemo(() => {
    const trending = agents.filter((agent) => agent.trending).slice(0, 5);
    return trending.length > 0 ? trending : agents.slice(0, 5);
  }, [agents]);

  const lowestPrice = agents.length > 0 ? Math.min(...agents.map((agent) => agent.price)) : 0;
  const highestPrice = agents.length > 0 ? Math.max(...agents.map((agent) => agent.price)) : 0;

  return (
    <Career7DashboardShell
      activeHref="/agent-store"
      eyebrow="Agent Store"
      title="Agent Store"
      description="Install focused AI agents for learning, earning, career moves, exams, migration, finance, and Blizzway growth."
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Agent Store" }]}
    >
      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.38fr]">
        <div className="overflow-hidden rounded-[28px] bg-slate-950 p-5 text-white shadow-2xl shadow-slate-950/16">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">
                Featured agents
              </p>
              <h2 className="mt-3 max-w-2xl text-[1.65rem] font-black leading-tight tracking-tight sm:text-4xl">
                Build your personal career operating team.
              </h2>
              <p className="mt-4 max-w-2xl leading-7 text-white/70">
                Pick specialist agents for one focused job: practice, apply, earn, prepare, move,
                or manage money with a clearer plan.
              </p>
            </div>
            <div className="rounded-[22px] bg-white/10 p-4 ring-1 ring-white/10 lg:min-w-48">
              <p className="text-sm font-bold text-white/62">Marketplace</p>
              <p className="mt-2 text-4xl font-black">{agents.length}</p>
              <p className="mt-1 text-sm text-white/58">Career7 agents</p>
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
              featuredAgents.map((agent) => <FeaturedAgent key={agent.id} agent={agent} />)
            ) : (
              <div className="md:col-span-2 xl:col-span-4">
                <Career7EmptyState
                  title="No featured agents yet"
                  description="BGOS returned an empty Career7 marketplace. Add Career7 agents in BGOS to populate this shelf."
                />
              </div>
            )}
          </div>
        </div>

        <Career7Card as="section" className="flex flex-col justify-between">
          <StoreSectionTitle
            eyebrow="Store pulse"
            title="Marketplace signals"
            description="Live Career7 agent counts and credit pricing from BGOS marketplace data."
          />
          <div className="mt-5 grid grid-cols-2 gap-3">
            {[
              ["Agents", agents.length.toString()],
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
              <span className="sr-only">Search agents</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by agent, category, or goal..."
                className="h-12 w-full rounded-full border border-slate-200 bg-slate-50 px-5 text-sm font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              />
            </label>

            <div className="flex max-w-full gap-2 overflow-x-auto pb-1 lg:max-w-[620px]" aria-label="Agent filters">
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
            description="Popular Career7 agents from the currently loaded marketplace view."
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
              trendingAgents.map((agent, index) => (
                <div key={agent.id} className="flex items-center gap-3 rounded-[20px] bg-slate-50 p-3">
                  <span className="w-6 text-center text-sm font-black text-slate-400">
                    {index + 1}
                  </span>
                  <AgentIcon agent={agent} />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/agent-store/${agent.slug}`}
                      className="block truncate text-sm font-black text-slate-950 transition hover:text-indigo-700"
                    >
                      {agent.title}
                    </Link>
                    <p className="text-xs font-semibold c7-muted">{agent.category}</p>
                  </div>
                  <span className="shrink-0 text-sm font-black text-slate-950">{agent.price}</span>
                </div>
              ))
            ) : (
              <Career7EmptyState
                title="No trending agents"
                description="Trending agents will appear when BGOS returns featured or high-priority Career7 agents."
              />
            )}
          </div>
        </Career7Card>

        <section>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <StoreSectionTitle
              eyebrow="Browse"
              title={activeTab === "All" ? "All agents" : `${activeTab} agents`}
              description={`${filteredAgents.length} Career7 agent${filteredAgents.length === 1 ? "" : "s"} match your current view.`}
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
                {filteredAgents.map((agent) => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
              </div>
            ) : (
              <Career7EmptyState
                title="No agents match this view"
                description="Try a softer search, switch categories, or return to the full store to keep browsing."
                actionLabel="Show all agents"
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
