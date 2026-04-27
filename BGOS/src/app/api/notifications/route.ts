import { NextResponse } from "next/server";

import { getCurrentBusiness } from "@/lib/dashboard/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const context = await getCurrentBusiness();
    if (context.error) return context.error;

    const [count, insights] = await Promise.all([
      prisma.nexaInsight.count({
        where: { businessId: context.business.id, read: false },
      }),
      prisma.nexaInsight.findMany({
        where: { businessId: context.business.id, read: false },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          type: true,
          message: true,
          action: true,
          createdAt: true,
        },
      }),
    ]);

    return NextResponse.json({ count, insights });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch notifications." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const context = await getCurrentBusiness();
    if (context.error) return context.error;

    const body = (await request.json()) as { id?: unknown };
    if (typeof body.id !== "string") {
      return NextResponse.json({ error: "Notification id is required." }, { status: 400 });
    }

    await prisma.nexaInsight.updateMany({
      where: { id: body.id, businessId: context.business.id },
      data: { read: true },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Unable to update notification." },
      { status: 500 },
    );
  }
}
