"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { WalletCreditsCard } from "@/components/career7";

type WalletResponse = {
  wallet: {
    primaryBalance: number;
    credits: number;
    recentTransactions: {
      id: string;
      type: "Earned" | "Spent";
      amount: number;
      description: string;
      date: string;
    }[];
  };
  error?: string;
};

export default function WalletPage() {
  const [data, setData] = useState<WalletResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadWallet() {
    setError(null);
    const response = await fetch("/api/career7/wallet", { cache: "no-store" });
    const payload = (await response.json()) as WalletResponse;
    if (!response.ok) throw new Error(payload.error ?? "Unable to load wallet.");
    setData(payload);
  }

  useEffect(() => {
    loadWallet()
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load wallet."))
      .finally(() => setLoading(false));
  }, []);

  async function topUp() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/career7/wallet", { method: "POST" });
      const payload = (await response.json()) as WalletResponse;
      if (!response.ok) throw new Error(payload.error ?? "Unable to top up credits.");
      await loadWallet();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to top up credits.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Wallet & Credits</h1>
          <p className="mt-2 text-slate-600">Manage your Career7 credits.</p>
        </div>
        <button
          type="button"
          onClick={topUp}
          disabled={busy}
          className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
        >
          Dummy Top Up +1000
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid min-h-[280px] place-items-center rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
            <Loader2 className="animate-spin text-violet-600" size={20} />
            Loading wallet
          </div>
        </div>
      ) : (
        <WalletCreditsCard
          walletBalance={data?.wallet.primaryBalance ?? 0}
          credits={data?.wallet.credits ?? 0}
          currency="Rs."
          recentTransactions={(data?.wallet.recentTransactions ?? []).map((transaction) => ({
            type: transaction.type,
            amount: transaction.amount,
            date: new Date(transaction.date).toLocaleDateString(),
          }))}
        />
      )}
    </div>
  );
}
