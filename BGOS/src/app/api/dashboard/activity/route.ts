import { NextResponse } from "next/server";

import { getCurrentBusiness } from "@/lib/dashboard/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const context = await getCurrentBusiness();

    if (context.error) {
      return context.error;
    }

    const activity = await prisma.activityLog.findMany({
      where: { businessId: context.business.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        user: {
          select: {
            name: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({ activity });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch dashboard activity." },
      { status: 500 },
    );
  }
}
