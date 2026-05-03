"use client";

import { useEffect, useState } from "react";

import { CustomerCard, type BdmCustomer } from "@/components/bdm/customer-card";

type CustomerResponse = {
  live: BdmCustomer[];
  notRenewed: BdmCustomer[];
  totalLive: number;
  totalTrial: number;
  totalAtRisk: number;
};

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#101018] p-5">
      <div className="h-4 w-40 rounded bg-white/10" />
      <div className="mt-3 h-5 w-24 rounded-full bg-white/10" />
      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="h-12 rounded-xl bg-white/[0.06]" />
        <div className="h-12 rounded-xl bg-white/[0.06]" />
        <div className="h-12 rounded-xl bg-white/[0.06]" />
      </div>
      <div className="mt-5 h-9 rounded-xl bg-white/10" />
    </div>
  );
}

export function CustomersPageContent() {
  const [data, setData] = useState<CustomerResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCustomers() {
      setLoading(true);
      const response = await fetch("/api/bdm/customers", { cache: "no-store" });
      setLoading(false);
      if (!response.ok) return;
      setData((await response.json()) as CustomerResponse);
    }

    void loadCustomers();
  }, []);

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">My Customers</h1>
          <p className="mt-1 text-sm text-zinc-500">Live accounts, trials, and renewals that need your attention.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-[#22D9A0]/25 bg-[#22D9A0]/10 px-3 py-1 text-xs font-bold text-[#22D9A0]">
            {data?.totalLive ?? 0} live
          </span>
          <span className="rounded-full border border-[#F5A623]/25 bg-[#F5A623]/10 px-3 py-1 text-xs font-bold text-[#F5A623]">
            {data?.totalTrial ?? 0} trial
          </span>
          {(data?.totalAtRisk ?? 0) > 0 ? (
            <span className="rounded-full border border-[#FF6B6B]/25 bg-[#FF6B6B]/10 px-3 py-1 text-xs font-bold text-[#FF6B6B]">
              {data?.totalAtRisk} at risk
            </span>
          ) : null}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center gap-3">
          <h2 className="font-heading text-lg font-bold text-white">
            <span className="mr-2 text-[#22D9A0]">●</span>Live customers
          </h2>
          <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-xs font-bold text-zinc-300">
            {data?.live.length ?? 0}
          </span>
        </div>
        {loading ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : data && data.live.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {data.live.map((customer) => (
              <CustomerCard key={customer.id} customer={customer} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-[#101018] p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#22D9A0]/10 text-2xl">
              🏢
            </div>
            <p className="mt-4 text-sm text-zinc-400">
              No active customers yet. Customers appear here after their workspace goes live and payment is confirmed.
            </p>
          </div>
        )}
      </section>

      {loading ? (
        <section>
          <div className="mb-4 h-6 w-48 rounded bg-white/10" />
          <div className="grid gap-4 lg:grid-cols-2">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </section>
      ) : data && data.notRenewed.length > 0 ? (
        <section>
          <div className="mb-4 flex items-center gap-3">
            <h2 className="font-heading text-lg font-bold text-white">🔴 Needs your attention</h2>
            <span className="rounded-full bg-[#FF6B6B]/15 px-2 py-0.5 text-xs font-bold text-[#FF6B6B]">
              {data.notRenewed.length}
            </span>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {data.notRenewed.map((customer) => (
              <CustomerCard key={customer.id} customer={customer} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
