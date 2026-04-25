"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type BdmPerformance = {
  id: string;
  name: string;
  role: string;
  leadsAssigned: number;
  wonThisMonth: number;
  wonTarget: number;
  conversionRate: number;
  callsThisMonth: number;
  lastActiveAt: string | null;
  teamRank: number;
};

function timeAgo(value: string | null) {
  if (!value) return "No activity yet";

  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
}

function targetClass(won: number, target: number) {
  const progress = target > 0 ? won / target : won > 0 ? 1 : 0;
  if (progress >= 0.8) return "text-[#22D9A0] bg-[#22D9A0]/10 border-[#22D9A0]/20";
  if (progress >= 0.5) return "text-[#F5A623] bg-[#F5A623]/10 border-[#F5A623]/20";
  return "text-[#FF6B6B] bg-[#FF6B6B]/10 border-[#FF6B6B]/20";
}

export function TeamPerformance() {
  const [bdms, setBdms] = useState<BdmPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPerformance() {
      setLoading(true);
      const response = await fetch("/api/boss/team-performance", {
        cache: "no-store",
      });
      setLoading(false);

      if (response.ok) {
        const data = (await response.json()) as { bdms: BdmPerformance[] };
        setBdms(data.bdms);
      }
    }

    void loadPerformance();
  }, []);

  const sortedBdms = useMemo(
    () => [...bdms].sort((a, b) => b.conversionRate - a.conversionRate),
    [bdms],
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#13131c]">
      {loading ? (
        <div className="p-6 text-sm text-zinc-500">Loading BDM performance...</div>
      ) : sortedBdms.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Leads assigned</th>
                <th className="px-4 py-3">Won this month</th>
                <th className="px-4 py-3">Conversion</th>
                <th className="px-4 py-3">Calls</th>
                <th className="px-4 py-3">Last active</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedBdms.map((bdm) => (
                <tr key={bdm.id} className="border-b border-white/5">
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-semibold text-white">
                        #{bdm.teamRank} {bdm.name}
                      </p>
                      <span className="mt-1 inline-flex rounded-full border border-[#7C6FFF]/30 bg-[#7C6FFF]/10 px-2 py-0.5 text-[10px] font-bold text-[#b8b2ff]">
                        {bdm.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-zinc-300">{bdm.leadsAssigned}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-bold ${targetClass(
                        bdm.wonThisMonth,
                        bdm.wonTarget,
                      )}`}
                    >
                      {bdm.wonThisMonth} / {bdm.wonTarget}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-zinc-300">
                    {bdm.conversionRate}%
                  </td>
                  <td className="px-4 py-4 text-zinc-300">{bdm.callsThisMonth}</td>
                  <td className="px-4 py-4 text-zinc-500">
                    {timeAgo(bdm.lastActiveAt)}
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      href="/boss/team"
                      className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-zinc-300 transition hover:border-[#7C6FFF]/50 hover:text-white"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-6 text-sm text-zinc-500">
          No BDMs have joined this business yet.
        </div>
      )}
    </div>
  );
}

export type { BdmPerformance };
