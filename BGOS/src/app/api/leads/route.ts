import { NextResponse } from "next/server";

import {
  getCrmContext,
  isLeadSource,
  isLeadStatus,
  scoreLead,
} from "@/lib/leads/server";
import { prisma } from "@/lib/prisma";

function tomorrow() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(9, 0, 0, 0);
  return date;
}

export async function GET(request: Request) {
  try {
    const context = await getCrmContext();

    if (context.error) return context.error;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const assignedTo = searchParams.get("assignedTo");
    const search = searchParams.get("search");
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 50)));
    const skip = (page - 1) * limit;

    const where = {
      businessId: context.businessId,
      ...(isLeadStatus(status) ? { status } : {}),
      ...(assignedTo ? { assignedTo } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { email: { contains: search, mode: "insensitive" as const } },
              { phone: { contains: search, mode: "insensitive" as const } },
              { company: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [leads, total, pipelines] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.lead.count({ where }),
      prisma.pipeline.findMany({
        where: { businessId: context.businessId, isActive: true },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    return NextResponse.json({ leads, total, page, limit, pipelines });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch leads." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const context = await getCrmContext();

    if (context.error) return context.error;

    const body = await request.json();

    if (!body.name || typeof body.name !== "string") {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }

    const pipelineId =
      typeof body.pipelineId === "string"
        ? await prisma.pipeline
            .findFirst({
              where: {
                id: body.pipelineId,
                businessId: context.businessId,
                isActive: true,
              },
              select: { id: true },
            })
            .then((pipeline) => pipeline?.id)
        : undefined;

    const lead = await prisma.lead.create({
      data: {
        name: body.name,
        phone: typeof body.phone === "string" ? body.phone : undefined,
        email:
          typeof body.email === "string" ? body.email.toLowerCase() : undefined,
        company: typeof body.company === "string" ? body.company : undefined,
        source: isLeadSource(body.source) ? body.source : "MANUAL",
        value: typeof body.value === "number" ? body.value : Number(body.value ?? 0) || 0,
        notes: typeof body.notes === "string" ? body.notes : undefined,
        createdBy: context.user.id,
        pipelineId,
        assignedTo:
          context.user.role === "BDM"
            ? context.user.id
            : typeof body.assignedTo === "string"
              ? body.assignedTo
              : undefined,
        followUpDate:
          typeof body.followUpDate === "string"
            ? new Date(body.followUpDate)
            : undefined,
        businessId: context.businessId,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    await prisma.activityLog.create({
      data: {
        businessId: context.businessId,
        userId: context.user.id,
        action: "Lead created",
        entity: "Lead",
        entityId: lead.id,
        meta: { leadName: lead.name },
      },
    });

    const shouldRunBdmAutomation = context.user.role === "BDM";

    if (shouldRunBdmAutomation) {
      void Promise.allSettled([
        scoreLead(lead.id),
        prisma.task.create({
          data: {
            title: `Follow up with ${lead.name} - new lead you added today`,
            description: "Created automatically by NEXA after quick lead capture.",
            priority: "HIGH",
            dueDate: tomorrow(),
            assignedTo: context.user.id,
          },
        }),
      ]);

      return NextResponse.json({ lead, score: null }, { status: 201 });
    }

    const score = await scoreLead(lead.id);
    const scoredLead = await prisma.lead.findUnique({
      where: { id: lead.id },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({ lead: scoredLead, score }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Unable to create lead." },
      { status: 500 },
    );
  }
}
