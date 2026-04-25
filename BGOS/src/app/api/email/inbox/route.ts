import { EmailLabel, Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { getCurrentBusiness } from "@/lib/dashboard/server";
import { prisma } from "@/lib/prisma";

function isEmailLabel(value: string | null): value is EmailLabel {
  return Boolean(value && Object.values(EmailLabel).includes(value as EmailLabel));
}

export async function GET(request: NextRequest) {
  try {
    const context = await getCurrentBusiness();

    if (context.error) return context.error;

    const { searchParams } = new URL(request.url);
    const label = searchParams.get("label");
    const search = searchParams.get("search");
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 30)));
    const skip = (page - 1) * limit;
    const where: Prisma.EmailWhereInput = {
      businessId: context.business.id,
      ...(isEmailLabel(label) ? { label } : {}),
      ...(unreadOnly ? { isRead: false } : {}),
      ...(search
        ? {
            OR: [
              { subject: { contains: search, mode: "insensitive" } },
              { from: { contains: search, mode: "insensitive" } },
              { fromName: { contains: search, mode: "insensitive" } },
              { snippet: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [
      emails,
      total,
      unreadCount,
      allCount,
      leadCount,
      supportCount,
      importantCount,
      starredCount,
      spamCount,
      accounts,
    ] = await Promise.all([
      prisma.email.findMany({
        where,
        include: {
          lead: { select: { id: true, name: true } },
          account: { select: { email: true } },
        },
        orderBy: { receivedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.email.count({ where }),
      prisma.email.count({
        where: { businessId: context.business.id, isRead: false },
      }),
      prisma.email.count({ where: { businessId: context.business.id } }),
      prisma.email.count({
        where: { businessId: context.business.id, label: "LEAD" },
      }),
      prisma.email.count({
        where: { businessId: context.business.id, label: "SUPPORT" },
      }),
      prisma.email.count({
        where: { businessId: context.business.id, label: "IMPORTANT" },
      }),
      prisma.email.count({
        where: { businessId: context.business.id, isStarred: true },
      }),
      prisma.email.count({
        where: { businessId: context.business.id, label: "SPAM" },
      }),
      prisma.emailAccount.findMany({
        where: { businessId: context.business.id },
        select: {
          id: true,
          email: true,
          isActive: true,
          lastSyncAt: true,
        },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    return NextResponse.json({
      emails,
      total,
      unreadCount,
      page,
      limit,
      counts: {
        all: allCount,
        unread: unreadCount,
        leads: leadCount,
        support: supportCount,
        important: importantCount,
        starred: starredCount,
        spam: spamCount,
      },
      accounts,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch inbox." },
      { status: 500 },
    );
  }
}
