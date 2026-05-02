import { NextResponse } from "next/server";

import {
  getCrmContext,
  isLeadSource,
  isLeadStatus,
  scoreLead,
} from "@/lib/leads/server";
import {
  getIntelligentAssignment,
  getNextBDM,
} from "@/lib/nexa-lead-assignment";
import { prisma } from "@/lib/prisma";

const bdmLeadStatuses = ["NEW", "CONTACTED", "FOLLOW_UP", "ONBOARDING", "LOST"] as const;
const leadTypes = ["PLATFORM", "MANAGEMENT", "SELF"] as const;

function isLeadType(value: unknown): value is (typeof leadTypes)[number] {
  return typeof value === "string" && leadTypes.includes(value as (typeof leadTypes)[number]);
}

function isBdmLeadStatus(value: unknown): value is (typeof bdmLeadStatuses)[number] {
  return typeof value === "string" && bdmLeadStatuses.includes(value as (typeof bdmLeadStatuses)[number]);
}

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
    const leadType = searchParams.get("leadType");
    const search = searchParams.get("search");
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 50)));
    const skip = (page - 1) * limit;

    const where = {
      businessId: context.businessId,
      ...(isLeadStatus(status) ? { status } : {}),
      ...(assignedTo ? { assignedTo } : {}),
      ...(isLeadType(leadType) ? { leadType } : {}),
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

    const followUpDate =
      typeof body.followUpDate === "string"
        ? new Date(body.followUpDate)
        : undefined;
    const requestedLeadType = isLeadType(body.leadType) ? body.leadType : "SELF";
    const leadType =
      context.user.role === "BDM" && requestedLeadType !== "PLATFORM"
        ? "SELF"
        : requestedLeadType;
    const source = isLeadSource(body.leadSource)
      ? body.leadSource
      : isLeadSource(body.source)
        ? body.source
        : leadType === "MANAGEMENT"
          ? "MANAGEMENT_NETWORK"
          : leadType === "PLATFORM"
            ? "LANDING_PAGE"
            : "COLD_CALL";
    const slaHours = leadType === "MANAGEMENT" ? 1 : leadType === "PLATFORM" ? 2 : null;
    const commissionMultiplier =
      leadType === "MANAGEMENT" ? 0.7 : leadType === "SELF" ? 1.1 : 1.0;
    const ownerVisible = leadType === "MANAGEMENT";
    let assignedTo =
      context.user.role === "BDM"
        ? context.user.id
        : typeof body.assignedTo === "string"
          ? body.assignedTo
          : undefined;
    let assignmentDecision: { bdmId: string; bdmName: string; reason: string } | null = null;

    if (leadType === "PLATFORM") {
      const nextBDM = await getNextBDM(context.businessId);
      assignedTo = nextBDM.id;
      assignmentDecision = {
        bdmId: nextBDM.id,
        bdmName: nextBDM.name,
        reason: "Round-robin platform lead assignment by current active lead load.",
      };
    } else if (leadType === "SELF") {
      assignedTo = context.user.id;
    } else if (leadType === "MANAGEMENT" && !assignedTo) {
      assignmentDecision = await getIntelligentAssignment(context.businessId, {
        industry:
          typeof body.industry === "string"
            ? body.industry
            : typeof body.companyType === "string"
              ? body.companyType
              : undefined,
        location: typeof body.location === "string" ? body.location : undefined,
        companySize: typeof body.companySize === "string" ? body.companySize : undefined,
      });
      assignedTo = assignmentDecision.bdmId;
    }

    const lead = await prisma.lead.create({
      data: {
        name: body.name,
        phone: typeof body.phone === "string" ? body.phone : undefined,
        email:
          typeof body.email === "string" ? body.email.toLowerCase() : undefined,
        company: typeof body.company === "string" ? body.company : undefined,
        source,
        leadSource: source,
        leadType,
        createdByType:
          typeof body.createdByType === "string"
            ? body.createdByType
            : context.user.role === "OWNER"
              ? "OWNER"
              : "BDM",
        bdmStatus: isBdmLeadStatus(body.bdmStatus) ? body.bdmStatus : "NEW",
        value: typeof body.value === "number" ? body.value : Number(body.value ?? 0) || 0,
        notes: typeof body.notes === "string" ? body.notes : undefined,
        lastContactedAt: leadType === "SELF" ? new Date() : undefined,
        createdBy: context.user.id,
        managementNotes:
          typeof body.managementNotes === "string" ? body.managementNotes : undefined,
        ownerVisible,
        slaDeadline: slaHours
          ? new Date(Date.now() + slaHours * 60 * 60 * 1000)
          : undefined,
        commissionMultiplier,
        agentInterest:
          typeof body.agentInterest === "string" ? body.agentInterest : undefined,
        pipelineId,
        assignedTo,
        followUpDate,
        followUpTime: typeof body.followUpTime === "string" ? body.followUpTime : undefined,
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
        callNotes: {
          orderBy: { createdAt: "desc" },
          include: { author: { select: { id: true, name: true } } },
        },
      },
    });

    const initialNotes =
      typeof body.initialNotes === "string" ? body.initialNotes.trim() : "";

    if (initialNotes || (followUpDate && assignedTo)) {
      await Promise.all([
        initialNotes
          ? prisma.leadNote.create({
              data: {
                leadId: lead.id,
                authorId: context.user.id,
                content: initialNotes,
                noteType: "call",
              },
            })
          : Promise.resolve(null),
        followUpDate && assignedTo
          ? prisma.task.create({
              data: {
                title: `Follow up with ${lead.company ?? lead.name}`,
                description: "Created automatically from the BDM lead follow-up date.",
                priority: "HIGH",
                dueDate: followUpDate,
                assignedTo,
              },
            })
          : Promise.resolve(null),
      ]);
    }

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

      const leadWithNotes = await prisma.lead.findUnique({
        where: { id: lead.id },
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
          callNotes: {
            orderBy: { createdAt: "desc" },
            include: { author: { select: { id: true, name: true } } },
          },
        },
      });

      return NextResponse.json(
        { lead: leadWithNotes, score: null, assignmentDecision },
        { status: 201 },
      );
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
        callNotes: {
          orderBy: { createdAt: "desc" },
          include: { author: { select: { id: true, name: true } } },
        },
      },
    });

    return NextResponse.json({ lead: scoredLead, score, assignmentDecision }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Unable to create lead." },
      { status: 500 },
    );
  }
}
