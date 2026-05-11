import { NextResponse } from "next/server";

import { findAvailableCompanion, runCompanion } from "@/lib/blizzway-companions";
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

    const pricingMode = companion.pricingMode?.toLowerCase();
    if (pricingMode === "subscription" || pricingMode === "premium") {
      return NextResponse.json(
        { error: "This companion is gated for premium/subscription use. Request access or activate a free/credit companion for now." },
        { status: 402 },
      );
    }

    const inputs =
      body.inputs && typeof body.inputs === "object" && !Array.isArray(body.inputs)
        ? (body.inputs as Record<string, unknown>)
        : body;
    const result = await runCompanion({
      context: authResult.context,
      agent: companion,
      inputs,
      idempotencyKey: getString(body.idempotencyKey) || undefined,
    });

    return NextResponse.json({
      run: {
        id: result.run.id,
        status: result.run.status.toLowerCase(),
        input: result.run.input,
        output: result.run.output,
        creditsCharged: result.run.creditsCharged,
        createdAt: result.run.createdAt.toISOString(),
        duplicate: result.duplicate,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "INSUFFICIENT_CREDITS") {
      return NextResponse.json({ error: "Insufficient Blizzway credits." }, { status: 402 });
    }

    console.error("[career7:companions:run]", error);
    return NextResponse.json({ error: "Unable to run companion." }, { status: 500 });
  }
}
