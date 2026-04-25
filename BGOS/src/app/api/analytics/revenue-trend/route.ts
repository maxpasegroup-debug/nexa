import { NextResponse } from "next/server";

import { getCurrentBusiness } from "@/lib/dashboard/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const context = await getCurrentBusiness();
    if (context.error) return context.error;

    const now = new Date();
    const weeks = Array.from({ length: 12 }, (_, index) => {
      const start = new Date(now);
      start.setDate(now.getDate() - (11 - index) * 7);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 7);
      return { start, end, label: `Week ${index + 1}` };
    });

    const data = await Promise.all(
      weeks.map(async (week) => {
        const leads = await prisma.lead.findMany({
          where: {
            businessId: context.business.id,
            status: "WON",
            wonAt: { gte: week.start, lt: week.end },
          },
          select: { value: true },
        });

        return {
          weekLabel: week.label,
          wonCount: leads.length,
          totalValue: leads.reduce((sum, lead) => sum + lead.value, 0),
        };
      }),
    );

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch revenue trend." },
      { status: 500 },
    );
  }
}
