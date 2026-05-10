import { NextResponse } from "next/server";

import auth from "@/lib/auth";
import {
  BLIZZWAY_BUSINESS_MODEL,
  BLIZZWAY_BUSINESS_MODEL_ALIASES,
  type BlizzwayBusinessModel,
  normalizeBlizzwayBusinessModel,
} from "@/lib/career7-wallet";
import { prisma } from "@/lib/prisma";

export type Career7Context = {
  userId: string;
  businessId: string;
  businessModel: BlizzwayBusinessModel;
};

export function isCareer7Business(business: { type: string; plan: string } | null) {
  const businessType = normalizeBlizzwayBusinessModel(business?.type);
  const plan = business?.plan.toUpperCase() ?? "";

  return (
    Boolean(businessType) ||
    plan.startsWith("CAREER7_") ||
    plan.startsWith("BLIZZWAY_")
  );
}

function getBusinessModelForBusiness(
  business: { type: string; plan: string } | null,
): BlizzwayBusinessModel {
  return normalizeBlizzwayBusinessModel(business?.type) ?? BLIZZWAY_BUSINESS_MODEL;
}

function requestBusinessModelAllowed(request?: Request) {
  const requested = request?.headers.get("x-business-model");
  if (!requested) return true;

  return Boolean(normalizeBlizzwayBusinessModel(requested));
}

export async function getCareer7Context(request?: Request): Promise<
  | { context: Career7Context; response?: never }
  | { context?: never; response: NextResponse<{ error: string }> }
> {
  const session = await auth();

  if (!session?.user?.id) {
    return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  if (!requestBusinessModelAllowed(request)) {
    return {
      response: NextResponse.json(
        { error: `Forbidden: expected businessModel ${BLIZZWAY_BUSINESS_MODEL}.` },
        { status: 403 },
      ),
    };
  }

  if (!session.user.businessId) {
    return {
      response: NextResponse.json(
        { error: "Blizzway requires a business workspace." },
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
        {
          error: `Forbidden: Blizzway workspace required. Accepted aliases: ${BLIZZWAY_BUSINESS_MODEL_ALIASES.join(", ")}.`,
        },
        { status: 403 },
      ),
    };
  }

  return {
    context: {
      userId: session.user.id,
      businessId: session.user.businessId,
      businessModel: getBusinessModelForBusiness(business),
    },
  };
}
