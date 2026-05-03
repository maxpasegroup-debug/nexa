import { NextResponse } from "next/server";

import { getBdmContext, monthBounds, todayBounds } from "@/lib/bdm/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const context = await getBdmContext();
    if (context.error) return context.error;

    const now = new Date();
    const month = monthBounds(now);
    const today = todayBounds(now);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [leads, notes, wallet, target, totalBDMs, wallets] = await Promise.all([
      prisma.lead.findMany({
        where: { assignedTo: context.user.id },
        select: {
          id: true,
          bdmStatus: true,
          score: true,
          followUpDate: true,
          lastContactAt: true,
          lastContactedAt: true,
          createdAt: true,
        },
      }),
      prisma.leadNote.findMany({
        where: {
          authorId: context.user.id,
          createdAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
        },
        select: { id: true },
      }),
      prisma.bDMWallet.findUnique({ where: { userId: context.user.id } }),
      prisma.target.findUnique({
        where: {
          userId_month_year: {
            userId: context.user.id,
            month: month.month,
            year: month.year,
          },
        },
      }),
      prisma.user.count({ where: { businessId: context.businessId, role: "BDM" } }),
      prisma.bDMWallet.findMany({
        where: { user: { businessId: context.businessId, role: "BDM" } },
        select: { userId: true, thisMonthEarned: true },
        orderBy: { thisMonthEarned: "desc" },
      }),
    ]);

    const followUpsToday = leads.filter(
      (lead) => lead.followUpDate && lead.followUpDate >= today.start && lead.followUpDate < today.end,
    ).length;
    const followUpsOverdue = leads.filter(
      (lead) => lead.followUpDate && lead.followUpDate < today.start,
    ).length;
    const responseTimes = leads
      .filter((lead) => lead.lastContactAt)
      .map((lead) => (lead.lastContactAt!.getTime() - lead.createdAt.getTime()) / 3_600_000)
      .filter((hours) => hours >= 0);
    const avgResponseTime = responseTimes.length
      ? Math.round((responseTimes.reduce((sum, hours) => sum + hours, 0) / responseTimes.length) * 10) / 10
      : 0;
    const earnedThisMonth = wallet?.thisMonthEarned || 0;
    const revenueTarget = target?.revenueTarget || 30000;
    const progressPct = revenueTarget > 0 ? Math.min(100, Math.round((earnedThisMonth / revenueTarget) * 100)) : 0;
    const rankIndex = wallets.findIndex((item) => item.userId === context.user.id);
    const rank = rankIndex >= 0 ? rankIndex + 1 : 0;
    const dealsThisMonth =
      (await prisma.commission.count({
        where: {
          userId: context.user.id,
          createdAt: { gte: monthStart },
          type: { in: ["PLAN_FIRST_SALE", "AGENT_FIRST_SALE", "FIRST_SALE"] },
          status: { in: ["EARNED", "PENDING", "PAID_OUT", "PAID"] },
        },
      })) || 0;

    const totalLeads = leads.length;
    const newLeads = leads.filter((lead) => lead.bdmStatus === "NEW").length;
    const contactedLeads = leads.filter((lead) => lead.bdmStatus === "CONTACTED").length;
    const followUpLeads = leads.filter((lead) => lead.bdmStatus === "FOLLOW_UP").length;
    const onboardingLeads = leads.filter((lead) => lead.bdmStatus === "ONBOARDING").length;
    const lostLeads = leads.filter((lead) => lead.bdmStatus === "LOST").length;

    return NextResponse.json({
      totalLeads,
      newLeads,
      contactedLeads,
      followUpLeads,
      onboardingLeads,
      lostLeads,
      callsThisWeek: notes.length,
      dealsThisMonth,
      earnedThisMonth,
      planCommission: wallet?.thisMonthPlanComm || 0,
      agentCommission: wallet?.thisMonthAgentComm || 0,
      renewalIncome: wallet?.thisMonthRenewals || 0,
      slabBonus: wallet?.thisMonthSlabBonus || 0,
      currentSlab: wallet?.currentSlab || "NONE",
      teamRank: rank || 0,
      totalBDMs: totalBDMs || 1,
      target: target || { revenueTarget: 30000 },
      progressPct: progressPct || 0,

      myLeadsTotal: totalLeads,
      myLeadsNew: newLeads,
      myLeadsHot: leads.filter((lead) => (lead.score ?? 0) > 70).length,
      followUpsDueToday: followUpsToday,
      followUpsOverdue,
      wonThisMonth: dealsThisMonth,
      wonTarget: target?.wonTarget || 0,
      wonProgress: target?.wonTarget ? Math.round((dealsThisMonth / target.wonTarget) * 100) : 0,
      revenueThisMonth: earnedThisMonth,
      revenueTarget,
      revenueProgress: progressPct,
      callsToday: notes.length,
      avgResponseTime,
      conversionRate: totalLeads > 0 ? Math.round((dealsThisMonth / totalLeads) * 1000) / 10 : 0,
      teamSize: totalBDMs || 1,
    });
  } catch (error) {
    console.error("[bdm-metrics:get]", error);
    return NextResponse.json({ error: "Unable to fetch BDM metrics." }, { status: 500 });
  }
}
