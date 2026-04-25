"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type HealthPoint = {
  date: string;
  healthScore: number;
  totalLeads: number;
  wonLeads: number;
  newLeads: number;
};

type FunnelPoint = {
  status: string;
  label: string;
  count: number;
  conversionRate: number | null;
};

type TeamActivity = {
  name: string;
  role: string;
  activityCount: number[];
  totalThisWeek: number;
  callsThisWeek: number;
  tasksCompletedThisWeek: number;
};

type RevenuePoint = {
  weekLabel: string;
  wonCount: number;
  totalValue: number;
};

type AnalyticsChartsProps = {
  businessId: string;
};

function Skeleton() {
  return (
    <div className="h-[260px] animate-pulse rounded-xl bg-white/[0.04]" />
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#13131c] p-5">
      <div className="mb-5">
        <h3 className="font-heading text-base font-bold text-white">{title}</h3>
        <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function funnelWidth(count: number, max: number) {
  if (max <= 0) return "16%";
  return `${Math.max(16, (count / max) * 100)}%`;
}

function heatColor(count: number) {
  if (count === 0) return "rgba(255,255,255,0.03)";
  if (count <= 2) return "rgba(124,111,255,0.15)";
  if (count <= 5) return "rgba(124,111,255,0.35)";
  return "rgba(124,111,255,0.6)";
}

function rupee(value: number) {
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export function AnalyticsCharts({ businessId }: AnalyticsChartsProps) {
  const [health, setHealth] = useState<HealthPoint[]>([]);
  const [funnel, setFunnel] = useState<FunnelPoint[]>([]);
  const [team, setTeam] = useState<TeamActivity[]>([]);
  const [days, setDays] = useState<string[]>([]);
  const [revenue, setRevenue] = useState<RevenuePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true);
      const [healthRes, funnelRes, teamRes, revenueRes] = await Promise.all([
        fetch("/api/analytics/health-trend", { cache: "no-store" }),
        fetch("/api/analytics/lead-funnel", { cache: "no-store" }),
        fetch("/api/analytics/team-activity", { cache: "no-store" }),
        fetch("/api/analytics/revenue-trend", { cache: "no-store" }),
      ]);

      if (healthRes.ok) {
        setHealth(((await healthRes.json()) as { data: HealthPoint[] }).data);
      }
      if (funnelRes.ok) {
        setFunnel(((await funnelRes.json()) as { data: FunnelPoint[] }).data);
      }
      if (teamRes.ok) {
        const data = (await teamRes.json()) as {
          days: string[];
          data: TeamActivity[];
        };
        setDays(data.days);
        setTeam(data.data);
      }
      if (revenueRes.ok) {
        setRevenue(((await revenueRes.json()) as { data: RevenuePoint[] }).data);
      }
      setUpdatedAt(new Date());
      setLoading(false);
    }

    if (businessId) void loadAnalytics();
  }, [businessId]);

  const maxFunnelCount = useMemo(
    () => Math.max(0, ...funnel.map((item) => item.count)),
    [funnel],
  );

  return (
    <section className="rounded-2xl border border-white/10 bg-[#0e0e13] p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="font-heading text-xl font-bold text-white">
          Business Analytics
        </h2>
        <p className="text-[11px] text-zinc-500">
          Last updated{" "}
          {updatedAt
            ? updatedAt.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "-"}
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Health score trend" subtitle="Last 30 business snapshots">
          {loading ? (
            <Skeleton />
          ) : (
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={health}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="date" stroke="#6B6878" tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#6B6878" tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "#13131c",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                    }}
                  />
                  <ReferenceLine y={70} stroke="rgba(34,217,160,0.4)" strokeDasharray="4 4" />
                  <Line
                    type="monotone"
                    dataKey="healthScore"
                    stroke="#7C6FFF"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard title="Lead funnel" subtitle="Stage counts and conversion rates">
          {loading ? (
            <Skeleton />
          ) : (
            <div className="space-y-3">
              {funnel.map((item, index) => (
                <div key={item.status}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">{item.label}</span>
                    <span className="text-zinc-500">{item.count}</span>
                  </div>
                  <div
                    className="mt-2 rounded-lg bg-[#7C6FFF]/70 px-3 py-3 text-xs font-bold text-white transition-all"
                    style={{ width: funnelWidth(item.count, maxFunnelCount) }}
                  >
                    {item.count} leads
                  </div>
                  {index < funnel.length - 1 ? (
                    <p className="mt-2 text-[11px] text-zinc-600">
                      → {item.conversionRate ?? 0}% converted
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </ChartCard>

        <ChartCard title="Team activity heatmap" subtitle="Last 7 days by team member">
          {loading ? (
            <Skeleton />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-xs">
                <thead>
                  <tr className="text-zinc-500">
                    <th className="pb-3">Member</th>
                    {days.map((day) => (
                      <th key={day} className="pb-3 text-center">
                        {day}
                      </th>
                    ))}
                    <th className="pb-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {team.map((member) => (
                    <tr key={`${member.name}-${member.role}`} className="border-t border-white/5">
                      <td className="py-3">
                        <p className="font-semibold text-white">{member.name}</p>
                        <p className="text-[10px] text-zinc-600">{member.role}</p>
                      </td>
                      {member.activityCount.map((count, index) => (
                        <td key={`${member.name}-${index}`} className="p-1 text-center">
                          <div
                            className="mx-auto flex h-8 w-8 items-center justify-center rounded-md text-[10px] text-white"
                            style={{ backgroundColor: heatColor(count) }}
                          >
                            {count}
                          </div>
                        </td>
                      ))}
                      <td className="py-3 text-right font-semibold text-zinc-400">
                        {member.totalThisWeek}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ChartCard>

        <ChartCard title="Revenue trend" subtitle="Won lead value over 12 weeks">
          {loading ? (
            <Skeleton />
          ) : (
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenue}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="weekLabel" stroke="#6B6878" tickLine={false} />
                  <YAxis
                    stroke="#6B6878"
                    tickLine={false}
                    tickFormatter={(value) => rupee(Number(value))}
                  />
                  <Tooltip
                    formatter={(value, _name, item) => [
                      `${rupee(Number(value))} from ${(item.payload as RevenuePoint).wonCount} deals`,
                      "Revenue",
                    ]}
                    contentStyle={{
                      background: "#13131c",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                    }}
                  />
                  <Bar dataKey="totalValue" fill="#22D9A0" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
      </div>
    </section>
  );
}
