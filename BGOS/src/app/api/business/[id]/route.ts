import { NextResponse } from "next/server";

import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { businessId: true, role: true },
    });

    if (!user?.businessId || user.businessId !== params.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (user.role !== "BOSS" && user.role !== "OWNER") {
      return NextResponse.json({ error: "Only a boss can update business settings." }, { status: 403 });
    }

    const body = (await request.json()) as {
      name?: unknown;
      type?: unknown;
      teamSize?: unknown;
      goal?: unknown;
    };

    const business = await prisma.business.update({
      where: { id: params.id },
      data: {
        ...(typeof body.name === "string" && body.name.trim()
          ? { name: body.name.trim() }
          : {}),
        ...(typeof body.type === "string" ? { type: body.type.trim() } : {}),
        ...(typeof body.teamSize === "string" ? { teamSize: body.teamSize.trim() } : {}),
        ...(typeof body.goal === "string" ? { goal: body.goal.trim() } : {}),
      },
    });

    return NextResponse.json({ business });
  } catch {
    return NextResponse.json(
      { error: "Unable to update business." },
      { status: 500 },
    );
  }
}
