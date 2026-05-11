import { NextResponse } from "next/server";

import { badRequest, BLIZZWAY_ADMIN_MODEL, jsonObject, requireBlizzwayAdmin } from "@/lib/blizzway-admin";
import { getBool, getString } from "@/lib/marketplace";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const defaultContent = [
  ["landing_highlights", "Landing page highlights", { highlights: ["BDP", "Companions", "Pathway quests"] }],
  ["dashboard_announcements", "Dashboard announcements", { message: "Keep one pathway action visible today." }],
  ["nexa_safety_messages", "NEXA safety messages", { note: "NEXA gives preparation guidance, not guaranteed outcomes." }],
  ["onboarding_question_options", "Onboarding question options", { options: ["career", "learning", "earning", "global"] }],
  ["free_credit_messaging", "Free credit messaging", { message: "Credits are platform credits only." }],
  ["featured_modules", "Featured modules", { modules: ["My Pathway", "BDP", "Companions"] }],
] as const;

async function ensureDefaults(updatedBy?: string) {
  await Promise.all(defaultContent.map(([key, title, value]) =>
    prisma.blizzwayContentConfig.upsert({
      where: { businessModel_key: { businessModel: BLIZZWAY_ADMIN_MODEL, key } },
      create: { businessModel: BLIZZWAY_ADMIN_MODEL, key, title, value, updatedBy },
      update: {},
    }),
  ));
}

export async function GET() {
  const auth = await requireBlizzwayAdmin();
  if ("error" in auth) return auth.error;
  await ensureDefaults(auth.owner.id);
  const configs = await prisma.blizzwayContentConfig.findMany({
    where: { businessModel: BLIZZWAY_ADMIN_MODEL },
    orderBy: { key: "asc" },
  });
  return NextResponse.json({ configs, total: configs.length });
}

export async function POST(request: Request) {
  const auth = await requireBlizzwayAdmin();
  if ("error" in auth) return auth.error;
  const body = (await request.json()) as Record<string, unknown>;
  const key = getString(body.key);
  const title = getString(body.title);
  if (!key || !title) return badRequest("key and title are required.");
  const config = await prisma.blizzwayContentConfig.upsert({
    where: { businessModel_key: { businessModel: BLIZZWAY_ADMIN_MODEL, key } },
    create: {
      businessModel: BLIZZWAY_ADMIN_MODEL,
      key,
      title,
      value: jsonObject(body.value),
      active: getBool(body.active) ?? true,
      updatedBy: auth.owner.id,
    },
    update: {
      title,
      value: jsonObject(body.value),
      active: getBool(body.active) ?? true,
      updatedBy: auth.owner.id,
    },
  });
  return NextResponse.json({ config }, { status: 201 });
}
