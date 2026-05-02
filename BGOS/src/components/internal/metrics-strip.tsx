"use client";

import { useEffect, useState } from "react";

type Metrics = {
  customers: { total: number; active: number; trial: number };
  users: { total: number };
  revenue: { mrr: number };
  health: { atRisk: number };
  payments: { failed: number };
  ratings: { average: number | null };
  support: { open: number };
};

const cards = [
  { key: "all", title: "Total customers", value: (m: Metrics) => m.customers.total },
  { key: "trial", title: "Active trials", value: (m: Metrics) => m.customers.trial },
  { key: "users", title: "Total users", value: (m: Metrics) => m.users.total },
  { key: "revenue", title: "Monthly MRR", value: (m: Metrics) => `₹${Math.round(m.revenue.mrr).toLocaleString("en-IN")}` },
  { key: "churnRisk", title: "Churn risks", value: (m: Metrics) => m.health.atRisk },
  { key: "failedPayment", title: "Failed payments", value: (m: Metrics) => m.payments.failed },
  { key: "ratings", title: "Avg rating", value: (m: Metrics) => m.ratings.average ?? "—" },
  { key: "tickets", title: "Open tickets", value: (m: Metrics) => m.support.open },
];

export function MetricsStrip({
  activeFilter,
  onFilterChange,
}: {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}) {
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    void fetch("/api/internal/metrics", { cache: "no-store" })
      .then((response) => response.json())
      .then(setMetrics)
      .catch(() => null);
  }, []);

  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const active = activeFilter === card.key;
        return (
          <button
            key={card.key}
            type="button"
            onClick={() => onFilterChange(card.key)}
            className={`group min-h-[104px] rounded-[14px] border bg-[#13131c] p-4 text-left transition hover:border-[#7C6FFF]/60 ${
              active ? "border-[#7C6FFF]" : "border-white/10"
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">{card.title}</p>
            <p className="mt-3 font-heading text-2xl font-extrabold text-white">
              {metrics ? card.value(metrics) : "…"}
            </p>
            <p className="mt-2 text-right text-xs font-bold text-[#7C6FFF] opacity-0 transition group-hover:opacity-100">
              View →
            </p>
          </button>
        );
      })}
    </section>
  );
}
