import { NextResponse } from "next/server";

import auth from "@/lib/auth";
import { notifySlabAchievement } from "@/lib/commission-notify";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    const hasInternalSecret =
      Boolean(cronSecret) && authHeader === `Bearer ${cronSecret}`;
    const body = (await request.json()) as { userId?: unknown };

    if (typeof body.userId !== "string") {
      return NextResponse.json({ error: "userId is required." }, { status: 400 });
    }

    if (!hasInternalSecret) {
      const session = await auth();
      if (!session?.user?.id || !session.user.businessId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const target = await prisma.user.findUnique({
        where: { id: body.userId },
        select: { businessId: true },
      });

      if (target?.businessId !== session.user.businessId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const achievement = await notifySlabAchievement(body.userId);
    return NextResponse.json({ achievement });
  } catch {
    return NextResponse.json(
      { error: "Unable to process slab notification." },
      { status: 500 },
    );
  }
}
