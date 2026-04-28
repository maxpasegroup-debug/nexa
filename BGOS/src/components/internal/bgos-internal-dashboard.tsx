"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { signOut } from "next-auth/react";
import {
  Bot,
  Building2,
  LayoutDashboard,
  LogOut,
  Settings,
  Target,
  UserPlus,
  Users,
} from "lucide-react";

import {
  MetricCard,
} from "@/components/boss/metric-card";
import {
  NexaInsight,
  NexaInsightsPanel,
} from "@/components/boss/nexa-insights-panel";
import { NexaPanel } from "@/components/boss/nexa-panel";
import { AddEmployeeForm } from "@/components/internal/add-employee-form";
import {
  EmployeeList,
  type EmployeeListItem,
} from "@/components/internal/employee-list";

type InternalUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type InternalBusinessSummary = {
  id: string;
  name: string;
  healthScore: number;
};

type InternalMetrics = {
  totalCustomers: number;
  totalUsers: number;
  totalLeads: number;
  newThisMonth: number;
};

type PlatformCommissionSummary = {
  totalCommissionOwed: number;
  firstSaleCommissions: number;
  renewalCommissions: number;
  slabBonuses: number;
};

export type InternalBusiness = {
  id: string;
  name: string;
  bossEmail: string;
  plan: "STARTER" | "GROWTH" | "SCALE";
  joinedAt: string;
  healthScore: number;
  active: boolean;
};

export type InternalTeamMember = EmployeeListItem;

export type InternalInsight = NexaInsight;

type BgosInternalDashboardProps = {
  user: InternalUser;
  business: InternalBusinessSummary;
  metrics: InternalMetrics;
  businesses: InternalBusiness[];
  teamMembers: InternalTeamMember[];
  insights: InternalInsight[];
  commissionSummary: PlatformCommissionSummary;
};

const navItems = [
  { label: "Overview", href: "/internal", icon: LayoutDashboard },
  { label: "Customers", href: "/internal/customers", icon: Building2 },
  { label: "My Team", href: "/internal/team", icon: Users },
  { label: "BGOS Leads", href: "/internal/leads", icon: Target },
  { label: "NEXA", href: "/internal/nexa", icon: Bot },
  { label: "Settings", href: "/internal/settings", icon: Settings },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function planClass(plan: InternalBusiness["plan"]) {
  if (plan === "SCALE") return "border-[#22D9A0]/30 bg-[#22D9A0]/10 text-[#22D9A0]";
  if (plan === "GROWTH") return "border-[#7C6FFF]/30 bg-[#7C6FFF]/10 text-[#c6c1ff]";
  return "border-white/10 bg-white/5 text-zinc-300";
}

function healthClass(score: number) {
  if (score >= 75) return "text-[#22D9A0]";
  if (score >= 45) return "text-[#F5A623]";
  return "text-[#FF6B6B]";
}

function money(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

export function InternalSidebar({ user }: { user: InternalUser }) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[240px] flex-col border-r border-[rgba(255,255,255,0.07)] bg-[#0d0d11]">
      <div className="border-b border-white/10 px-6 py-5">
        <div className="font-heading text-xl font-bold tracking-normal">
          <span className="text-white">BG</span>
          <span className="text-[#7C6FFF]">OS</span>
        </div>
        <p className="mt-1 truncate text-[11px] text-zinc-500">
          Owner workspace
        </p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/internal"
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                active
                  ? "border-l-2 border-[#7C6FFF] bg-[rgba(124,111,255,0.12)] text-white"
                  : "text-[#6B6878] hover:bg-[rgba(255,255,255,0.04)]"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#7C6FFF] text-sm font-bold text-white">
            {initials(user.name)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-white">
              {user.name}
            </p>
            <span className="mt-1 inline-flex rounded-full border border-[#F5A623]/30 bg-[#F5A623]/10 px-2 py-0.5 text-[10px] font-bold text-[#F5A623]">
              OWNER
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-semibold text-zinc-400 transition hover:bg-[rgba(255,255,255,0.04)] hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}

export function InternalTopbar({ user }: { user: InternalUser }) {
  return (
    <header className="fixed left-[240px] right-0 top-0 z-30 flex h-[60px] items-center justify-between border-b border-[rgba(255,255,255,0.07)] bg-[rgba(13,13,17,0.8)] px-8 backdrop-blur-[12px]">
      <h1 className="font-heading text-base font-bold text-white">
        BGOS Control Room
      </h1>
      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-bold text-[#22D9A0] sm:flex">
          <span className="relative flex h-2 w-2 rounded-full bg-[#22D9A0]">
            <span className="absolute inset-0 animate-ping rounded-full bg-[#22D9A0] opacity-60" />
          </span>
          NEXA running
        </div>
        <div className="h-6 w-px bg-white/10" />
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-zinc-400 lg:inline">
            {user.email}
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#7C6FFF] text-sm font-bold text-white">
            {initials(user.name)}
          </div>
        </div>
      </div>
    </header>
  );
}

function RecentCustomersTable({ businesses }: { businesses: InternalBusiness[] }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#13131c] p-6">
      <h2 className="font-heading text-lg font-bold">Recent customers</h2>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-xs uppercase text-zinc-500">
            <tr className="border-b border-white/10">
              <th className="pb-3 font-semibold">Business name</th>
              <th className="pb-3 font-semibold">Boss email</th>
              <th className="pb-3 font-semibold">Plan</th>
              <th className="pb-3 font-semibold">Joined</th>
              <th className="pb-3 font-semibold">Health</th>
              <th className="pb-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {businesses.length > 0 ? (
              businesses.map((business) => (
                <tr key={business.id} className="border-b border-white/5">
                  <td className="py-4 font-semibold text-white">
                    {business.name}
                  </td>
                  <td className="py-4 text-zinc-400">{business.bossEmail}</td>
                  <td className="py-4">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${planClass(
                        business.plan,
                      )}`}
                    >
                      {business.plan}
                    </span>
                  </td>
                  <td className="py-4 text-zinc-400">
                    {dateLabel(business.joinedAt)}
                  </td>
                  <td className={`py-4 font-bold ${healthClass(business.healthScore)}`}>
                    {business.healthScore}
                  </td>
                  <td className="py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        business.active
                          ? "bg-[#22D9A0]/10 text-[#22D9A0]"
                          : "bg-zinc-500/10 text-zinc-400"
                      }`}
                    >
                      {business.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-10 text-center text-zinc-500">
                  No customer businesses yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function BgosTeamPanel({
  teamMembers,
  onEmployeesChange,
}: {
  teamMembers: InternalTeamMember[];
  onEmployeesChange: (employees: InternalTeamMember[]) => void;
}) {
  const [showForm, setShowForm] = useState(false);

  async function refreshEmployees() {
    const response = await fetch("/api/internal/employees", {
      cache: "no-store",
    });
    if (!response.ok) return;
    const data = (await response.json()) as {
      employees: InternalTeamMember[];
    };
    onEmployeesChange(data.employees);
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-[#13131c] p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-heading text-lg font-bold">BGOS Team</h2>
        <Link href="/internal/team" className="text-sm font-semibold text-[#7C6FFF]">
          View all
        </Link>
      </div>
      <button
        type="button"
        onClick={() => setShowForm((value) => !value)}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#7C6FFF] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#6b60e8] focus:outline-none focus:ring-2 focus:ring-[#7C6FFF]/40"
      >
        <UserPlus className="h-4 w-4" />
        Add employee
      </button>
      <div
        className={`grid transition-all duration-300 ${
          showForm ? "mt-4 grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <AddEmployeeForm
            onSuccess={() => void refreshEmployees()}
            onClose={() => setShowForm(false)}
          />
        </div>
      </div>
      <div className="mt-5">
        <EmployeeList
          employees={teamMembers
            .filter((member) => member.role === "BDM" || member.role === "SDE")
            .slice(0, 4)}
          onResetPassword={() => void refreshEmployees()}
        />
      </div>
    </section>
  );
}

export function BgosInternalDashboard({
  user,
  business,
  metrics,
  businesses,
  teamMembers,
  insights: initialInsights,
  commissionSummary,
}: BgosInternalDashboardProps) {
  const [insights, setInsights] = useState(initialInsights);
  const [employees, setEmployees] = useState(teamMembers);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const platformSummary = useMemo(
    () =>
      `${metrics.totalCustomers} customers, ${metrics.totalUsers} users, ${metrics.totalLeads} leads`,
    [metrics],
  );

  async function refreshInsights() {
    setInsightsLoading(true);
    window.setTimeout(() => {
      setInsights((current) => [...current]);
      setInsightsLoading(false);
    }, 400);
  }

  return (
    <div className="min-h-screen bg-[#070709] pl-[240px] text-white md:pr-[320px]">
      <InternalSidebar user={user} />
      <InternalTopbar user={user} />

      <main className="pt-[60px]">
        <div className="space-y-8 p-8">
          <section>
            <h2 className="font-heading text-2xl font-bold tracking-normal">
              Overview
            </h2>
            <p className="mt-1 text-sm text-zinc-500">{platformSummary}</p>
          </section>

          <section className="grid gap-4 xl:grid-cols-4">
            <MetricCard
              title="Total Customers"
              value={metrics.totalCustomers}
              subtitle="Businesses on BGOS"
              icon={<span className="text-base">🏢</span>}
            />
            <MetricCard
              title="Total Users"
              value={metrics.totalUsers}
              subtitle="Across the platform"
              icon={<span className="text-base">👥</span>}
            />
            <MetricCard
              title="New This Month"
              value={metrics.newThisMonth}
              subtitle="Customer businesses"
              icon={<span className="text-base">📈</span>}
            />
            <MetricCard
              title="Total Leads"
              value={metrics.totalLeads}
              subtitle="All customer pipelines"
              icon={<span className="text-base">🎯</span>}
            />
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#13131c] p-6">
            <div className="mb-5">
              <h2 className="font-heading text-lg font-bold">
                Platform Commission Summary
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Current month payout visibility across all businesses.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              <MetricCard
                title="Total Owed"
                value={money(commissionSummary.totalCommissionOwed)}
                subtitle="All BDE commissions"
                icon={<span className="text-base">₹</span>}
              />
              <MetricCard
                title="First Sale"
                value={money(commissionSummary.firstSaleCommissions)}
                subtitle="New deals closed"
                icon={<span className="text-base">₹</span>}
              />
              <MetricCard
                title="Renewals"
                value={money(commissionSummary.renewalCommissions)}
                subtitle="Recurring payouts"
                icon={<span className="text-base">₹</span>}
              />
              <MetricCard
                title="Slab Bonuses"
                value={money(commissionSummary.slabBonuses)}
                subtitle="Bonuses triggered"
                icon={<span className="text-base">₹</span>}
              />
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[3fr_2fr]">
            <RecentCustomersTable businesses={businesses} />
            <BgosTeamPanel
              teamMembers={employees}
              onEmployeesChange={setEmployees}
            />
          </section>

          <section id="nexa-insights-panel" className="scroll-mt-24">
            <NexaInsightsPanel
              insights={insights}
              onRefresh={() => void refreshInsights()}
              loading={insightsLoading}
            />
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#13131c] p-6 md:hidden">
            <h2 className="font-heading text-lg font-bold">NEXA</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Ask NEXA about platform customers, team execution, and BGOS growth.
              The full chat panel is available from the floating NEXA button.
            </p>
          </section>
        </div>
      </main>

      <NexaPanel
        businessId={business.id}
        initialMessage="Brief me on the BGOS platform: total customers, MRR, team performance, churn risks, and the next three owner actions."
      />
    </div>
  );
}
