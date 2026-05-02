import { NextResponse } from "next/server";

import { getBdmContext } from "@/lib/bdm/server";
import { analyseNotes } from "@/lib/nexa-bdm-analysis";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function isStale(value?: Date | null) {
  if (!value) return true;
  return Date.now() - value.getTime() > 6 * 60 * 60 * 1000;
}

async function getAnalysis(userId: string) {
  return prisma.nexaBDMAnalysis.findUnique({
    where: { userId },
  });
}

export async function GET() {
  try {
    const context = await getBdmContext();
    if (context.error) return context.error;

    let analysis = await getAnalysis(context.user.id);

    if (!analysis || isStale(analysis.lastAnalysedAt)) {
      await analyseNotes(context.user.id);
      analysis = await getAnalysis(context.user.id);
    }

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("[bdm-analysis:get]", error);
    return NextResponse.json({ error: "Unable to fetch BDM analysis." }, { status: 500 });
  }
}

export async function POST() {
  try {
    const context = await getBdmContext();
    if (context.error) return context.error;

    await analyseNotes(context.user.id);
    const analysis = await getAnalysis(context.user.id);

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("[bdm-analysis:refresh]", error);
    return NextResponse.json({ error: "Unable to refresh BDM analysis." }, { status: 500 });
  }
}
