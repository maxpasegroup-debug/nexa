import { prisma } from "@/lib/prisma";

export type NiceJobsOpportunity = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  potentialEarnings: string;
  commissionPercent: number;
  trainingDurationDays: number;
  status: string;
};

const fallbackOpportunities: NiceJobsOpportunity[] = [
  {
    id: "bgos-micro-franchise",
    slug: "bgos-micro-franchise",
    name: "BGOS Micro-Franchise",
    category: "SaaS referral",
    description:
      "Promote BGOS to growing businesses, complete the sales training, and earn commissions on validated subscriptions.",
    potentialEarnings: "GBP 300-1,500/month",
    commissionPercent: 30,
    trainingDurationDays: 7,
    status: "ACTIVE",
  },
  {
    id: "partner-growth-associate",
    slug: "partner-growth-associate",
    name: "Partner Growth Associate",
    category: "Partner apps",
    description:
      "Use approved promotional assets to refer qualified customers to partner tools inside the BGOS ecosystem.",
    potentialEarnings: "GBP 150-900/month",
    commissionPercent: 20,
    trainingDurationDays: 5,
    status: "ACTIVE",
  },
];

function toNumber(value: unknown) {
  if (typeof value === "number") return value;
  if (value && typeof value === "object" && "toNumber" in value) {
    return (value as { toNumber: () => number }).toNumber();
  }

  return Number(value || 0);
}

export async function getNiceJobsOpportunities() {
  try {
    const rows = await prisma.niceJobsFranchise.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    });

    if (!rows.length) return fallbackOpportunities;

    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      category: row.category,
      description: row.description,
      potentialEarnings: row.potentialEarnings || "Commission based",
      commissionPercent: toNumber(row.commissionPercent),
      trainingDurationDays: row.trainingDurationDays,
      status: row.status,
    }));
  } catch (error) {
    console.error("[nicejobs:opportunities]", error);
    return fallbackOpportunities;
  }
}

export async function getNiceJobsOpportunity(slug: string) {
  const opportunities = await getNiceJobsOpportunities();
  return opportunities.find((opportunity) => opportunity.slug === slug) || null;
}

export async function getNiceJobsUserSummary(userId: string) {
  try {
    const [applications, referrals, payouts] = await Promise.all([
      prisma.niceJobsApplication.findMany({
        where: { userId },
        include: { franchise: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.niceJobsReferral.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.niceJobsPayout.findMany({
        where: { userId },
        orderBy: [{ year: "desc" }, { month: "desc" }],
      }),
    ]);

    const approvedEarnings = referrals
      .filter((referral) => ["VALIDATED", "APPROVED"].includes(referral.status))
      .reduce((total, referral) => total + toNumber(referral.earningsOwed), 0);

    const pendingEarnings = referrals
      .filter((referral) => referral.status === "PENDING")
      .reduce((total, referral) => total + toNumber(referral.earningsOwed), 0);

    return {
      applications: applications.map((application) => ({
        id: application.id,
        status: application.status,
        referralCode: application.referralCode,
        franchiseName: application.franchise.name,
        appliedAt: application.appliedAt,
      })),
      referralsCount: referrals.length,
      approvedEarnings,
      pendingEarnings,
      nextPayout:
        payouts.find((payout) => ["PENDING", "SCHEDULED"].includes(payout.status)) || null,
    };
  } catch (error) {
    console.error("[nicejobs:user-summary]", error);
    return {
      applications: [],
      referralsCount: 0,
      approvedEarnings: 0,
      pendingEarnings: 0,
      nextPayout: null,
    };
  }
}
