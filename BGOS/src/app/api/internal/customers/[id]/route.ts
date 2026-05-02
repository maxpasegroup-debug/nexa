import { NextResponse } from "next/server";

import { mrrForPlan, normalizeCustomerStatus, planForBusiness } from "@/lib/internal-control";
import { requireInternalOwnerApi } from "@/lib/internal-owner";
import { prisma } from "@/lib/prisma";

function str(value: unknown) {
  return typeof value === "string" ? value.trim() : undefined;
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const context = await requireInternalOwnerApi();
  if ("error" in context) return context.error;

  const business = await prisma.business.findFirst({
    where: { AND: [{ id: params.id }, { id: { not: context.business.id } }] },
    include: {
      users: { orderBy: { createdAt: "asc" }, select: { id: true, name: true, email: true, role: true, active: true, status: true, updatedAt: true } },
      pipelines: { include: { leads: { select: { id: true, status: true } } } },
      leads: { select: { id: true, status: true, value: true, assignedTo: true, createdAt: true } },
      bugs: { orderBy: { createdAt: "desc" }, take: 50 },
      escalations: { orderBy: { createdAt: "desc" }, take: 50 },
      nexaActions: { orderBy: { createdAt: "desc" }, take: 20 },
      activityLogs: { orderBy: { createdAt: "desc" }, take: 20, include: { user: { select: { name: true, email: true } } } },
      nexaMemory: { orderBy: { updatedAt: "desc" }, take: 20 },
      snapshots: { orderBy: { date: "desc" }, take: 30 },
      trialSubscription: true,
      commissions: { include: { user: { select: { id: true, name: true } } } },
      onboardingLead: { include: { assignedBDM: { select: { id: true, name: true, email: true, phone: true } } } },
    },
  });

  if (!business) return NextResponse.json({ error: "Customer not found." }, { status: 404 });

  const plan = planForBusiness(business);
  const status = normalizeCustomerStatus(business);
  const mrr = mrrForPlan(plan, business.trialSubscription?.monthlyAmount);

  return NextResponse.json({
    customer: {
      id: business.id,
      clientId: business.clientId,
      name: business.name,
      plan,
      status,
      healthScore: business.healthScore,
      mrr,
      notes: business.notes,
      joinedAt: business.createdAt.toISOString(),
      trialEndsAt: business.trialSubscription?.trialEndsAt?.toISOString() ?? null,
      bdm: business.onboardingLead?.assignedBDM ?? null,
      users: business.users.map((user) => ({
        ...user,
        lastLoginAt: user.updatedAt.toISOString(),
      })),
      pipelines: business.pipelines.map((pipeline) => ({
        id: pipeline.id,
        name: pipeline.name,
        productName: pipeline.productName,
        stages: pipeline.stages,
        leads: pipeline.leads,
        leadCount: pipeline.leads.length,
      })),
      leadsSummary: {
        total: business.leads.length,
        won: business.leads.filter((lead) => lead.status === "WON").length,
        open: business.leads.filter((lead) => !["WON", "LOST"].includes(lead.status)).length,
      },
      supportTickets: [...business.bugs, ...business.escalations],
      ratings: [],
      revenue: {
        mrr,
        totalPaidToDate: business.commissions.reduce((sum, item) => sum + item.dealValue, 0),
        nextBillingDate: business.trialSubscription?.trialEndsAt ?? null,
        commissionPaid: business.commissions.reduce((sum, item) => sum + item.commissionAmt, 0),
      },
      healthHistory: business.snapshots,
      insights: business.nexaActions,
      activity: business.activityLogs,
      nexaMemory: business.nexaMemory,
    },
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const context = await requireInternalOwnerApi();
  if ("error" in context) return context.error;

  const body = (await request.json()) as Record<string, unknown>;
  const plan = str(body.plan);
  const status = str(body.status);
  const trialEndsAt = str(body.trialEndsAt);

  const business = await prisma.business.update({
    where: { id: params.id },
    data: {
      ...(str(body.name) ? { name: str(body.name) } : {}),
      ...(status ? { status } : {}),
      ...(str(body.notes) !== undefined ? { notes: str(body.notes) } : {}),
    },
    include: { trialSubscription: true },
  });

  if (plan || trialEndsAt) {
    await prisma.trialSubscription.upsert({
      where: { businessId: params.id },
      create: {
        businessId: params.id,
        plan: plan ?? "GROWTH",
        trialStartedAt: new Date(),
        trialEndsAt: trialEndsAt ? new Date(trialEndsAt) : new Date(Date.now() + 7 * 86400000),
        monthlyAmount: mrrForPlan(plan ?? "GROWTH"),
      },
      update: {
        ...(plan ? { plan, monthlyAmount: mrrForPlan(plan) } : {}),
        ...(trialEndsAt ? { trialEndsAt: new Date(trialEndsAt) } : {}),
      },
    });
    if (plan) {
      await prisma.nexaInsight.create({
        data: {
          businessId: params.id,
          type: "action",
          message: `Your workspace has been upgraded to ${plan}. New features are now available.`,
          action: "Plan updated",
        },
      });
    }
  }

  return NextResponse.json({ business });
}
