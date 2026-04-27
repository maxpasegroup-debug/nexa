import { NextResponse } from "next/server";

import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      business: {
        select: {
          id: true,
          name: true,
          type: true,
          teamSize: true,
          goal: true,
          healthScore: true,
        },
      },
    },
  });

  if (!user?.business) {
    return NextResponse.json({ error: "Company not found." }, { status: 404 });
  }

  return NextResponse.json({
    company: {
      ...user.business,
      plan: "Active workspace",
      domain: user.email.split("@")[1] ?? null,
      notifications: {
        email: true,
        dailyBrief: true,
      },
    },
  });
}

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { name?: unknown };

  if (typeof body.name !== "string" || body.name.trim().length === 0) {
    return NextResponse.json(
      { error: "Company name is required." },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { businessId: true },
  });

  if (!user?.businessId) {
    return NextResponse.json({ error: "Company not found." }, { status: 404 });
  }

  const company = await prisma.business.update({
    where: { id: user.businessId },
    data: { name: body.name.trim() },
  });

  return NextResponse.json({ company });
}
