import { NextResponse } from "next/server";

import { listActiveCompanions, serializeCompanion } from "@/lib/blizzway-companions";
import { getCareer7Context } from "@/lib/career7-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authResult = await getCareer7Context(request);
    if (authResult.response) return authResult.response;

    const activations = await listActiveCompanions(authResult.context);
    const companions = activations.map((activation) => ({
      id: activation.id,
      attachedTo: activation.attachedTo,
      status: activation.status.toLowerCase(),
      activatedAt: activation.activatedAt.toISOString(),
      companion: serializeCompanion({
        ...activation.companion,
        blizzwayCompanionActivations: [activation],
      }),
    }));

    return NextResponse.json({
      companions,
      total: companions.length,
      byAttachment: {
        pathway: companions.filter((item) => item.attachedTo === "pathway").length,
        learning: companions.filter((item) => item.attachedTo === "learning").length,
        earning: companions.filter((item) => item.attachedTo === "earning").length,
      },
    });
  } catch (error) {
    console.error("[career7:companions:active]", error);
    return NextResponse.json({ error: "Unable to load active companions." }, { status: 500 });
  }
}
