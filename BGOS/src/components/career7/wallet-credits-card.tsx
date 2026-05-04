"use client";

import { ArrowDown, ArrowUp, Plus, Wallet } from "lucide-react";

type WalletTransaction = {
  type: "Earned" | "Spent";
  amount: number;
  date: string;
};

type WalletCreditsCardProps = {
  walletBalance?: number;
  credits?: number;
  currency?: string;
  recentTransactions?: WalletTransaction[];
};

export function WalletCreditsCard({
  walletBalance = 0,
  credits = 0,
  currency = "Rs.",
  recentTransactions = [
    { type: "Earned", amount: 500, date: "Today" },
    { type: "Spent", amount: 200, date: "Yesterday" },
  ],
}: WalletCreditsCardProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-500 p-8 text-white shadow-lg shadow-indigo-950/20">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-80">Wallet Balance</p>
            <h3 className="mt-1 text-3xl font-bold">
              {currency} {walletBalance.toLocaleString()}
            </h3>
          </div>
          <div className="rounded-2xl bg-white/20 p-3 backdrop-blur-sm">
            <Wallet className="text-white" size={24} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 font-semibold text-indigo-600 transition-colors hover:bg-slate-100">
            <Plus size={16} />
            Add Funds
          </button>
          <button className="rounded-xl border border-white/80 px-4 py-2 font-semibold text-white transition-colors hover:bg-white/10">
            Withdraw
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 p-8 text-white shadow-lg shadow-purple-950/20">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-80">Career Credits</p>
            <h3 className="mt-1 text-3xl font-bold">{credits.toLocaleString()}</h3>
            <p className="mt-1 text-xs opacity-70">Available to spend</p>
          </div>
          <div className="rounded-2xl bg-white/20 p-3 backdrop-blur-sm">
            <Wallet className="text-white" size={24} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 font-semibold text-purple-600 transition-colors hover:bg-slate-100">
            <ArrowUp size={16} />
            Earn Credits
          </button>
          <button className="rounded-xl border border-white/80 px-4 py-2 font-semibold text-white transition-colors hover:bg-white/10">
            Redeem
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] lg:col-span-2">
        <h4 className="mb-4 text-sm font-bold uppercase text-slate-950">Recent Activity</h4>
        <div className="space-y-3">
          {recentTransactions.map((txn, index) => {
            const earned = txn.type === "Earned";

            return (
              <div
                key={`${txn.type}-${txn.date}-${index}`}
                className="flex items-center justify-between rounded-xl bg-slate-50 p-3"
              >
                <div className="flex items-center gap-3">
                  <div className={`rounded-xl p-2 ${earned ? "bg-green-100" : "bg-red-100"}`}>
                    {earned ? (
                      <ArrowUp className="text-green-600" size={16} />
                    ) : (
                      <ArrowDown className="text-red-600" size={16} />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-950">{txn.type}</p>
                    <p className="text-xs text-slate-500">{txn.date}</p>
                  </div>
                </div>
                <span className={`font-semibold ${earned ? "text-green-600" : "text-red-600"}`}>
                  {earned ? "+" : "-"}
                  {currency} {txn.amount.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
