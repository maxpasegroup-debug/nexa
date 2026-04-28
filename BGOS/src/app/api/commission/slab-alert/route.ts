import { NextResponse } from "next/server";

import { getCommissionContext } from "@/lib/commission-context";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const context = await getCommissionContext();
    if (context.error) return context.error;

    const achievement = await prisma.slabAchievement.findFirst({
      where: {
        userId: context.user.id,
        notified: false,
      },
      orderBy: { achievedAt: "desc" },
    });

    if (!achievement) {
      return NextResponse.json({ achievement: null });
    }

    await prisma.slabAchievement.update({
      where: { id: achievement.id },
      data: { notified: true },
    });

    return NextResponse.json({
      achievement: { ...achievement, notified: true },
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch slab alert." },
      { status: 500 },
    );
  }
}
