import { NextResponse } from "next/server";

import { badRequest, BLIZZWAY_ADMIN_MODEL, manualWalletAdjustment, requireBlizzwayAdmin } from "@/lib/blizzway-admin";
import { getBool, getNumber, getString } from "@/lib/marketplace";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireBlizzwayAdmin();
  if ("error" in auth) return auth.error;
  const [packages, plans, payments, ledger] = await Promise.all([
    prisma.blizzwayCreditPackage.findMany({ where: { businessModel: BLIZZWAY_ADMIN_MODEL }, orderBy: { sortOrder: "asc" } }),
    prisma.blizzwaySubscriptionPlan.findMany({ where: { businessModel: BLIZZWAY_ADMIN_MODEL }, orderBy: { sortOrder: "asc" } }),
    prisma.bgosPaymentIntent.findMany({ where: { businessModel: BLIZZWAY_ADMIN_MODEL }, orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.career7CreditLedger.findMany({
      where: { businessModel: BLIZZWAY_ADMIN_MODEL },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
  ]);
  return NextResponse.json({ packages, plans, payments, ledger });
}

export async function POST(request: Request) {
  try {
    const auth = await requireBlizzwayAdmin();
    if ("error" in auth) return auth.error;
    const body = (await request.json()) as Record<string, unknown>;
    const entity = getString(body.entity);

    if (entity === "manual-credit") {
      const amount = Math.round(getNumber(body.amount) ?? 0);
      const result = await manualWalletAdjustment({
        businessId: getString(body.businessId),
        userId: getString(body.userId),
        amount,
        reason: getString(body.reason),
        adminId: auth.owner.id,
      });
      return NextResponse.json(result, { status: 201 });
    }

    if (entity === "package") {
      const slug = getString(body.slug);
      const name = getString(body.name);
      if (!slug || !name) return badRequest("slug and name are required.");
      const totalCredits = Math.max(0, Math.round(getNumber(body.totalCredits) ?? getNumber(body.baseCredits) ?? 0));
      const pack = await prisma.blizzwayCreditPackage.upsert({
        where: { businessModel_slug: { businessModel: BLIZZWAY_ADMIN_MODEL, slug } },
        create: {
          businessModel: BLIZZWAY_ADMIN_MODEL,
          slug,
          name,
          description: getString(body.description) || name,
          priceInr: Math.max(0, Math.round(getNumber(body.priceInr) ?? 0)),
          baseCredits: Math.max(0, Math.round(getNumber(body.baseCredits) ?? totalCredits)),
          bonusCredits: Math.max(0, Math.round(getNumber(body.bonusCredits) ?? 0)),
          totalCredits,
          badgeLabel: getString(body.badgeLabel) || null,
          active: getBool(body.active) ?? true,
          sortOrder: getNumber(body.sortOrder) ?? 100,
        },
        update: {
          name,
          description: getString(body.description) || name,
          priceInr: Math.max(0, Math.round(getNumber(body.priceInr) ?? 0)),
          baseCredits: Math.max(0, Math.round(getNumber(body.baseCredits) ?? totalCredits)),
          bonusCredits: Math.max(0, Math.round(getNumber(body.bonusCredits) ?? 0)),
          totalCredits,
          badgeLabel: getString(body.badgeLabel) || null,
          active: getBool(body.active) ?? true,
          sortOrder: getNumber(body.sortOrder) ?? 100,
        },
      });
      return NextResponse.json({ package: pack }, { status: 201 });
    }

    if (entity === "plan") {
      const slug = getString(body.slug);
      const name = getString(body.name);
      if (!slug || !name) return badRequest("slug and name are required.");
      const plan = await prisma.blizzwaySubscriptionPlan.upsert({
        where: { businessModel_slug: { businessModel: BLIZZWAY_ADMIN_MODEL, slug } },
        create: {
          businessModel: BLIZZWAY_ADMIN_MODEL,
          slug,
          name,
          monthlyPriceInr: Math.max(0, Math.round(getNumber(body.monthlyPriceInr) ?? 0)),
          monthlyCredits: Math.max(0, Math.round(getNumber(body.monthlyCredits) ?? 0)),
          features: [],
          active: getBool(body.active) ?? true,
          sortOrder: getNumber(body.sortOrder) ?? 100,
        },
        update: {
          name,
          monthlyPriceInr: Math.max(0, Math.round(getNumber(body.monthlyPriceInr) ?? 0)),
          monthlyCredits: Math.max(0, Math.round(getNumber(body.monthlyCredits) ?? 0)),
          active: getBool(body.active) ?? true,
          sortOrder: getNumber(body.sortOrder) ?? 100,
        },
      });
      return NextResponse.json({ plan }, { status: 201 });
    }

    return badRequest("Unsupported wallet admin entity.");
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Wallet admin action failed." }, { status: 400 });
  }
}
