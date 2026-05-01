import { NextResponse } from "next/server";

import { getBdmContext, monthBounds } from "@/lib/bdm/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const context = await getBdmContext();

    if (context.error) return context.error;

    const month = monthBounds();
    const target = await prisma.target.findUnique({
      where: {
        userId_month_year: {
          userId: context.user.id,
          month: month.month,
          year: month.year,
        },
      },
    });

    return NextResponse.json({
      target: target ?? {
        userId: context.user.id,
        month: month.month,
        year: month.year,
        leadsTarget: 0,
        wonTarget: 0,
        revenueTarget: 0,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch target." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const context = await getBdmContext(["BOSS", "OWNER"]);

    if (context.error) return context.error;

    const { userId, leadsTarget, wonTarget, revenueTarget } = await request.json();

    if (typeof userId !== "string") {
      return NextResponse.json({ error: "userId is required." }, { status: 400 });
    }

    const targetUser = await prisma.user.findFirst({
      where: {
        id: userId,
        businessId: context.businessId,
        role: "BDM",
      },
      select: { id: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "BDM not found in this business." },
        { status: 404 },
      );
    }

    const month = monthBounds();
    const target = await prisma.target.upsert({
      where: {
        userId_month_year: {
          userId,
          month: month.month,
          year: month.year,
        },
      },
      update: {
        leadsTarget: Number(leadsTarget ?? 0),
        wonTarget: Number(wonTarget ?? 0),
        revenueTarget: Number(revenueTarget ?? 0),
      },
      create: {
        userId,
        month: month.month,
        year: month.year,
        leadsTarget: Number(leadsTarget ?? 0),
        wonTarget: Number(wonTarget ?? 0),
        revenueTarget: Number(revenueTarget ?? 0),
      },
    });

    return NextResponse.json({ target });
  } catch {
    return NextResponse.json(
      { error: "Unable to save target." },
      { status: 500 },
    );
  }
}
