import { NextResponse } from "next/server";

import {
  buildLeadUpdateData,
  getCrmContext,
  isLeadStatus,
} from "@/lib/leads/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: {
    id: string;
  };
};

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
            name: true,
            role: true,
          },
        },
      },
    });

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
