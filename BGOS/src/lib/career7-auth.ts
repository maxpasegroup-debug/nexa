import { NextResponse } from "next/server";

import auth from "@/lib/auth";
import { CAREER7_BUSINESS_MODEL } from "@/lib/career7-wallet";
import { prisma } from "@/lib/prisma";

export type Career7Context = {
  userId: string;
  businessId: string;
};

export function isCareer7Business(business: { type: string; plan: string } | null) {
  return (
    business?.type.toLowerCase() === CAREER7_BUSINESS_MODEL ||
    business?.plan.toUpperCase().startsWith("CAREER7_")
  );
}

export async function getCareer7Context(): Promise<
  | { context: Career7Context; response?: never }
  | { context?: never; response: NextResponse<{ error: string }> }
> {
  const session = await auth();

  if (!session?.user?.id) {
    return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  if (!session.user.businessId) {
    return {
      response: NextResponse.json(
        { error: "Career7 requires a business workspace." },
        { status: 400 },
      ),
    };
  }

  const business = await prisma.business.findUnique({
    where: { id: session.user.businessId },
    select: { type: true, plan: true },
  });

  if (!isCareer7Business(business)) {
    return {
      response: NextResponse.json(
        { error: "Forbidden: Career7 workspace required." },
        { status: 403 },
      ),
    };
  }

  return {
    context: {
      userId: session.user.id,
      businessId: session.user.businessId,
    },
  };
}
