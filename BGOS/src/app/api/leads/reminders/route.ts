import { NextResponse } from "next/server";

import { getCrmContext } from "@/lib/leads/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const context = await getCrmContext();

    if (context.error) return context.error;

    const now = new Date();
    const next48Hours = new Date(now);
    next48Hours.setHours(now.getHours() + 48);

    const reminders = await prisma.reminder.findMany({
      where: {
        sent: false,
        dueAt: {
          gte: now,
          lte: next48Hours,
        },
        lead: {
          businessId: context.businessId,
        },
      },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: { dueAt: "asc" },
    });

    return NextResponse.json({ reminders });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch reminders." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const context = await getCrmContext();

    if (context.error) return context.error;

    const { leadId, userId, message, dueAt } = await request.json();

    if (
      typeof leadId !== "string" ||
      typeof userId !== "string" ||
      typeof message !== "string" ||
      typeof dueAt !== "string"
    ) {
      return NextResponse.json(
        { error: "leadId, userId, message, and dueAt are required." },
        { status: 400 },
      );
    }

    const lead = await prisma.lead.findFirst({
      where: {
        id: leadId,
        businessId: context.businessId,
      },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    }

    const reminder = await prisma.reminder.create({
      data: {
        leadId,
        userId,
        message,
        dueAt: new Date(dueAt),
      },
    });

    return NextResponse.json({ reminder }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Unable to create reminder." },
      { status: 500 },
    );
  }
}
