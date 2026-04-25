import { NextResponse } from "next/server";

import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const boss = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        businessId: true,
        role: true,
      },
    });

    if (!boss?.businessId || boss.role !== "BOSS") {
      return NextResponse.json(
        { error: "Only a boss can view this team." },
        { status: 403 },
      );
    }

    const users = await prisma.user.findMany({
      where: { businessId: boss.businessId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ users });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch team members." },
      { status: 500 },
    );
  }
}
