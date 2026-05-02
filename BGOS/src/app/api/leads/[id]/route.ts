import { NextResponse } from "next/server";

import {
  calculateFirstSaleCommission,
  checkAndAwardSlab,
  detectPlanType,
} from "@/lib/commission";
import { notifySlabAchievement } from "@/lib/commission-notify";
import {
  buildLeadUpdateData,
  getCrmContext,
  isLeadStatus,
} from "@/lib/leads/server";
import { analyseNotes } from "@/lib/nexa-bdm-analysis";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: {
    id: string;
  };
};

const bdmLeadStatuses = ["NEW", "CONTACTED", "FOLLOW_UP", "ONBOARDING", "LOST"] as const;

function isBdmLeadStatus(value: unknown): value is (typeof bdmLeadStatuses)[number] {
  return typeof value === "string" && bdmLeadStatuses.includes(value as (typeof bdmLeadStatuses)[number]);
}

function trialEndDate() {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  return date;
}

function monthYear(date = new Date()) {
  return {
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  };
}

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const context = await getCrmContext();

    if (context.error) return context.error;

    const lead = await prisma.lead.findFirst({
      where: {
        id: params.id,
        businessId: context.businessId,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        activities: {
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                name: true,
                role: true,
              },
            },
          },
        },
        reminders: {
          orderBy: { dueAt: "asc" },
          include: {
            user: {
              select: {
                name: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    }

    return NextResponse.json({ lead });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch lead." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const context = await getCrmContext();

    if (context.error) return context.error;

    const existingLead = await prisma.lead.findFirst({
      where: {
        id: params.id,
        businessId: context.businessId,
      },
    });

    if (!existingLead) {
      return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    }

    const body = await request.json();
    const data = buildLeadUpdateData(body);
    const statusChanged =
      isLeadStatus(body.status) && body.status !== existingLead.status;
    const bdmStatusChanged =
      isBdmLeadStatus(body.bdmStatus) && body.bdmStatus !== existingLead.bdmStatus;

    if (bdmStatusChanged) {
      data.bdmStatus = body.bdmStatus;
      data.lastContactedAt = new Date();

      if (body.bdmStatus === "LOST") {
        data.lostReason =
          typeof body.lostReason === "string" ? body.lostReason : existingLead.lostReason;
      }

      if (body.bdmStatus === "ONBOARDING") {
        data.onboardingStarted = true;
      }
    }

    if (typeof body.followUpDate === "string" || body.followUpDate === null) {
      data.followUpDate = body.followUpDate ? new Date(body.followUpDate) : null;
    }

    if (typeof body.followUpTime === "string" || body.followUpTime === null) {
      data.followUpTime = body.followUpTime;
    }

    if (statusChanged && body.status === "WON") {
      data.wonAt = new Date();
      data.lostAt = null;
    }

    if (statusChanged && body.status === "LOST") {
      data.lostAt = new Date();
      data.wonAt = null;
    }

    const updatedLead = await prisma.lead.update({
      where: { id: existingLead.id },
      data,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (statusChanged && body.status === "WON" && updatedLead.assignedTo) {
      const planType = detectPlanType(updatedLead.value);
      const commission = calculateFirstSaleCommission(planType, updatedLead);
      const commissionAmt = commission.final;
      const { month, year } = monthYear();

      await prisma.commission.upsert({
        where: { leadId: updatedLead.id },
        create: {
          userId: updatedLead.assignedTo,
          leadId: updatedLead.id,
          businessId: context.businessId,
          type: "FIRST_SALE",
          planType,
          dealValue: updatedLead.value,
          baseCommission: commission.base,
          multiplier: commission.multiplier,
          commissionAmt,
          status: "PENDING",
          month,
          year,
        },
        update: {
          userId: updatedLead.assignedTo,
          businessId: context.businessId,
          type: "FIRST_SALE",
          planType,
          dealValue: updatedLead.value,
          baseCommission: commission.base,
          multiplier: commission.multiplier,
          commissionAmt,
          status: "PENDING",
          paidAt: null,
          clawbackAt: null,
          clawbackReason: null,
          month,
          year,
        },
      });

      await prisma.customerPortfolio.upsert({
        where: { leadId: updatedLead.id },
        create: {
          userId: updatedLead.assignedTo,
          leadId: updatedLead.id,
          planType,
          monthlyValue: updatedLead.value,
          status: "TRIAL",
          trialEndsAt: trialEndDate(),
        },
        update: {
          userId: updatedLead.assignedTo,
          planType,
          monthlyValue: updatedLead.value,
          status: "TRIAL",
          trialEndsAt: trialEndDate(),
        },
      });

      await notifySlabAchievement(updatedLead.assignedTo);

      await prisma.nexaInsight.create({
        data: {
          businessId: context.businessId,
          type: "opportunity",
          message: `New deal closed by ${updatedLead.assignee?.name ?? "BDM"} - ${updatedLead.name} on ${planType}. Commission: ₹${commissionAmt.toLocaleString("en-IN")}`,
          action: "Review payout",
        },
      });
    }

    if (
      statusChanged &&
      existingLead.status === "WON" &&
      body.status !== "WON"
    ) {
      const commission = await prisma.commission.findUnique({
        where: { leadId: existingLead.id },
        select: { userId: true, month: true, year: true },
      });

      await prisma.commission.updateMany({
        where: { leadId: existingLead.id },
        data: {
          status: "CLAWBACK",
          clawbackAt: new Date(),
          clawbackReason: "Deal reversed",
        },
      });

      await prisma.customerPortfolio.updateMany({
        where: { leadId: existingLead.id },
        data: { status: "CHURNED" },
      });

      if (commission) {
        await prisma.commission.deleteMany({
          where: {
            userId: commission.userId,
            month: commission.month,
            year: commission.year,
            type: {
              in: [
                "SLAB_BRONZE",
                "SLAB_SILVER",
                "SLAB_GOLD",
                "SLAB_DIAMOND",
              ],
            },
          },
        });
        await prisma.slabAchievement.deleteMany({
          where: {
            userId: commission.userId,
            month: commission.month,
            year: commission.year,
          },
        });
        await checkAndAwardSlab(commission.userId);
      }
    }

    if (statusChanged) {
      await prisma.leadActivity.create({
        data: {
          leadId: existingLead.id,
          userId: context.user.id,
          type: "status_change",
          note: `Status changed from ${existingLead.status} to ${body.status}`,
        },
      });
    }

    if (bdmStatusChanged) {
      await prisma.leadActivity.create({
        data: {
          leadId: existingLead.id,
          userId: context.user.id,
          type: "bdm_status_change",
          note: `BDM status changed from ${existingLead.bdmStatus} to ${body.bdmStatus}`,
        },
      });

      const analysisUserId = updatedLead.assignedTo ?? context.user.id;
      void Promise.allSettled([analyseNotes(analysisUserId)]);
    }

    await prisma.activityLog.create({
      data: {
        businessId: context.businessId,
        userId: context.user.id,
        action: statusChanged
          ? `Lead status changed to ${body.status}`
          : "Lead updated",
        entity: "Lead",
        entityId: existingLead.id,
        meta: { leadName: updatedLead.name },
      },
    });

    return NextResponse.json({ lead: updatedLead });
  } catch {
    return NextResponse.json(
      { error: "Unable to update lead." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const context = await getCrmContext();

    if (context.error) return context.error;

    const lead = await prisma.lead.findFirst({
      where: {
        id: params.id,
        businessId: context.businessId,
      },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    }

    await prisma.lead.delete({ where: { id: lead.id } });

    await prisma.activityLog.create({
      data: {
        businessId: context.businessId,
        userId: context.user.id,
        action: "Lead deleted",
        entity: "Lead",
        entityId: lead.id,
        meta: { leadName: lead.name },
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Unable to delete lead." },
      { status: 500 },
    );
  }
}
