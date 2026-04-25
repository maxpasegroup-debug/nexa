import { NextResponse } from "next/server";

import { getCurrentBusiness } from "@/lib/dashboard/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const context = await getCurrentBusiness();

    if (context.error) return context.error;

    const [messages, actions] = await Promise.all([
      prisma.nexaMessage.findMany({
        where: { businessId: context.business.id },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      prisma.nexaAction.findMany({
        where: { businessId: context.business.id },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    return NextResponse.json({
      messages: messages.reverse(),
      actions,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch NEXA history." },
      { status: 500 },
    );
  }
}
