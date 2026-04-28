"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";

type BdePerformance = {
  id: string;
  name: string;
  email: string;
  dealsThisMonth: number;
  firstSaleThisMonth: number;
  renewalThisMonth: number;
  slabThisMonth: string;
  totalThisMonth: number;
  targetProgress: number;
  payingCustomers: number;
  trialCustomers: number;
  churnRiskCustomers: number;
  lastActivityAt: string | Date | null;
  trend: "up" | "down" | "same";
};

type TeamSummary = {
  totalDealsThisMonth: number;
  totalMRRGenerated: number;
  totalCommissionOwed: number;
  topPerformer: string;
  teamTargetProgress: number;
};

type ApiResponse = {
  bdes: BdePerformance[];
  teamSummary: TeamSummary;
};

type SortKey =
  | "name"
  | "dealsThisMonth"
  | "totalThisMonth"
  | "targetProgress"
  | "payingCustomers"
  | "trialCustomers"
  | "churnRiskCustomers"
  | "lastActivityAt";

const emptySummary: TeamSummary = {
  totalDealsThisMonth: 0,
  totalMRRGenerated: 0,
  totalCommissionOwed: 0,
  topPerformer: "No BDEs yet",
  teamTargetProgress: 0,
};

function money(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

function timeAgo(value: string | Date | null) {
  if (!value) return "No activity";
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function earningTone(value: number) {
  if (value >= 21000) return "text-[#22D9A0]";
  if (value >= 9000) return "text-[#F5A623]";
  return "text-[#FF6B6B]";
}

function slabClass(slab: string) {
  if (slab === "DIAMOND") return "border-cyan-300/30 bg-cyan-300/10 text-cyan-200";
  if (slab === "GOLD") return "border-[#F5A623]/30 bg-[#F5A623]/10 text-[#F5A623]";
  if (slab === "SILVER") return "border-zinc-300/30 bg-zinc-300/10 text-zinc-200";
  if (slab === "BRONZE") return "border-orange-400/30 bg-orange-400/10 text-orange-300";
  return "border-white/10 bg-white/[0.04] text-zinc-500";
}

function SummaryCard({
  label,
  value,
  accent = "text-white",
}: {
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0e0e13] p-4">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </p>
      <p className={`mt-3 font-heading text-2xl font-bold ${accent}`}>{value}</p>
    </div>
  );
}

export function BDEPerformanceTable() {
  const [data, setData] = useState<ApiResponse>({
    bdes: [],
    teamSummary: emptySummary,
  });
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("totalThisMonth");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const response = await fetch("/api/boss/bde-performance", {
        cache: "no-store",
      });
      setLoading(false);
      if (!response.ok) return;
      setData((await response.json()) as ApiResponse);
    }

    void load();
  }, []);

  const rows = useMemo(() => {
    return [...data.bdes].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];
      const direction = sortDir === "asc" ? 1 : -1;
      if (sortKey === "name") {
        return String(aValue).localeCompare(String(bValue)) * direction;
      }
      if (sortKey === "lastActivityAt") {
        return (
          (new Date(aValue ?? 0).getTime() - new Date(bValue ?? 0).getTime()) *
          direction
        );
      }
      return (Number(aValue) - Number(bValue)) * direction;
    });
  }, [data.bdes, sortDir, sortKey]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir(key === "name" ? "asc" : "desc");
  }

  function SortHeader({ label, column }: { label: string; column: SortKey }) {
    return (
      <button
        type="button"
        onClick={() => toggleSort(column)}
        className="inline-flex items-center gap-1 text-left font-semibold"
      >
        {label}
        {sortKey === column ? (
          sortDir === "asc" ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )
        ) : null}
      </button>
    );
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-[#13131c] p-5 text-white">
      <div className="grid gap-3 md:grid-cols-4">
        <SummaryCard
          label="Deals this month"
          value={data.teamSummary.totalDealsThisMonth}
          accent="text-[#22D9A0]"
        />
        <SummaryCard
          label="MRR generated"
          value={money(data.teamSummary.totalMRRGenerated)}
          accent="text-[#7C6FFF]"
        />
        <SummaryCard
          label="Commission owed"
          value={money(data.teamSummary.totalCommissionOwed)}
          accent="text-[#F5A623]"
        />
        <SummaryCard
          label="Top performer"
          value={data.teamSummary.topPerformer}
          accent="text-white"
        />
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[1120px] text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.12em] text-zinc-500">
            <tr className="border-b border-white/10">
              <th className="py-3"><SortHeader label="BDE" column="name" /></th>
              <th><SortHeader label="Deals" column="dealsThisMonth" /></th>
              <th><SortHeader label="Earnings" column="totalThisMonth" /></th>
              <th><SortHeader label="Target" column="targetProgress" /></th>
              <th>Slab</th>
              <th><SortHeader label="Paying" column="payingCustomers" /></th>
              <th><SortHeader label="Trials" column="trialCustomers" /></th>
              <th><SortHeader label="Risk" column="churnRiskCustomers" /></th>
              <th><SortHeader label="Last active" column="lastActivityAt" /></th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} className="py-10 text-center text-zinc-500">
                  Loading BDE commissions...
                </td>
              </tr>
            ) : rows.length > 0 ? (
              rows.map((bde) => (
                <>
                  <tr
                    key={bde.id}
                    onClick={() =>
                      setExpanded((current) => (current === bde.id ? null : bde.id))
                    }
                    className="cursor-pointer border-b border-white/5 hover:bg-white/[0.03]"
                  >
                    <td className="py-4">
                      <p className="font-semibold text-white">{bde.name}</p>
                      <p className="mt-1 text-xs text-zinc-500">{bde.email}</p>
                    </td>
                    <td>
                      <div className="w-24">
                        <p className="font-bold text-white">{bde.dealsThisMonth}</p>
                        <div className="mt-1 h-1.5 rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-[#22D9A0]"
                            style={{ width: `${Math.min(100, bde.dealsThisMonth * 12)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className={`font-bold ${earningTone(bde.totalThisMonth)}`}>
                      {money(bde.totalThisMonth)}
                    </td>
                    <td>
                      <div className="w-32">
                        <p className="text-xs font-bold text-zinc-300">
                          {Math.round(bde.targetProgress)}%
                        </p>
                        <div className="mt-1 h-1.5 rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-[#22D9A0]"
                            style={{
                              width: `${Math.min(100, Math.max(0, bde.targetProgress))}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${slabClass(bde.slabThisMonth)}`}>
                        {bde.slabThisMonth}
                      </span>
                    </td>
                    <td className="font-bold text-[#22D9A0]">{bde.payingCustomers}</td>
                    <td className="font-bold text-[#F5A623]">{bde.trialCustomers}</td>
                    <td>
                      {bde.churnRiskCustomers > 0 ? (
                        <button className="rounded-full bg-[#FF6B6B]/15 px-2 py-1 text-xs font-bold text-[#FF6B6B]">
                          {bde.churnRiskCustomers}
                        </button>
                      ) : (
                        <span className="text-zinc-600">0</span>
                      )}
                    </td>
                    <td className="text-zinc-500">{timeAgo(bde.lastActivityAt)}</td>
                    <td>
                      <Link
                        href={`/boss/leads?assignedTo=${bde.id}`}
                        onClick={(event) => event.stopPropagation()}
                        className="rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-zinc-300 transition hover:border-[#7C6FFF]/40 hover:text-white"
                      >
                        View pipeline
                      </Link>
                    </td>
                  </tr>
                  {expanded === bde.id ? (
                    <tr className="border-b border-white/5 bg-[#0e0e13]">
                      <td colSpan={10} className="px-4 py-4">
                        <div className="grid gap-3 md:grid-cols-4">
                          <SummaryCard
                            label="First sale"
                            value={money(bde.firstSaleThisMonth)}
                            accent="text-[#22D9A0]"
                          />
                          <SummaryCard
                            label="Renewal"
                            value={money(bde.renewalThisMonth)}
                            accent="text-[#7C6FFF]"
                          />
                          <SummaryCard
                            label="Slab"
                            value={bde.slabThisMonth}
                            accent="text-[#F5A623]"
                          />
                          <SummaryCard
                            label="Projected"
                            value={money(
                              Math.round(
                                bde.totalThisMonth *
                                  (30 / Math.max(1, new Date().getDate())),
                              ),
                            )}
                            accent="text-white"
                          />
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="py-10 text-center text-zinc-500">
                  No BDE commission data yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
