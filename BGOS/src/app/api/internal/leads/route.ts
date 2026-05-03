import { NextResponse } from "next/server";
import type { BDMLeadStatus } from "@prisma/client";

import { requireInternalOwnerApi } from "@/lib/internal-owner";
import { prisma } from "@/lib/prisma";

function str(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

const bdmStatuses = ["NEW", "CONTACTED", "FOLLOW_UP", "ONBOARDING", "LOST"];

export async function GET(request: Request) {
  const context = await requireInternalOwnerApi();
  if ("error" in context) return context.error;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim();
  const status = searchParams.get("status")?.trim();

  const [leads, team] = await Promise.all([
    prisma.lead.findMany({
      where: {
        businessId: context.business.id,
        ...(status && bdmStatuses.includes(status) ? { bdmStatus: status as BDMLeadStatus } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { company: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { phone: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        assignee: { select: { id: true, name: true, email: true, role: true } },
        creator: { select: { id: true, name: true, email: true, role: true } },
        onboardingSession: { select: { id: true, status: true, completenessScore: true, sdeId: true } },
        callNotes: {
          orderBy: { createdAt: "desc" },
          take: 2,
          include: { author: { select: { name: true } } },
        },
      },
      orderBy: [{ updatedAt: "desc" }],
    }),
    prisma.user.findMany({
      where: { businessId: context.business.id, role: { in: ["BDM", "SDE"] }, active: true },
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return NextResponse.json({
    leads: leads.map((lead) => ({
      ...lead,
      createdAt: lead.createdAt.toISOString(),
      updatedAt: lead.updatedAt.toISOString(),
      followUpDate: lead.followUpDate?.toISOString() ?? null,
      lastContactedAt: lead.lastContactedAt?.toISOString() ?? null,
      callNotes: lead.callNotes.map((note) => ({
        id: note.id,
        content: note.content,
        createdAt: note.createdAt.toISOString(),
        author: note.author,
      })),
    })),
    team,
  });
}

export async function POST(request: Request) {
  const context = await requireInternalOwnerApi();
  if ("error" in context) return context.error;

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const assignedTo = str(body.assignedTo) || null;

  if (!str(body.name)) {
    return NextResponse.json({ error: "Lead name is required." }, { status: 400 });
  }

  const lead = await prisma.lead.create({
    data: {
      businessId: context.business.id,
      name: str(body.name),
      company: str(body.company) || null,
      phone: str(body.phone) || null,
      email: str(body.email)?.toLowerCase() || null,
      notes: str(body.notes) || null,
      value: Number(body.value) || 0,
      assignedTo,
      createdBy: context.owner.id,
      createdByType: "BOSS",
      leadType: "MANAGEMENT",
      source: "MANUAL",
      leadSource: "MANAGEMENT_REFERRAL",
      ownerVisible: true,
      managementNotes: str(body.managementNotes) || "Created by Boss from internal hybrid leads.",
    },
  });

  await prisma.leadActivity.create({
    data: {
      leadId: lead.id,
      userId: context.owner.id,
      type: "BOSS_CREATED",
      note: "Boss created lead from internal hybrid leads.",
    },
  });

  return NextResponse.json({ lead });
}
