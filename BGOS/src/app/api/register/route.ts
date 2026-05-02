import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

import { generateClientId } from "@/lib/client-id";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const limited = rateLimit(request, {
    key: "register",
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });
  if (limited) return limited;

  try {
    const { name, email, password } = await request.json();
    const userName = String(name ?? "").trim();

    if (!userName || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 },
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists." },
        { status: 409 },
      );
    }

    const hashedPassword = await hash(String(password), 12);
    const clientId = await generateClientId();
    const user = await prisma.$transaction(async (tx) => {
      const business = await tx.business.create({
        data: {
          clientId,
          name: `${userName}'s Business`,
          type: "Not set",
          teamSize: "Not set",
          goal: "Not set",
          healthScore: 50,
        },
        select: { id: true },
      });

      return tx.user.create({
        data: {
          name: userName,
          email: normalizedEmail,
          password: hashedPassword,
          role: "BOSS",
          businessId: business.id,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          businessId: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Unable to register user." },
      { status: 500 },
    );
  }
}
