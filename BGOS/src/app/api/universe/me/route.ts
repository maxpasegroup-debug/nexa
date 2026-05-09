import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getUniverseBearerToken, normalizeUniversePhone, verifyUniverseToken } from "@/lib/universe-auth";

export async function GET(request: Request) {
  try {
    const token = getUniverseBearerToken(request);

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyUniverseToken(token);
    const user = await prisma.universeUser.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        phone: true,
        language: true,
        referralCode: true,
        referredBy: true,
        createdAt: true,
        progress: {
          orderBy: { stepNumber: "asc" },
          select: { stepNumber: true, completedAt: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ user, progress: user.progress.map((item) => item.stepNumber) });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { phone?: string };
    const phone = normalizeUniversePhone(body.phone ?? "");

    if (!phone || !/^\+?\d{10,15}$/.test(phone)) {
      return NextResponse.json({ exists: false }, { status: 200 });
    }

    const user = await prisma.universeUser.findUnique({
      where: { phone },
      select: { id: true, name: true, phone: true },
    });

    return NextResponse.json({ exists: Boolean(user), user });
  } catch {
    return NextResponse.json({ exists: false }, { status: 200 });
  }
}

