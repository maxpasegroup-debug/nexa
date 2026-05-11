import { NextResponse } from "next/server";

import { getCareer7Context } from "@/lib/career7-auth";
import { BLIZZWAY_BUSINESS_MODEL_ALIASES } from "@/lib/career7-wallet";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authResult = await getCareer7Context(request);
  if (authResult.response) return authResult.response;

  const ledger = await prisma.career7CreditLedger.findMany({
    where: {
      businessModel: { in: [...BLIZZWAY_BUSINESS_MODEL_ALIASES] },
      businessId: authResult.context.businessId,
      userId: authResult.context.userId,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ transactions: ledger });
}
