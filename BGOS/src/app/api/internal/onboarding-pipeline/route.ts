import { NextResponse } from "next/server";
import type { OnboardingLeadStatus } from "@prisma/client";

import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const statuses: OnboardingLeadStatus[] = [
  "NEW",
  "BDM_ASSIGNED",
  "BDM_SUBMITTED",
  "SDE_BUILDING",
  "BOSS_PREVIEWING",
  "TRIAL_ACTIVE",
];

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [leads, newToday, trialsActive, convertedThisMonth, team] =
      await Promise.all([
        prisma.onboardingLead.findMany({
          orderBy: { updatedAt: "desc" },
          include: {
            assignedBDM: { select: { id: true, name: true, email: true } },
            assignedSDE: { select: { id: true, name: true, email: true } },
            workspaceConfig: {
              select: {
                deliveredAt: true,
                createdAt: true,
              },
            },
            business: {
              select: {
                trialSubscription: {
                  select: {
                    trialEndsAt: true,
                    monthlyAmount: true,
                    status: true,
                  },
                },
              },
            },
          },
        }),
        prisma.onboardingLead.count({ where: { createdAt: { gte: startOfToday } } }),
        prisma.onboardingLead.count({ where: { status: "TRIAL_ACTIVE" } }),
        prisma.onboardingLead.count({
          where: { status: "CONVERTED", convertedAt: { gte: startOfMonth } },
        }),
        prisma.user.findMany({
          where: { role: { in: ["BDM", "SDE"] } },
          select: { id: true, name: true, email: true, role: true },
          orderBy: [{ role: "asc" }, { name: "asc" }],
        }),
      ]);

    const deliveredLeads = leads.filter(
      (lead) => lead.bdmSubmittedAt && lead.sdeDeliveredAt,
    );
    const averageTimeToDelivery =
      deliveredLeads.length > 0
        ? Math.round(
            deliveredLeads.reduce((sum, lead) => {
              return (
                sum +
                (lead.sdeDeliveredAt!.getTime() - lead.bdmSubmittedAt!.getTime()) /
                  3_600_000
              );
            }, 0) / deliveredLeads.length,
          )
        : 0;

    const grouped = Object.fromEntries(
      statuses.map((status) => [
        status,
        leads
          .filter((lead) => lead.status === status)
          .map((lead) => ({
            id: lead.id,
            status: lead.status,
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            companyName: lead.companyName,
            employeeCount: lead.employeeCount,
            businessType: lead.businessType,
            challenge: lead.challenge,
            plan: lead.selectedPlan,
            bdmNotes: lead.bdmNotes,
            sdeNotes: lead.sdeNotes,
            createdAt: lead.createdAt.toISOString(),
            updatedAt: lead.updatedAt.toISOString(),
            bdmSubmittedAt: lead.bdmSubmittedAt?.toISOString() ?? null,
            sdeDeliveredAt: lead.sdeDeliveredAt?.toISOString() ?? null,
            trialStartedAt: lead.trialStartedAt?.toISOString() ?? null,
            trialEndsAt:
              lead.trialEndsAt?.toISOString() ??
              lead.business?.trialSubscription?.trialEndsAt?.toISOString() ??
              null,
            convertedAt: lead.convertedAt?.toISOString() ?? null,
            assignedBDM: lead.assignedBDM,
            assignedSDE: lead.assignedSDE,
            trialAmount: lead.business?.trialSubscription?.monthlyAmount ?? null,
          })),
      ]),
    );

    return NextResponse.json({
      grouped,
      counts: Object.fromEntries(
        statuses.map((status) => [
          status,
          leads.filter((lead) => lead.status === status).length,
        ]),
      ),
      metrics: {
        newLeadsToday: newToday,
        trialsActive,
        convertedThisMonth,
        averageTimeToDelivery,
      },
      team,
    });
  } catch (error) {
    console.error("[internal:onboarding-pipeline]", error);
    return NextResponse.json(
      { error: "Unable to load onboarding pipeline." },
      { status: 500 },
    );
  }
}
