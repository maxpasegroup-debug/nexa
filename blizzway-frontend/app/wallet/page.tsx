"use client";

import { useEffect, useMemo, useState } from "react";

import {
  BlizzwayBadge,
  BlizzwayButton,
  BlizzwayCard,
  BlizzwayEmptyState,
  BlizzwayGradientPanel,
} from "@/components/blizzway";
import { walletApi } from "@/lib/api/wallet";
import type { BlizzwayWalletResponse, BlizzwayWalletTransaction } from "@/lib/api/types";
import { BlizzwayDashboardShell } from "../dashboard-shell";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatInr(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function transactionAmount(transaction: BlizzwayWalletTransaction) {
  const sign = transaction.type === "Earned" ? "+" : "-";
  return `${sign}${transaction.amount.toLocaleString()}`;
}

export default function WalletPage() {
  const [data, setData] = useState<BlizzwayWalletResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentState, setPaymentState] = useState<"idle" | "creating" | "success" | "failure">("idle");
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);

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
  const creditPackages = data?.creditPackages ?? [];
  const subscriptionPlans = data?.subscriptionPlans ?? [];
  const invoices = data?.invoices ?? [];

  async function createTopUpOrder(packageId: string) {
    setPaymentState("creating");
    setPaymentMessage(null);

    try {
      const response = await walletApi.topUpWallet({
        packageId,
        gateway: data?.payment.defaultGateway,
      });
      const checkout = response.checkout as { gateway?: string; mode?: string };
      setPaymentState("success");
      setPaymentMessage(
        `${response.package.name} order created via ${checkout.gateway ?? data?.payment.defaultGateway ?? "gateway"}. Checkout mode: ${checkout.mode ?? "provider"}.`,
      );
    } catch (err) {
      setPaymentState("failure");
      setPaymentMessage(err instanceof Error ? err.message : "Unable to create payment order.");
    }
  }

  return (
    <BlizzwayDashboardShell
      activeHref="/wallet"
      title="Wallet"
      description="BGOS credit balance, packages, plans, ledger history, and beta-safe payment orders for Blizzway."
      walletCredits={walletCredits}
    >
      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.72fr]">
        <BlizzwayGradientPanel>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">Credits balance</p>
          <p className="mt-4 text-7xl font-black">
            {loading ? "..." : (walletCredits ?? 0).toLocaleString()}
          </p>
          <p className="mt-3 text-lg font-semibold text-white/70">
            Live BGOS credits scoped to your Blizzway workspace.
          </p>
        </BlizzwayGradientPanel>
        <BlizzwayCard as="section" className="c7-magical-glow">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">NEXA wallet note</p>
          <h2 className="mt-3 text-2xl font-black text-slate-950">Checkout architecture is online.</h2>
          <p className="mt-3 text-sm leading-6 c7-muted">
            Blizzway creates server-validated top-up orders through BGOS. Beta payments stay in manual/test mode until live gateways are explicitly approved.
          </p>
          {paymentMessage ? (
            <p className={`mt-4 rounded-2xl border p-4 text-sm font-bold ${
              paymentState === "failure"
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}>
              {paymentMessage}
            </p>
          ) : null}
          {error ? (
            <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">
              {error}
            </p>
          ) : null}
        </BlizzwayCard>
      </section>

      <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {(loading ? [] : creditPackages).map((item) => (
          <BlizzwayCard key={item.id} as="article" className="c7-lift-card">
            <BlizzwayBadge tone={item.badgeLabel === "Best Value" ? "purple" : "slate"}>
              {item.badgeLabel ?? "Credit pack"}
            </BlizzwayBadge>
            <h3 className="mt-5 text-xl font-black text-slate-950">{item.name}</h3>
            <p className="mt-3 text-4xl font-black text-slate-950">{item.totalCredits.toLocaleString()}</p>
            <p className="mt-1 text-sm c7-muted">
              {item.baseCredits.toLocaleString()} base
              {item.bonusCredits ? ` + ${item.bonusCredits.toLocaleString()} bonus` : ""}
            </p>
            <p className="mt-5 text-2xl font-black text-slate-950">{formatInr(item.priceInr)}</p>
            <BlizzwayButton
              type="button"
              disabled={paymentState === "creating"}
              className="mt-5 w-full"
              onClick={() => createTopUpOrder(item.id)}
            >
              {paymentState === "creating" ? "Creating order" : "Create order"}
            </BlizzwayButton>
          </BlizzwayCard>
        ))}
        {!loading && creditPackages.length === 0 ? (
          <BlizzwayEmptyState title="No credit packs yet" description="BGOS has not returned active Blizzway credit packages." />
        ) : null}
      </section>

      <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {subscriptionPlans.map((plan) => (
          <BlizzwayCard key={plan.id} as="article" className="c7-lift-card">
            <BlizzwayBadge tone={plan.slug === "free-explorer" ? "emerald" : "purple"}>
              {plan.monthlyCredits ? `${plan.monthlyCredits.toLocaleString()} monthly` : "Concierge"}
            </BlizzwayBadge>
            <h3 className="mt-5 text-xl font-black text-slate-950">{plan.name}</h3>
            <p className="mt-4 text-3xl font-black text-slate-950">
              {plan.monthlyPriceInr === 0 ? "Free" : `${formatInr(plan.monthlyPriceInr)}/mo`}
            </p>
            <div className="mt-4 space-y-2">
              {plan.features.slice(0, 3).map((feature) => (
                <p key={feature} className="text-sm font-semibold c7-muted">{feature}</p>
              ))}
            </div>
            <BlizzwayButton type="button" disabled className="mt-5 w-full opacity-60">Plan changes open after beta</BlizzwayButton>
          </BlizzwayCard>
        ))}
      </section>

      <BlizzwayCard as="section" className="mt-5">
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
                <BlizzwayBadge tone={transaction.type === "Earned" ? "emerald" : "slate"}>{transaction.type}</BlizzwayBadge>
                <p className={`text-lg font-black ${transaction.type === "Earned" ? "text-emerald-600" : "text-slate-950"}`}>
                  {transactionAmount(transaction)}
                </p>
              </div>
            ))
          ) : (
            <BlizzwayEmptyState
              title="No credit activity yet"
              description="Your Blizzway wallet ledger will show BGOS credit top-ups and usage once backend transactions exist."
            />
          )}
        </div>
      </BlizzwayCard>

      <BlizzwayCard as="section" className="mt-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Invoices</p>
        <div className="mt-6 grid gap-3">
          {invoices.length > 0 ? (
            invoices.map((invoice) => (
              <div key={invoice.id} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                <div>
                  <p className="font-black text-slate-950">{invoice.invoiceNumber}</p>
                  <p className="text-sm c7-muted">{formatDate(invoice.createdAt)}</p>
                </div>
                <BlizzwayBadge tone="slate">{invoice.status}</BlizzwayBadge>
                <p className="text-lg font-black text-slate-950">{formatInr(invoice.amount / 100)}</p>
              </div>
            ))
          ) : (
            <BlizzwayEmptyState
              title="No invoices yet"
              description="Payment receipts will appear here after successful Blizzway top-ups."
            />
          )}
        </div>
      </BlizzwayCard>
    </BlizzwayDashboardShell>
  );
}
