"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Career7Badge,
  Career7Button,
  Career7Card,
  Career7EmptyState,
  Career7GradientPanel,
} from "@/components/career7";
import { walletApi } from "@/lib/api/wallet";
import type { Career7WalletResponse, Career7WalletTransaction } from "@/lib/api/types";
import { Career7DashboardShell } from "../dashboard-shell";

const packages = [
  ["Starter Glow", "500", "$9", "Quick boosts"],
  ["Pathway Pack", "1,400", "$19", "Best value"],
  ["Aurora Pro", "3,200", "$39", "Companion heavy"],
  ["Dreamscape Elite", "7,500", "$79", "Premium pathway"],
];

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function transactionAmount(transaction: Career7WalletTransaction) {
  const sign = transaction.type === "Earned" ? "+" : "-";
  return `${sign}${transaction.amount.toLocaleString()}`;
}

export default function WalletPage() {
  const [data, setData] = useState<Career7WalletResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    walletApi
      .getWallet()
      .then((wallet) => {
        if (!mounted) return;
        setData(wallet);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Unable to load Blizzway wallet.");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const walletCredits = data?.wallet.credits ?? null;
  const transactions = useMemo(
    () => data?.wallet.recentTransactions ?? [],
    [data?.wallet.recentTransactions],
  );

  return (
    <Career7DashboardShell
      activeHref="/wallet"
      title="Wallet"
      description="Read-only BGOS credit balance, ledger history, and top-up package previews for Blizzway."
      walletCredits={walletCredits}
    >
      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.72fr]">
        <Career7GradientPanel>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">Credits balance</p>
          <p className="mt-4 text-7xl font-black">
            {loading ? "..." : (walletCredits ?? 0).toLocaleString()}
          </p>
          <p className="mt-3 text-lg font-semibold text-white/70">
            Live BGOS credits scoped to your Blizzway workspace. Spending and top-ups are disabled for now.
          </p>
        </Career7GradientPanel>
        <Career7Card as="section" className="c7-magical-glow">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">NEXA wallet note</p>
          <h2 className="mt-3 text-2xl font-black text-slate-950">Read-only until checkout is ready.</h2>
          <p className="mt-3 text-sm leading-6 c7-muted">
            Blizzway can read your BGOS credit wallet and ledger. Payment gateway actions and credit deductions are intentionally offline.
          </p>
          {error ? (
            <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">
              {error}
            </p>
          ) : null}
        </Career7Card>
      </section>

      <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {packages.map(([name, credits, price, note]) => (
          <Career7Card key={name} as="article" className="c7-lift-card">
            <Career7Badge tone={note === "Best value" ? "purple" : "slate"}>{note}</Career7Badge>
            <h3 className="mt-5 text-xl font-black text-slate-950">{name}</h3>
            <p className="mt-3 text-4xl font-black text-slate-950">{credits}</p>
            <p className="mt-1 text-sm c7-muted">credits preview</p>
            <p className="mt-5 text-2xl font-black text-slate-950">{price}</p>
            <Career7Button type="button" disabled className="mt-5 w-full opacity-60">Checkout disabled</Career7Button>
          </Career7Card>
        ))}
      </section>

      <Career7Card as="section" className="mt-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Credit ledger</p>
        <div className="mt-6 grid gap-3">
          {loading ? (
            [0, 1, 2].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="h-4 w-2/3 animate-pulse rounded-full bg-slate-200" />
                <div className="mt-3 h-3 w-1/3 animate-pulse rounded-full bg-slate-200" />
              </div>
            ))
          ) : transactions.length > 0 ? (
            transactions.map((transaction) => (
              <div key={transaction.id} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                <div>
                  <p className="font-black text-slate-950">{transaction.description}</p>
                  <p className="text-sm c7-muted">{formatDate(transaction.date)}</p>
                </div>
                <Career7Badge tone={transaction.type === "Earned" ? "emerald" : "slate"}>{transaction.type}</Career7Badge>
                <p className={`text-lg font-black ${transaction.type === "Earned" ? "text-emerald-600" : "text-slate-950"}`}>
                  {transactionAmount(transaction)}
                </p>
              </div>
            ))
          ) : (
            <Career7EmptyState
              title="No credit activity yet"
              description="Your Blizzway wallet ledger will show BGOS credit top-ups and usage once backend transactions exist."
            />
          )}
        </div>
      </Career7Card>
    </Career7DashboardShell>
  );
}
