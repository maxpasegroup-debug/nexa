import { NextResponse } from "next/server";

import { requireRole } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function getCommissionContext() {
  const authResult = await requireRole("BDM");

  if (authResult.response) {
    return { error: authResult.response };
  }

  const user = await prisma.user.findUnique({
    where: { id: authResult.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      businessId: true,
    },
  });

  if (!user?.businessId) {
    return {
      error: NextResponse.json(
        { error: "Business not found for this user." },
        { status: 400 },
      ),
    };
  }

  return { user, businessId: user.businessId };
}

export function monthBounds(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return {
    start,
    end,
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  };
}
