import { NextResponse } from "next/server";
import { bdmLeadStatuses, isBdmLeadStatus } from "@/lib/bdm-lead-status";
import { requireInternalOwnerApi } from "@/lib/internal-owner";
import { prisma } from "@/lib/prisma";

function str(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function startOfDay(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function monthRange(value: string) {
  const [year, month] = value.split("-").map(Number);
  if (!year || !month) return null;
  const start = new Date(year, month - 1, 1);
  return { gte: start, lt: new Date(year, month, 1) };
}

function weekRange(value: string) {
  const match = /^(\d{4})-W(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const week = Number(match[2]);
  if (!year || !week) return null;
  const fourthJan = new Date(year, 0, 4);
  const day = fourthJan.getDay() || 7;
  const firstMonday = addDays(fourthJan, 1 - day);
  const start = addDays(firstMonday, (week - 1) * 7);
  return { gte: start, lt: addDays(start, 7) };
}

function locationFilter(value: string) {
  return value
    ? {
        OR: [
          { notes: { contains: value, mode: "insensitive" as const } },
          { managementNotes: { contains: value, mode: "insensitive" as const } },
          { callNotes: { some: { content: { contains: value, mode: "insensitive" as const } } } },
        ],
      }
    : null;
}

export async function GET(request: Request) {
  const context = await requireInternalOwnerApi();
  if ("error" in context) return context.error;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim();
  const status = searchParams.get("status")?.trim();
  const date = searchParams.get("date")?.trim();
  const week = searchParams.get("week")?.trim();
  const month = searchParams.get("month")?.trim();
  const country = searchParams.get("country")?.trim() ?? "";
  const state = searchParams.get("state")?.trim() ?? "";
  const district = searchParams.get("district")?.trim() ?? "";

  const createdAt =
    date && startOfDay(date)
      ? { gte: startOfDay(date)!, lt: addDays(startOfDay(date)!, 1) }
      : week && weekRange(week)
        ? weekRange(week)!
        : month && monthRange(month)
          ? monthRange(month)!
          : undefined;

  const locationFilters = [locationFilter(country), locationFilter(state), locationFilter(district)].filter(
    (filter): filter is NonNullable<ReturnType<typeof locationFilter>> => Boolean(filter),
  );

  const [leads, team] = await Promise.all([
    prisma.lead.findMany({
      where: {
        businessId: context.business.id,
        ...(createdAt ? { createdAt } : {}),
        ...(isBdmLeadStatus(status) ? { bdmStatus: status } : {}),
        ...(locationFilters.length ? { AND: locationFilters } : {}),
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
      orderBy: [{ createdAt: "desc" }],
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
    statuses: bdmLeadStatuses,
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
