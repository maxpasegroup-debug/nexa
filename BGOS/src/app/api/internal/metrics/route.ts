import { NextResponse } from "next/server";

import auth from "@/lib/auth";
import { customerBusinessWhere } from "@/lib/internal-owner";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const owner = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        email: true,
        role: true,
        business: { select: { id: true } },
      },
    });

    if (owner?.email !== "boss@bgos.online" || owner.role !== "OWNER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const internalBusiness =
      owner.business ??
      (await prisma.business.findFirst({
        where: { name: "BGOS" },
        select: { id: true },
      }));

    if (!internalBusiness) {
      return NextResponse.json(
        { error: "BGOS internal business not found." },
        { status: 404 },
      );
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const customersWhere = customerBusinessWhere(internalBusiness.id);

    const [
      totalCustomers,
      totalUsers,
      internalUsers,
      customerUsers,
      totalLeads,
      internalLeads,
      customerLeads,
      newThisMonth,
    ] = await Promise.all([
      prisma.business.count({ where: customersWhere }),
      prisma.user.count(),
      prisma.user.count({ where: { businessId: internalBusiness.id } }),
      prisma.user.count({ where: { businessId: { not: internalBusiness.id } } }),
      prisma.lead.count(),
      prisma.lead.count({ where: { businessId: internalBusiness.id } }),
      prisma.lead.count({ where: { businessId: { not: internalBusiness.id } } }),
      prisma.business.count({
        where: { ...customersWhere, createdAt: { gte: startOfMonth } },
      }),
    ]);

    return NextResponse.json({
      totalCustomers,
      totalUsers,
      internalUsers,
      customerUsers,
      totalLeads,
      internalLeads,
      customerLeads,
      newThisMonth,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to fetch internal metrics.",
      },
      { status: 500 },
    );
  }
}
