import { NextResponse } from "next/server";

import { findAvailableCompanion, serializeCompanion } from "@/lib/blizzway-companions";
import { getCareer7Context } from "@/lib/career7-auth";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } },
) {
  try {
    const authResult = await getCareer7Context(request);
    if (authResult.response) return authResult.response;

    const companion = await findAvailableCompanion(params.slug, authResult.context);
    if (!companion) return NextResponse.json({ error: "Companion not found." }, { status: 404 });

    return NextResponse.json({ companion: serializeCompanion(companion) });
  } catch (error) {
    console.error("[career7:companions:detail]", error);
    return NextResponse.json({ error: "Unable to load companion detail." }, { status: 500 });
  }
}
