import type { CallOutcome } from "@prisma/client";
import { NextResponse } from "next/server";

import { getBdmContext } from "@/lib/bdm/server";
import { prisma } from "@/lib/prisma";

const outcomes: CallOutcome[] = [
  "ANSWERED_INTERESTED",
  "ANSWERED_NOT_INTERESTED",
  "ANSWERED_CALLBACK",
  "NO_ANSWER",
  "BUSY",
  "WRONG_NUMBER",
];

function isOutcome(value: unknown): value is CallOutcome {
  return typeof value === "string" && outcomes.includes(value as CallOutcome);
}

export async function GET(request: Request) {
  try {
    const context = await getBdmContext();

    if (context.error) return context.error;

    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get("leadId");

    const calls = await prisma.callLog.findMany({
      where: {
        userId: context.user.id,
        ...(leadId ? { leadId } : {}),
      },
      include: { lead: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ calls });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch call logs." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const context = await getBdmContext();

    if (context.error) return context.error;

    const { leadId, outcome, duration, notes, nextAction } = await request.json();

    if (typeof leadId !== "string" || !isOutcome(outcome)) {
      return NextResponse.json(
        { error: "leadId and valid outcome are required." },
        { status: 400 },
      );
    }

    const lead = await prisma.lead.findFirst({
      where: { id: leadId, assignedTo: context.user.id },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const callLog = await prisma.$transaction(async (tx) => {
      const createdCall = await tx.callLog.create({
        data: {
          userId: context.user.id,
          leadId,
          outcome,
          duration: typeof duration === "number" ? duration : undefined,
          notes: typeof notes === "string" ? notes : undefined,
          nextAction: typeof nextAction === "string" ? nextAction : undefined,
        },
      });

      await tx.lead.update({
        where: { id: leadId },
        data: { lastContactAt: new Date() },
      });

      await tx.leadActivity.create({
        data: {
          leadId,
          userId: context.user.id,
          type: "call",
          note: `Call outcome: ${outcome}${notes ? ` — ${notes}` : ""}`,
        },
      });

      if (outcome === "ANSWERED_CALLBACK" && typeof nextAction === "string") {
        await tx.reminder.create({
          data: {
            leadId,
            userId: context.user.id,
            message: nextAction,
            dueAt: tomorrow,
          },
        });
      }

      return createdCall;
    });

    return NextResponse.json({ callLog }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Unable to create call log." },
      { status: 500 },
    );
  }
}
