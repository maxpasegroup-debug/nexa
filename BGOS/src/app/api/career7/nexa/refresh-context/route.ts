import { NextResponse } from "next/server";

import { buildAdvancedNexaContext } from "@/lib/blizzway-nexa-advanced";
import { getCareer7Context } from "@/lib/career7-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const authResult = await getCareer7Context(request);
    if (authResult.response) return authResult.response;
    const context = await buildAdvancedNexaContext(authResult.context);
    return NextResponse.json({
      ok: true,
      contextSummary: {
        bdpStrength: context.bdp.profileStrength,
        assessments: context.assessmentResults.length,
        documents: context.documents.length,
        activeCompanions: context.companions.active.length,
        pathwayLevel: context.pathway.level,
        walletBand: context.wallet.balanceBand,
      },
    });
  } catch (error) {
    console.error("[career7:nexa:refresh-context]", error);
    return NextResponse.json({ error: "Unable to refresh NEXA context." }, { status: 500 });
  }
}
