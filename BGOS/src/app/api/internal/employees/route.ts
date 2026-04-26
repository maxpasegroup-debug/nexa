import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import cuid from "cuid";

import auth from "@/lib/auth";
import { sendEmail } from "@/lib/mail";
import { prisma } from "@/lib/prisma";

const DEFAULT_PASSWORD = "123456789";

function latestDate(...values: Array<Date | null | undefined>) {
  const timestamps = values
    .filter((value): value is Date => Boolean(value))
    .map((value) => value.getTime());

  if (timestamps.length === 0) return null;
  return new Date(Math.max(...timestamps));
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function getOwnerAndBusiness() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const owner = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      role: true,
      businessId: true,
      business: { select: { id: true, name: true } },
    },
  });

  if (owner?.email !== "boss@bgos.online" || owner.role !== "OWNER") {
    return null;
  }

  const business =
    owner.business ??
    (await prisma.business.findFirst({
      where: { name: "BGOS" },
      select: { id: true, name: true },
    }));

  if (!business) return null;
  return { owner, business };
}

function welcomeEmailHtml(name: string, email: string) {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);

  return `
    <div style="margin:0;background:#070709;padding:32px;font-family:Arial,sans-serif;color:#F7F7FB;">
      <div style="max-width:560px;margin:0 auto;background:#13131c;border:1px solid rgba(255,255,255,0.10);border-radius:16px;padding:28px;">
        <div style="font-size:24px;font-weight:800;letter-spacing:0;">
          <span style="color:#fff;">BG</span><span style="color:#7C6FFF;">OS</span>
        </div>
        <h1 style="margin:28px 0 10px;font-family:Syne,Arial,sans-serif;font-size:26px;line-height:1.2;">Welcome to the team, ${safeName}!</h1>
        <p style="margin:0 0 20px;color:#B9B6C8;font-size:14px;line-height:1.7;">Your BGOS employee account has been created. Here are your login details:</p>
        <div style="background:#0e0e13;border:1px solid rgba(255,255,255,0.10);border-radius:14px;padding:18px;margin:20px 0;">
          <p style="margin:0 0 8px;color:#B9B6C8;font-size:14px;"><strong style="color:#fff;">Portal:</strong> iceconnect.in</p>
          <p style="margin:0 0 8px;color:#B9B6C8;font-size:14px;"><strong style="color:#fff;">Email:</strong> ${safeEmail}</p>
          <p style="margin:0;color:#B9B6C8;font-size:14px;"><strong style="color:#fff;">Password:</strong> <code style="color:#22D9A0;">${DEFAULT_PASSWORD}</code></p>
        </div>
        <p style="margin:0 0 24px;color:#F5A623;font-size:14px;font-weight:700;">Please change your password immediately after your first login.</p>
        <a href="https://iceconnect.in/login" style="display:inline-block;background:#7C6FFF;color:#fff;text-decoration:none;border-radius:12px;padding:13px 18px;font-weight:800;">Login to your dashboard →</a>
        <p style="margin:28px 0 0;color:#6B6878;font-size:12px;line-height:1.6;">This email was sent by BGOS management. If you did not expect this, please contact hello@iceconnect.in</p>
      </div>
    </div>
  `;
}

export async function GET() {
  const context = await getOwnerAndBusiness();
  if (!context) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const employees = await prisma.user.findMany({
    where: { businessId: context.business.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      defaultPassword: true,
      activityLogs: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      },
      leadActivities: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      },
      callLogs: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      },
      tasks: {
        orderBy: { updatedAt: "desc" },
        take: 1,
        select: { updatedAt: true },
      },
    },
  });

  return NextResponse.json({
    employees: employees.map((employee) => {
      const lastLoginAt = latestDate(
        employee.activityLogs[0]?.createdAt,
        employee.leadActivities[0]?.createdAt,
        employee.callLogs[0]?.createdAt,
        employee.tasks[0]?.updatedAt,
        employee.updatedAt,
      );

      return {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        createdAt: employee.createdAt.toISOString(),
        defaultPassword: employee.defaultPassword,
        lastLoginAt: lastLoginAt?.toISOString() ?? null,
      };
    }),
  });
}

export async function POST(request: Request) {
  const context = await getOwnerAndBusiness();
  if (!context) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as {
    name?: string;
    email?: string;
    role?: string;
  };
  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const role = body.role;

  if (!name || !email || (role !== "BDM" && role !== "SDE")) {
    return NextResponse.json({ error: "Invalid employee details." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already exists." }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 12);
  const employee = await prisma.user.create({
    data: {
      name,
      email,
      role,
      password: hashedPassword,
      defaultPassword: true,
      businessId: context.business.id,
      employeeCode: cuid(),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      defaultPassword: true,
    },
  });

  await Promise.all([
    sendEmail(
      employee.email,
      "Welcome to BGOS — Your account is ready",
      welcomeEmailHtml(employee.name, employee.email),
    ),
    prisma.activityLog.create({
      data: {
        businessId: context.business.id,
        userId: context.owner.id,
        action: "Employee account created",
        entity: "User",
        entityId: employee.id,
        meta: { email: employee.email, role: employee.role },
      },
    }),
  ]);

  return NextResponse.json({
    user: {
      ...employee,
      createdAt: employee.createdAt.toISOString(),
      lastLoginAt: employee.createdAt.toISOString(),
    },
  });
}
