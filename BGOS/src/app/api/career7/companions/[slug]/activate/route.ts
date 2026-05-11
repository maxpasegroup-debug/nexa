import { NextResponse } from "next/server";

import { activateCompanion, findAvailableCompanion, serializeCompanion } from "@/lib/blizzway-companions";
import { completePathwayQuest } from "@/lib/blizzway-gamification";
import { getCareer7Context } from "@/lib/career7-auth";
import { getString } from "@/lib/marketplace";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: { slug: string } },
) {
  try {
    const authResult = await getCareer7Context(request);
    if (authResult.response) return authResult.response;

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const companion = await findAvailableCompanion(params.slug, authResult.context);
    if (!companion) return NextResponse.json({ error: "Companion not found." }, { status: 404 });
    if (companion.career7Status !== "ACTIVE") return NextResponse.json({ error: "Companion is not active yet." }, { status: 409 });

    const result = await activateCompanion(authResult.context, companion, getString(body.idempotencyKey) || undefined);
    await completePathwayQuest(authResult.context, "activate_first_companion", {
      source: "companion_activate",
      slug: companion.slug,
    }).catch((error) => {
      console.error("[career7:companions:activate:gamification]", error);
    });
    const activeCompanion = await findAvailableCompanion(params.slug, authResult.context);

    return NextResponse.json(
      {
        activation: {
          id: result.activation.id,
          status: result.activation.status.toLowerCase(),
          attachedTo: result.activation.attachedTo,
          activatedAt: result.activation.activatedAt.toISOString(),
          duplicate: result.duplicate,
        },
        companion: activeCompanion ? serializeCompanion(activeCompanion) : serializeCompanion(companion),
        ledger: result.ledger
          ? {
              id: result.ledger.id,
              amount: result.ledger.amount,
              balanceAfter: result.ledger.balanceAfter,
              description: result.ledger.description,
            }
          : null,
      },
      { status: result.duplicate ? 200 : 201 },
    );
  } catch (error) {
    if (error instanceof Error && error.message === "INSUFFICIENT_CREDITS") {
      return NextResponse.json({ error: "Insufficient Blizzway credits." }, { status: 402 });
    }

    console.error("[career7:companions:activate]", error);
    return NextResponse.json({ error: "Unable to activate companion." }, { status: 500 });
  }
}
