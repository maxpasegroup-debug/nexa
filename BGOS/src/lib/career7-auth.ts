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

const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function originOf(value: string | undefined | null) {
  if (!value) return null;

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function allowedOriginsForRequest(request: Request) {
  const envOrigins = [
    process.env.AUTH_URL,
    process.env.NEXTAUTH_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.BLIZZWAY_ALLOWED_ORIGINS,
  ]
    .filter(Boolean)
    .flatMap((value) => String(value).split(","))
    .map((value) => originOf(value.trim()))
    .filter((value): value is string => Boolean(value));

  return new Set([
    originOf(request.url),
    "https://career7.in",
    "https://www.career7.in",
    ...envOrigins,
  ].filter((value): value is string => Boolean(value)));
}

function requestOriginAllowed(request?: Request) {
  if (!request || !unsafeMethods.has(request.method.toUpperCase())) return true;

  const origin = request.headers.get("origin");
  if (!origin) return true;

  return allowedOriginsForRequest(request).has(originOf(origin) ?? "");
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

  if (!requestOriginAllowed(request)) {
    return {
      response: NextResponse.json(
        { error: "Forbidden: request origin is not allowed." },
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
