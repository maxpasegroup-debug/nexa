import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getUniverseBearerToken, verifyUniverseToken } from "@/lib/universe-auth";

export async function POST(request: Request) {
  try {
    const token = getUniverseBearerToken(request);

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyUniverseToken(token);
    const body = (await request.json()) as { stepNumber?: number };
    const stepNumber = Number(body.stepNumber);

    if (!Number.isInteger(stepNumber) || stepNumber < 1 || stepNumber > 5) {
      return NextResponse.json({ error: "Invalid step" }, { status: 400 });
    }

    await prisma.universeProgress.upsert({
      where: { userId_stepNumber: { userId: payload.userId, stepNumber } },
      update: {},
      create: { userId: payload.userId, stepNumber },
    });

    const progress = await prisma.universeProgress.findMany({
      where: { userId: payload.userId },
      orderBy: { stepNumber: "asc" },
      select: { stepNumber: true, completedAt: true },
    });

    return NextResponse.json({ progress: progress.map((item) => item.stepNumber) });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

