import { hash } from "bcryptjs";
import type { Role } from "@prisma/client";
import { NextResponse } from "next/server";

import { requireRole } from "@/lib/api-auth";
import { sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

function isInviteRole(value: unknown): value is "BDM" | "SDE" {
  return value === "BDM" || value === "SDE";
}

function dashboardPathForRole(role: Role) {
  if (role === "SDE") {
    return "/sde";
  }

  if (role === "BDM") {
    return "/bdm";
  }

  return "/boss";
}

async function acceptInvite(body: {
  token?: unknown;
  name?: unknown;
  password?: unknown;
}) {
  const token = typeof body.token === "string" ? body.token : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!token || !name || !password) {
    return NextResponse.json(
      { error: "Token, name, and password are required." },
      { status: 400 },
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 },
    );
  }

  const invite = await prisma.teamInvite.findUnique({
    where: { token },
    include: { business: true },
  });

  if (!invite || invite.accepted) {
    return NextResponse.json(
      { error: "Invalid or expired invite." },
      { status: 404 },
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: invite.email },
  });

  if (existingUser) {
    return NextResponse.json(
      { error: "A user with this email already exists." },
      { status: 409 },
    );
  }

  const hashedPassword = await hash(password, 12);
  const user = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        name,
        email: invite.email,
        password: hashedPassword,
        role: invite.role,
        businessId: invite.businessId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        businessId: true,
      },
    });

    await tx.teamInvite.update({
      where: { id: invite.id },
      data: { accepted: true },
    });

    return createdUser;
  });

  return NextResponse.json({
    success: true,
    user,
    redirectTo: dashboardPathForRole(user.role),
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token is required." }, { status: 400 });
  }

  const invite = await prisma.teamInvite.findUnique({
    where: { token },
    include: {
      business: {
        include: {
          users: {
            where: { role: "BOSS" },
            select: { name: true },
            take: 1,
          },
        },
      },
    },
  });

  if (!invite) {
    return NextResponse.json({ error: "Invite not found." }, { status: 404 });
  }

  return NextResponse.json({
    invite: {
      name: invite.name,
      email: invite.email,
      role: invite.role,
      accepted: invite.accepted,
      businessName: invite.business.name,
      invitedBy: invite.business.users[0]?.name ?? invite.business.name,
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body?.token) {
      return acceptInvite(body);
    }

    const authResult = await requireRole(["BOSS", "OWNER"]);
    if (authResult.response) {
      return authResult.response;
    }

    const boss = await prisma.user.findUnique({
      where: { id: authResult.user.id },
    });

    if (!boss?.businessId) {
      return NextResponse.json(
        { error: "Business not found for this user." },
        { status: 400 },
      );
    }

    const { name, email, role } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required." },
        { status: 400 },
      );
    }

    const invite = await prisma.teamInvite.create({
      data: {
        name: String(name),
        email: String(email).toLowerCase(),
        role: isInviteRole(role) ? role : "BDM",
        businessId: boss.businessId,
      },
    });
    const acceptLink = `${process.env.NEXT_PUBLIC_APP_URL}/accept-invite?token=${invite.token}`;

    const emailSent = await sendEmail({
      to: invite.email,
      toName: invite.name,
      subject: "You have been added to BGOS",
      html: `<p>Hi ${invite.name},</p><p>${boss.name} has invited you to join their BGOS business HQ.</p><p><a href="${acceptLink}">Accept your invite</a></p>`,
    });

    return NextResponse.json({ success: true, emailSent });
  } catch {
    return NextResponse.json(
      { error: "Unable to process team invitation." },
      { status: 500 },
    );
  }
}
