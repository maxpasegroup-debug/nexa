"use client";

import { useEffect, useMemo, useState } from "react";

import { Career7Badge, Career7Button, Career7Card, Career7EmptyState } from "@/components/career7";
import { career7Api, getApiErrorMessage, type Career7WalletResponse, type Career7WalletTransaction } from "@/lib/api";
import { Career7DashboardShell } from "../dashboard-shell";

type TopUpPackage = {
  name: string;
  credits: number;
  price: string;
  bonus: string;
  tone: "indigo" | "cyan" | "emerald" | "amber";
  featured?: boolean;
};

type AgentPrice = {
  name: string;
  category: string;
  credits: number;
  demand: string;
};

const packages: TopUpPackage[] = [
  { name: "Starter", credits: 500, price: "$9", bonus: "Best for quick boosts", tone: "cyan" },
  { name: "Growth", credits: 1200, price: "$19", bonus: "+100 bonus credits", tone: "indigo", featured: true },
  { name: "Pro", credits: 2800, price: "$39", bonus: "+400 bonus credits", tone: "emerald" },
  { name: "Elite", credits: 6400, price: "$79", bonus: "Blizzway-ready pack", tone: "amber" },
];

const featuredPricing: AgentPrice[] = [
  { name: "Resume Architect", category: "Career", credits: 180, demand: "High" },
  { name: "English Teacher", category: "Language", credits: 120, demand: "Popular" },
  { name: "IELTS Coach", category: "Exam", credits: 220, demand: "Focused" },
  { name: "Freelance Finder", category: "Earning Universe", credits: 160, demand: "Fast" },
];

const toneClass: Record<TopUpPackage["tone"], string> = {
  indigo: "from-indigo-600 to-sky-500 shadow-indigo-500/18",
  cyan: "from-cyan-500 to-blue-600 shadow-cyan-500/18",
  emerald: "from-emerald-500 to-teal-600 shadow-emerald-500/18",
  amber: "from-amber-400 to-orange-500 shadow-amber-500/18",
};

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">{eyebrow}</p>
      <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">{title}</h2>
      {description ? <p className="mt-2 text-sm leading-6 c7-muted">{description}</p> : null}
    </div>
  );
}

function TopUpCard({ pack }: { pack: TopUpPackage }) {
  return (
    <article
      className={`relative overflow-hidden rounded-[24px] border bg-white p-5 shadow-sm ${
        pack.featured ? "border-indigo-200 shadow-xl shadow-indigo-500/10" : "border-slate-200"
      }`}
    >
      {pack.featured ? (
        <Career7Badge tone="indigo" className="absolute right-4 top-4">
          Best value
        </Career7Badge>
      ) : null}
      <span
        className={`flex h-12 w-12 items-center justify-center rounded-[18px] bg-gradient-to-br text-sm font-black text-white shadow-lg ${toneClass[pack.tone]}`}
      >
        BW
      </span>
      <h3 className="mt-5 text-xl font-black text-slate-950">{pack.name}</h3>
      <p className="mt-1 text-sm font-semibold c7-muted">{pack.bonus}</p>
      <div className="mt-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-3xl font-black text-slate-950">{pack.credits.toLocaleString()}</p>
          <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">credits</p>
        </div>
        <p className="text-2xl font-black text-slate-950">{pack.price}</p>
      </div>
      <Career7Button type="button" variant={pack.featured ? "primary" : "dark"} size="sm" disabled className="mt-5 w-full opacity-60">
        Payments soon
      </Career7Button>
    </article>
  );
}

function LoadingPanel() {
  return (
    <div className="rounded-[28px] bg-slate-950 p-5 text-white shadow-2xl shadow-slate-950/16">
      <div className="h-4 w-36 animate-pulse rounded-full bg-white/15" />
      <div className="mt-5 h-16 w-56 animate-pulse rounded-3xl bg-white/15" />
      <div className="mt-5 h-4 w-full max-w-xl animate-pulse rounded-full bg-white/10" />
      <div className="mt-3 h-4 w-4/5 max-w-lg animate-pulse rounded-full bg-white/10" />
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatBusinessModel(value: string) {
  return value.toLowerCase() === "career7" ? "Blizzway" : value;
}

function summarizeUsage(transactions: Career7WalletTransaction[]) {
  const spent = transactions
    .filter((transaction) => transaction.type === "Spent")
    .reduce((total, transaction) => total + transaction.amount, 0);
  const added = transactions
    .filter((transaction) => transaction.type === "Earned")
    .reduce((total, transaction) => total + transaction.amount, 0);
  const usageEntries = transactions.filter((transaction) => transaction.type === "Spent").length;

  return { spent, added, usageEntries };
}

function usageBreakdown(transactions: Career7WalletTransaction[]) {
  const spentTransactions = transactions.filter((transaction) => transaction.type === "Spent");
  const total = spentTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const buckets = [
    { label: "companions", match: "companion", color: "bg-indigo-600" },
    { label: "Boosts", match: "boost", color: "bg-cyan-500" },
    { label: "Blizzway", match: "blizzway", color: "bg-emerald-500" },
    { label: "Reviews", match: "review", color: "bg-amber-400" },
  ];

  if (total <= 0) {
    return buckets.map((bucket) => ({ ...bucket, value: 0 }));
  }

  return buckets.map((bucket) => {
    const amount = spentTransactions
      .filter((transaction) => transaction.description.toLowerCase().includes(bucket.match))
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    return {
      ...bucket,
      value: Math.round((amount / total) * 100),
    };
  });
}

export default function WalletPage() {
  const [walletData, setWalletData] = useState<Career7WalletResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadWallet() {
      try {
        const response = await career7Api.getWallet();
        if (!active) return;
        setWalletData(response);
      } catch (caught) {
        if (!active) return;
        setError(getApiErrorMessage(caught));
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadWallet();

    return () => {
      active = false;
    };
  }, []);

  const transactions = useMemo(
    () => walletData?.wallet.recentTransactions ?? [],
    [walletData?.wallet.recentTransactions],
  );
  const hasTransactions = transactions.length > 0;
  const credits = walletData?.wallet.credits ?? 0;
  const summary = useMemo(() => summarizeUsage(transactions), [transactions]);
  const analytics = useMemo(() => usageBreakdown(transactions), [transactions]);

  return (
    <Career7DashboardShell
      activeHref="/wallet"
      eyebrow="Wallet"
      title="Wallet & Credits"
      description="Track Blizzway credits for boosts, companions, reviews, and premium pathways."
      walletCredits={walletData?.wallet.credits ?? null}
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Wallet" }]}
    >
      {error ? (
        <div className="mt-5 rounded-[24px] border border-rose-200 bg-rose-50 p-4 text-sm font-semibold leading-6 text-rose-700">
          {error}
        </div>
      ) : null}

      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.42fr]">
        {loading ? (
          <LoadingPanel />
        ) : (
          <div className="overflow-hidden rounded-[28px] bg-slate-950 p-5 text-white shadow-2xl shadow-slate-950/16">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">
                  Current balance
                </p>
                <div className="mt-4 flex flex-wrap items-end gap-3">
                  <span className="text-6xl font-black tracking-tight sm:text-7xl">
                    {credits.toLocaleString()}
                  </span>
                  <span className="pb-3 text-lg font-bold text-white/64">credits</span>
                </div>
                <p className="mt-4 max-w-2xl leading-7 text-white/70">
                  Synced from BGOS Blizzway wallet data scoped to the authenticated workspace.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
                {[
                  ["Spent", summary.spent.toLocaleString()],
                  ["Added", summary.added.toLocaleString()],
                  ["Usage", summary.usageEntries.toString()],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[22px] bg-white/10 p-4 ring-1 ring-white/10">
                    <p className="text-sm font-bold text-white/58">{label}</p>
                    <p className="mt-2 text-2xl font-black">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <Career7Card as="section">
          <SectionTitle
            eyebrow="Spending analytics"
            title="Credit usage"
            description="Breakdown derived from recent Blizzway wallet ledger entries."
          />
          <div className="mt-5 space-y-4">
            {analytics.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-sm">
                  <p className="font-black text-slate-700">{item.label}</p>
                  <p className="font-black text-slate-950">{item.value}%</p>
                </div>
                <div className="mt-2 h-3 rounded-full bg-slate-200">
                  <div className={`h-3 rounded-full ${item.color}`} style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Career7Card>
      </section>

      <section className="mt-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <SectionTitle
            eyebrow="Top-up packages"
            title="Choose a credit pack"
            description="Payment gateways are intentionally disabled in this frontend phase."
          />
          <Career7Badge tone="slate" className="self-start sm:self-auto">
            Payments not connected
          </Career7Badge>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {packages.map((pack) => (
            <TopUpCard key={pack.name} pack={pack} />
          ))}
        </div>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[0.42fr_1fr]">
        <Career7Card as="section">
          <SectionTitle
            eyebrow="Featured pricing"
            title="companion costs"
            description="Reference prices for planning credit spend before adding companions."
          />
          <div className="mt-5 grid gap-3">
            {featuredPricing.map((companion) => (
              <div key={companion.name} className="rounded-[20px] bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-black text-slate-950">{companion.name}</p>
                    <p className="mt-1 text-xs font-bold c7-muted">{companion.category}</p>
                  </div>
                  <Career7Badge tone="slate">{companion.demand}</Career7Badge>
                </div>
                <p className="mt-4 text-2xl font-black text-slate-950">{companion.credits} credits</p>
              </div>
            ))}
          </div>
        </Career7Card>

        <Career7Card as="section">
          <SectionTitle
            eyebrow="Credit usage"
            title="Recent wallet history"
            description="Live transaction history from the BGOS Blizzway credit ledger."
          />
          {loading ? (
            <div className="mt-5 overflow-hidden rounded-[22px] border border-slate-200">
              {[0, 1, 2].map((item) => (
                <div key={item} className="border-b border-slate-200 bg-white p-4 last:border-b-0">
                  <div className="h-4 w-44 animate-pulse rounded-full bg-slate-200" />
                  <div className="mt-3 h-3 w-64 animate-pulse rounded-full bg-slate-100" />
                </div>
              ))}
            </div>
          ) : hasTransactions ? (
            <div className="mt-5 overflow-hidden rounded-[22px] border border-slate-200">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="grid gap-3 border-b border-slate-200 bg-white p-4 last:border-b-0 sm:grid-cols-[1fr_auto_auto] sm:items-center"
                >
                  <div className="min-w-0">
                    <p className="truncate font-black text-slate-950">{transaction.description}</p>
                    <p className="mt-1 text-sm font-semibold c7-muted">
                      {formatBusinessModel(transaction.businessModel)} - {formatDate(transaction.date)}
                    </p>
                  </div>
                  <Career7Badge tone={transaction.type === "Earned" ? "emerald" : "slate"}>
                    {transaction.type}
                  </Career7Badge>
                  <p
                    className={`text-right text-lg font-black ${
                      transaction.type === "Earned" ? "text-emerald-600" : "text-slate-950"
                    }`}
                  >
                    {transaction.type === "Earned" ? "+" : "-"}
                    {transaction.amount.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5">
              <Career7EmptyState
                title="No credit activity yet"
                description="Your future top-ups, boosts, companion installs, and premium pathway spends will appear here."
                actionLabel="Browse Magic Market"
                actionHref="/agent-store"
                secondaryLabel="Open Quick Boosts"
                secondaryHref="/quick-boosts"
              />
            </div>
          )}
        </Career7Card>
      </section>

      <section className="mt-5">
        <Career7Card as="section">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">
                Blizzway scope
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                Wallet data is scoped to the Blizzway workspace.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 c7-muted">
                This page reads BGOS wallet credits and ledger entries only. Payment gateways stay disabled until the billing phase.
              </p>
            </div>
            <Career7Button href="/agent-store" variant="secondary" className="w-full lg:w-auto">
              Browse Magic Market
            </Career7Button>
          </div>
        </Career7Card>
      </section>
    </Career7DashboardShell>
  );
}
