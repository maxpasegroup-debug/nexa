import { NextResponse } from "next/server";

import { notifyDev } from "@/lib/notify-dev";
import { prisma } from "@/lib/prisma";
import {
  getSdeContext,
  isEscalationStatus,
  isEscalationType,
  isPriority,
  priorityOrder,
} from "@/lib/sde/server";

export async function GET(request: Request) {
  try {
    const context = await getSdeContext();

    if (context.error) return context.error;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const escalations = await prisma.escalation.findMany({
      where: {
        businessId: context.businessId,
        ...(isEscalationStatus(status) ? { status } : {}),
      },
      include: {
        raiser: { select: { id: true, name: true, role: true } },
        resolver: { select: { id: true, name: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      escalations: escalations.sort(
        (a, b) =>
          priorityOrder(b.priority) - priorityOrder(a.priority) ||
          b.createdAt.getTime() - a.createdAt.getTime(),
      ),
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch escalations." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const context = await getSdeContext();

    if (context.error) return context.error;

    const { type, title, description, priority } = await request.json();

    if (typeof title !== "string" || typeof description !== "string") {
      return NextResponse.json(
        { error: "title and description are required." },
        { status: 400 },
      );
    }

    const escalation = await prisma.escalation.create({
      data: {
        businessId: context.businessId,
        type: isEscalationType(type) ? type : "OTHER",
        title,
        description,
        priority: isPriority(priority) ? priority : "MEDIUM",
        raisedBy: context.user.id,
        notifiedDev: Boolean(process.env.DEV_EMAIL),
      },
      include: {
        raiser: { select: { id: true, name: true, role: true } },
        resolver: { select: { id: true, name: true, role: true } },
      },
    });

    await notifyDev(
        `New BGOS Escalation: ${title}`,
        `Type: ${escalation.type}\nPriority: ${escalation.priority}\n\n${description}`,
        escalation.priority === "URGENT"
          ? "urgent"
          : escalation.priority === "HIGH"
            ? "high"
            : "normal",
      );

    return NextResponse.json({ escalation }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Unable to create escalation." },
      { status: 500 },
    );
  }
}
