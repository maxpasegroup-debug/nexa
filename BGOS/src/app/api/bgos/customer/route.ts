import { NextResponse } from "next/server";

import auth from "@/lib/auth";
import { customerListStatuses } from "@/lib/business-status";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const customers = await prisma.business.findMany({
    where: { status: { in: customerListStatuses } },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      name: true,
      type: true,
      teamSize: true,
      healthScore: true,
      createdAt: true,
      _count: {
        select: {
          users: true,
          leads: true,
          activityLogs: true,
        },
      },
    },
  });

  return NextResponse.json({ customers });
}
