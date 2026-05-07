"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Career7Badge, Career7Button, Career7Card, Career7EmptyState } from "@/components/career7";
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

type Agent = {
  id: string;
  icon: string;
  title: string;
  category: AgentCategory;
  description: string;
  price: number;
  accent: "indigo" | "cyan" | "emerald" | "amber" | "rose" | "violet" | "slate" | "teal";
  trending?: boolean;
  featured?: boolean;
  installs: string;
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

const agents: Agent[] = [
  {
    id: "english-teacher",
    icon: "EN",
    title: "English Teacher",
    category: "Language",
    description: "Daily workplace speaking drills, vocabulary upgrades, and confidence prompts.",
    price: 120,
    accent: "cyan",
    trending: true,
    featured: true,
    installs: "12.4k",
  },
  {
    id: "resume-architect",
    icon: "CV",
    title: "Resume Architect",
    category: "Career",
    description: "Turns rough experience into proof-led bullets, role fit, and recruiter clarity.",
    price: 180,
    accent: "indigo",
    trending: true,
    featured: true,
    installs: "9.8k",
  },
  {
    id: "freelance-finder",
    icon: "FF",
    title: "Freelance Finder",
    category: "Earning",
    description: "Finds starter gigs, packages your skills, and drafts outreach messages.",
    price: 160,
    accent: "emerald",
    trending: true,
    installs: "7.2k",
  },
  {
    id: "ielts-coach",
    icon: "IE",
    title: "IELTS Coach",
    category: "Exam",
    description: "Practice plans for speaking, writing, and timed mock test improvement.",
    price: 220,
    accent: "violet",
    featured: true,
    installs: "6.5k",
  },
  {
    id: "visa-expert",
    icon: "VE",
    title: "Visa Expert",
    category: "Migration",
    description: "Organizes country options, document checklists, and next best application steps.",
    price: 260,
    accent: "teal",
    installs: "4.1k",
  },
  {
    id: "money-habit",
    icon: "$",
    title: "Money Habit Coach",
    category: "Finance",
    description: "Keeps savings goals, spending discipline, and weekly earning targets visible.",
    price: 140,
    accent: "amber",
    trending: true,
    installs: "8.3k",
  },
  {
    id: "course-builder",
    icon: "LB",
    title: "Learning Builder",
    category: "Learning",
    description: "Builds a focused skill sprint with lessons, tasks, review days, and milestones.",
    price: 110,
    accent: "rose",
    installs: "5.9k",
  },
  {
    id: "interview-lab",
    icon: "IL",
    title: "Interview Lab",
    category: "Career",
    description: "Runs mock interviews, tightens answers, and improves role-specific storytelling.",
    price: 200,
    accent: "slate",
    featured: true,
    installs: "10.1k",
  },
  {
    id: "blizzway-mentor",
    icon: "BZ",
    title: "Blizzway Mentor",
    category: "Blizzway",
    description: "Premium sprint guidance for proof, mentor readiness, and high-signal growth moves.",
    price: 340,
    accent: "indigo",
    featured: true,
    installs: "3.7k",
  },
  {
    id: "job-scout",
    icon: "JS",
    title: "Job Scout AI",
    category: "Earning",
    description: "Shortlists roles, maps fit gaps, and drafts fast application action plans.",
    price: 190,
    accent: "cyan",
    trending: true,
    installs: "11.6k",
  },
  {
    id: "scholarship-radar",
    icon: "SR",
    title: "Scholarship Radar",
    category: "Migration",
    description: "Tracks study-abroad funding paths, deadlines, eligibility notes, and task lists.",
    price: 230,
    accent: "emerald",
    installs: "2.9k",
  },
  {
    id: "exam-planner",
    icon: "EP",
    title: "Exam Planner",
    category: "Exam",
    description: "Creates a calm prep calendar with revision blocks, weak spots, and mock days.",
    price: 130,
    accent: "amber",
    installs: "6.1k",
  },
];

const accentClass: Record<Agent["accent"], string> = {
  indigo: "from-indigo-600 to-sky-500 shadow-indigo-500/18",
  cyan: "from-cyan-500 to-blue-600 shadow-cyan-500/18",
  emerald: "from-emerald-500 to-teal-600 shadow-emerald-500/18",
  amber: "from-amber-400 to-orange-500 shadow-amber-500/18",
  rose: "from-rose-500 to-pink-600 shadow-rose-500/18",
  violet: "from-violet-500 to-fuchsia-600 shadow-violet-500/18",
  slate: "from-slate-800 to-slate-600 shadow-slate-500/18",
  teal: "from-teal-500 to-cyan-600 shadow-teal-500/18",
};

function AgentIcon({ agent }: { agent: Agent }) {
  return (
    <span
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-gradient-to-br text-sm font-black text-white shadow-lg ${accentClass[agent.accent]}`}
      aria-hidden="true"
    >
      {agent.icon}
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

function AgentCard({ agent, compact = false }: { agent: Agent; compact?: boolean }) {
  return (
    <article className="group flex h-full flex-col rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm c7-lift-card">
      <div className="flex items-start gap-3">
        <AgentIcon agent={agent} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link
                href={`/agent-store/${agent.id}`}
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

      <p className={`mt-4 text-sm leading-6 c7-muted ${compact ? "line-clamp-2" : ""}`}>
        {agent.description}
      </p>

      <div className="mt-5 flex flex-1 items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">
            Credits
          </p>
          <p className="mt-1 text-lg font-black text-slate-950">{agent.price}</p>
        </div>
        <Career7Button type="button" size="sm" variant="dark" className="min-w-20">
          Add
        </Career7Button>
      </div>
    </article>
  );
}

function FeaturedAgent({ agent }: { agent: Agent }) {
  return (
    <article className="flex min-h-full flex-col rounded-[22px] border border-white/16 bg-white/12 p-4 text-white ring-1 ring-white/10">
      <div className="flex items-start justify-between gap-4">
        <AgentIcon agent={agent} />
        <span className="rounded-full bg-white/16 px-3 py-1 text-xs font-black text-white/82">
          {agent.price} credits
        </span>
      </div>
      <Link
        href={`/agent-store/${agent.id}`}
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
          href={`/agent-store/${agent.id}`}
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

  const filteredAgents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return agents.filter((agent) => {
      const matchesTab = activeTab === "All" || agent.category === activeTab;
      const matchesSearch =
        query.length === 0 ||
        [agent.title, agent.category, agent.description].some((value) =>
          value.toLowerCase().includes(query),
        );

      return matchesTab && matchesSearch;
    });
  }, [activeTab, search]);

  const featuredAgents = agents.filter((agent) => agent.featured).slice(0, 4);
  const trendingAgents = agents.filter((agent) => agent.trending).slice(0, 5);

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
              <p className="text-sm font-bold text-white/62">Dummy balance</p>
              <p className="mt-2 text-4xl font-black">2,400</p>
              <p className="mt-1 text-sm text-white/58">credits available</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {featuredAgents.map((agent) => (
              <FeaturedAgent key={agent.id} agent={agent} />
            ))}
          </div>
        </div>

        <Career7Card as="section" className="flex flex-col justify-between">
          <StoreSectionTitle
            eyebrow="Store pulse"
            title="Premium picks"
            description="Dummy marketplace signals for what Career7 users are installing most."
          />
          <div className="mt-5 grid grid-cols-2 gap-3">
            {[
              ["Agents", agents.length.toString()],
              ["Trending", trendingAgents.length.toString()],
              ["Lowest", "110"],
              ["Highest", "340"],
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
            description="Popular dummy agents with strong day-one usefulness."
          />
          <div className="mt-5 grid gap-3">
            {trendingAgents.map((agent, index) => (
              <div key={agent.id} className="flex items-center gap-3 rounded-[20px] bg-slate-50 p-3">
                <span className="w-6 text-center text-sm font-black text-slate-400">
                  {index + 1}
                </span>
                <AgentIcon agent={agent} />
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/agent-store/${agent.id}`}
                    className="block truncate text-sm font-black text-slate-950 transition hover:text-indigo-700"
                  >
                    {agent.title}
                  </Link>
                  <p className="text-xs font-semibold c7-muted">{agent.installs} installs</p>
                </div>
                <span className="shrink-0 text-sm font-black text-slate-950">{agent.price}</span>
              </div>
            ))}
          </div>
        </Career7Card>

        <section>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <StoreSectionTitle
              eyebrow="Browse"
              title={activeTab === "All" ? "All agents" : `${activeTab} agents`}
              description={`${filteredAgents.length} dummy agents match your current view.`}
            />
            <Career7Badge tone="slate" className="self-start sm:self-auto">
              Dummy data only
            </Career7Badge>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>

          {filteredAgents.length === 0 ? (
            <div className="mt-5">
              <Career7EmptyState
                title="No agents match this view"
                description="Try a softer search, switch categories, or return to the full store to keep browsing."
                actionLabel="Show all agents"
                actionHref="/agent-store"
                secondaryLabel="Open Quick Boosts"
                secondaryHref="/quick-boosts"
              />
            </div>
          ) : null}
        </section>
      </section>
    </Career7DashboardShell>
  );
}
