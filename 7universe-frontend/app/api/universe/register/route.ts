import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import {
  assertUniverseJwtSecret,
  createReferralCode,
  normalizeUniversePhone,
  signUniverseToken,
} from "@/lib/universe-auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      phone?: string;
      pin?: string;
      language?: string;
      referredBy?: string;
    };
    const name = body.name?.trim();
    const phone = normalizeUniversePhone(body.phone ?? "");
    const pin = body.pin?.trim();

    if (!name || !phone || !/^\+?\d{10,15}$/.test(phone) || !pin || !/^\d{4}$/.test(pin)) {
      return NextResponse.json({ error: "Invalid registration details" }, { status: 400 });
    }

    assertUniverseJwtSecret();

    const existing = await prisma.universeUser.findUnique({ where: { phone } });

    if (existing) {
      return NextResponse.json({ error: "Phone already registered" }, { status: 409 });
    }

    let referralCode = createReferralCode();

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const duplicate = await prisma.universeUser.findUnique({ where: { referralCode } });

      if (!duplicate) {
        break;
      }

      referralCode = createReferralCode();
    }

    const user = await prisma.universeUser.create({
      data: {
        name,
        phone,
        pinHash: await bcrypt.hash(pin, 10),
        language: body.language ?? "ml",
        referralCode,
        referredBy: body.referredBy?.trim() || null,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        language: true,
        referralCode: true,
        referredBy: true,
        createdAt: true,
      },
    });
    const token = signUniverseToken({ userId: user.id, phone: user.phone });

    return NextResponse.json({ token, user });
  } catch (error) {
    console.error("Universe register failed", error);

    if (error instanceof Error && error.message === "UNIVERSE_JWT_SECRET is not configured") {
      return NextResponse.json({ error: "Registration is not configured yet" }, { status: 500 });
    }

    return NextResponse.json({ error: "Unable to register" }, { status: 500 });
  }
}
