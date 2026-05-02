"use client";

import { useCallback, useEffect, useState } from "react";

import { CustomerPortfolio } from "@/components/bde/customer-portfolio";
import { EarningsTracker } from "@/components/bde/earnings-tracker";
import { Leaderboard } from "@/components/bde/leaderboard";
import { NexaBdePanel } from "@/components/bde/nexa-bde-panel";
import { PayoutHistory } from "@/components/bde/payout-history";
import { SlabCelebration } from "@/components/bde/slab-celebration";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";

type BdeUser = {
  id: string;
  name: string;
  role: string;
  businessId: string;
  businessName: string;
};

type CommissionSummary = {
  firstSale: number;
  renewal: number;
  slab: number;
  total: number;
  target: number;
  progressPct: number;
  currentSlab: { name: string; label: string; bonus: number; deals: number };
  nextMilestone: string | null;
  projectedTotal: number;
  daysElapsed: number;
  daysRemaining: number;
  dealsThisMonth: number;
  leadTypeBreakdown?: Record<"platform" | "management" | "self", { closed: number; amount: number; base: number }>;
  commissions: unknown[];
};

type PortfolioData = {
  paying: PortfolioCustomer[];
  trial: PortfolioCustomer[];
  overdue: PortfolioCustomer[];
  churned: PortfolioCustomer[];
  summary: {
    totalPaying: number;
    totalTrial: number;
    monthlyRenewalIncome: number;
    atRiskCount: number;
  };
};

type PortfolioCustomer = {
  id: string;
  leadId: string;
  planType: string;
  monthlyValue: number;
  status: "TRIAL" | "PAYING" | "OVERDUE" | "CHURNED" | "UPGRADED";
  trialEndsAt: string | Date | null;
  nextRenewalAt: string | Date | null;
  renewalCount: number;
  lead: {
    id: string;
    name: string;
    phone: string | null;
    company: string | null;
  };
};

type LeaderboardRow = {
  rank: number;
  userId: string;
  name: string;
  dealsThisMonth: number;
  totalThisMonth: number;
  trend: "up" | "down" | "same" | string;
};

type PayoutRecord = {
  month: number;
  year: number;
  label: string;
  firstSale: number;
  renewal: number;
  slabBonus: number;
  total: number;
  status: string;
};

type SlabAchievement = {
  id: string;
  slabName: string;
  bonusAmt: number;
} | null;

type BdeCommissionDashboardProps = {
  user: BdeUser;
  initialCommission: CommissionSummary;
  initialPortfolio: PortfolioData;
  initialLeaderboard: LeaderboardRow[];
  initialHistory: PayoutRecord[];
  slabAchievement: SlabAchievement;
};

function money(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

function dealTone(deals: number) {
  if (deals < 3) return "text-[#FF6B6B]";
  if (deals < 5) return "text-[#F5A623]";
  return "text-[#22D9A0]";
}

function daysTone(days: number) {
  if (days < 5) return "text-[#FF6B6B]";
  return "text-[#22D9A0]";
}

function MetricCard({
  label,
  value,
  tone,
  subtitle,
}: {
  label: string;
  value: string | number;
  tone: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#13131c] p-5">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </p>
      <p className={`mt-4 font-heading text-3xl font-bold ${tone}`}>{value}</p>
      <p className="mt-2 text-sm text-zinc-500">{subtitle}</p>
    </div>
  );
}

export function BdeCommissionDashboard({
  user,
  initialCommission,
  initialPortfolio,
  initialLeaderboard,
  initialHistory,
  slabAchievement,
}: BdeCommissionDashboardProps) {
  const [commission, setCommission] = useState(initialCommission);
  const [achievement, setAchievement] = useState(slabAchievement);

  const fetchCommission = useCallback(async () => {
    const response = await fetch("/api/commission", { cache: "no-store" });
    if (!response.ok) return;
    setCommission((await response.json()) as CommissionSummary);
  }, []);

  useEffect(() => {
    async function fetchSlabAlert() {
      const response = await fetch("/api/commission/slab-alert", {
        cache: "no-store",
      });
      if (!response.ok) return;
      const data = (await response.json()) as { achievement: SlabAchievement };
      if (data.achievement) setAchievement(data.achievement);
    }

    void fetchSlabAlert();
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => void fetchCommission(), 60_000);
    return () => window.clearInterval(interval);
  }, [fetchCommission]);

  return (
    <div className="min-h-screen bg-[#070709] pl-[240px] text-white">
      <Sidebar role="BDM" userName={user.name} businessName={user.businessName} />
      <Navbar title="Earnings" userName={user.name} />

      <SlabCelebration
        achievement={achievement}
        onDismiss={() => setAchievement(null)}
      />

      <main className="pt-[60px]">
        <div className="space-y-6 p-8">
          <EarningsTracker data={commission} />

          <section className="grid gap-4 md:grid-cols-3">
            <MetricCard
              label="Deals this month"
              value={commission.dealsThisMonth}
              tone={dealTone(commission.dealsThisMonth)}
              subtitle="First-sale commissions closed"
            />
            <MetricCard
              label="Renewal income"
              value={money(initialPortfolio.summary.monthlyRenewalIncome)}
              tone="text-[#22D9A0]"
              subtitle="Expected monthly renewal commission"
            />
            <MetricCard
              label="Days remaining"
              value={commission.daysRemaining}
              tone={daysTone(commission.daysRemaining)}
              subtitle="Left to hit your monthly target"
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[60fr_40fr]">
            <CustomerPortfolio portfolio={initialPortfolio} />
            <div className="space-y-6">
              <Leaderboard
                leaderboard={initialLeaderboard}
                currentUserId={user.id}
              />
              <NexaBdePanel businessId={user.businessId} variant="embedded" />
            </div>
          </section>

          <PayoutHistory history={initialHistory} />
        </div>
      </main>
    </div>
  );
}
