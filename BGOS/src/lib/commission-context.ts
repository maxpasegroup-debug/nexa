import { NextResponse } from "next/server";

import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getCommissionContext() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
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
