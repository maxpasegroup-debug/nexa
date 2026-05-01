import { NextResponse } from "next/server";

import { customerBusinessWhere, requireInternalOwnerApi } from "@/lib/internal-owner";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const authResult = await requireInternalOwnerApi();
    if ("error" in authResult) return authResult.error;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const customersWhere = customerBusinessWhere(authResult.business.id);

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
      prisma.user.count({ where: { businessId: authResult.business.id } }),
      prisma.user.count({ where: { businessId: { not: authResult.business.id } } }),
      prisma.lead.count(),
      prisma.lead.count({ where: { businessId: authResult.business.id } }),
      prisma.lead.count({ where: { businessId: { not: authResult.business.id } } }),
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
