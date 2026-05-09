import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { normalizeUniversePhone, signUniverseToken } from "@/lib/universe-auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { phone?: string; pin?: string };
    const phone = normalizeUniversePhone(body.phone ?? "");
    const pin = body.pin?.trim();

    if (!phone || !pin || !/^\d{4}$/.test(pin)) {
      return NextResponse.json({ error: "Invalid phone or PIN" }, { status: 400 });
    }

    const user = await prisma.universeUser.findUnique({ where: { phone } });

    if (!user || !(await bcrypt.compare(pin, user.pinHash))) {
      return NextResponse.json({ error: "Invalid phone or PIN" }, { status: 401 });
    }

    const token = signUniverseToken({ userId: user.id, phone: user.phone });

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        language: user.language,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Universe login failed", error);
    return NextResponse.json({ error: "Unable to login" }, { status: 500 });
  }
}

