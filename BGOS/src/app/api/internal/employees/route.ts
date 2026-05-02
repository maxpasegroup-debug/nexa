import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import cuid from "cuid";

import { sendWelcomeEmail } from "@/lib/email";
import { employeeStats, serializeEmployee } from "@/lib/internal-control";
import { requireInternalOwnerApi } from "@/lib/internal-owner";
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

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
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

void welcomeEmailHtml;

export async function GET(request: Request) {
  const context = await requireInternalOwnerApi();
  if ("error" in context) return context.error;
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email")?.trim().toLowerCase();

  if (email) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });
    return NextResponse.json({ exists: Boolean(user), user });
  }

  const employees = await prisma.user.findMany({
    where: {
      businessId: context.business.id,
      role: { in: ["BDM", "SDE"] },
    },
    orderBy: { createdAt: "desc" },
    select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        active: true,
        status: true,
        createdAt: true,
        joinedAt: true,
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
    employees: await Promise.all(employees.map(async (employee) => {
      const lastLoginAt = latestDate(
        employee.activityLogs[0]?.createdAt,
        employee.leadActivities[0]?.createdAt,
        employee.callLogs[0]?.createdAt,
        employee.tasks[0]?.updatedAt,
        employee.updatedAt,
      );

      const serialized = serializeEmployee(employee, await employeeStats(employee.id));
      return {
        ...serialized,
        lastLoginAt: lastLoginAt?.toISOString() ?? serialized.lastLoginAt,
      };
    })),
  });
}

export async function POST(request: Request) {
  try {
    console.log("[ADD-EMP] Starting...");

    let context: Awaited<ReturnType<typeof requireInternalOwnerApi>>;
    try {
      context = await requireInternalOwnerApi();
    } catch (authError) {
      console.error("[ADD-EMP] Auth lookup failed:", authError);
      return NextResponse.json(
        { error: `Failed to verify owner: ${errorMessage(authError)}` },
        { status: 500 },
      );
    }

    if ("error" in context) {
      console.warn("[ADD-EMP] Forbidden: owner context missing");
      return context.error;
    }
    console.log("[ADD-EMP] Auth:", context.owner.id);

    let body: { name?: string; email?: string; role?: string };
    try {
      body = (await request.json()) as {
        name?: string;
        email?: string;
        role?: string;
      };
      console.log("[ADD-EMP] Body:", JSON.stringify(body));
    } catch (bodyError) {
      console.error("[ADD-EMP] Body parse failed:", bodyError);
      return NextResponse.json(
        { error: `Invalid JSON body: ${errorMessage(bodyError)}` },
        { status: 400 },
      );
    }

    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const role = body.role;

    if (!name || !email || (role !== "BDM" && role !== "SDE")) {
      console.warn("[ADD-EMP] Invalid employee details:", { name, email, role });
      return NextResponse.json(
        { error: "Invalid employee details." },
        { status: 400 },
      );
    }

    try {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        console.warn("[ADD-EMP] Email already exists:", email);
        return NextResponse.json(
          { error: "Email already exists." },
          { status: 400 },
        );
      }
    } catch (existingError) {
      console.error("[ADD-EMP] Existing-user check failed:", existingError);
      return NextResponse.json(
        {
          error: `Failed to check existing employee: ${errorMessage(
            existingError,
          )}`,
        },
        { status: 500 },
      );
    }

    let employee: {
      id: string;
      name: string;
      email: string;
      role: string;
      createdAt: Date;
      defaultPassword: boolean;
    };

    try {
      const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 12);
      employee = await prisma.user.create({
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
      console.log("[ADD-EMP] User created:", employee.id);
    } catch (userError) {
      console.error("[ADD-EMP] User creation failed:", userError);
      return NextResponse.json(
        { error: `Failed to create user: ${errorMessage(userError)}` },
        { status: 500 },
      );
    }

    try {
      await prisma.activityLog.create({
        data: {
          businessId: context.business.id,
          userId: context.owner.id,
          action: "Employee account created",
          entity: "User",
          entityId: employee.id,
          meta: { email: employee.email, role: employee.role },
        },
      });
      console.log("[ADD-EMP] Membership/activity created");
    } catch (membershipError) {
      console.error("[ADD-EMP] Membership failed:", membershipError);
      return NextResponse.json(
        {
          error: `Failed to create membership: ${errorMessage(
            membershipError,
          )}`,
        },
        { status: 500 },
      );
    }

    let emailSent = false;
    try {
      emailSent = await sendWelcomeEmail({
        name: employee.name,
        email: employee.email,
        role: employee.role,
        companyName: context.business.name,
        password: DEFAULT_PASSWORD,
      });
      console.log("[ADD-EMP] Email sent:", emailSent);
    } catch (emailError) {
      console.error("[ADD-EMP] Email failed:", emailError);
    }

    const responseEmployee = {
      ...employee,
      createdAt: employee.createdAt.toISOString(),
      lastLoginAt: employee.createdAt.toISOString(),
    };

    console.log("[ADD-EMP] Complete success");
    return NextResponse.json({
      success: true,
      user: responseEmployee,
      employee: responseEmployee,
      credentials: {
        email: employee.email,
        password: DEFAULT_PASSWORD,
      },
      emailSent,
    });
  } catch (error) {
    console.error("[ADD-EMP] Fatal error:", error);
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage(error)}` },
      { status: 500 },
    );
  }
}
