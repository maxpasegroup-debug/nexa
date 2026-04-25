import { NextRequest, NextResponse } from "next/server";

import { getCurrentBusiness } from "@/lib/dashboard/server";
import { prisma } from "@/lib/prisma";

function priorityForInsight(type: string) {
  if (type === "warning") return "high";
  if (type === "opportunity") return "medium";
  return "medium";
}

export async function GET() {
  try {
    const context = await getCurrentBusiness();

    if (context.error) return context.error;

    const [insights, actions, memory] = await Promise.all([
      prisma.nexaInsight.findMany({
        where: { businessId: context.business.id },
        orderBy: { createdAt: "desc" },
      }),
      prisma.nexaAction.findMany({
        where: { businessId: context.business.id },
        orderBy: { createdAt: "desc" },
      }),
      prisma.nexaMemory.findMany({
        where: { businessId: context.business.id },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      insights: insights.map((insight) => ({
        ...insight,
        priority: priorityForInsight(insight.type),
      })),
      actions,
      memory,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch NEXA log." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const context = await getCurrentBusiness();

    if (context.error) return context.error;

    const body = (await request.json()) as { insightId?: string; all?: boolean };

    if (body.all) {
      await prisma.nexaInsight.updateMany({
        where: { businessId: context.business.id, read: false },
        data: { read: true },
      });
      return NextResponse.json({ success: true });
    }

    if (!body.insightId) {
      return NextResponse.json(
        { error: "insightId is required." },
        { status: 400 },
      );
    }

    await prisma.nexaInsight.updateMany({
      where: { id: body.insightId, businessId: context.business.id },
      data: { read: true },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Unable to update NEXA insight." },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    const context = await getCurrentBusiness();

    if (context.error) return context.error;

    const result = await prisma.nexaMemory.deleteMany({
      where: {
        businessId: context.business.id,
        expiresAt: { lt: new Date() },
      },
    });

    return NextResponse.json({ deleted: result.count });
  } catch {
    return NextResponse.json(
      { error: "Unable to clear expired NEXA memory." },
      { status: 500 },
    );
  }
}
