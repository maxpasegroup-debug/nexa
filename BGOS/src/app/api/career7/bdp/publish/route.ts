import { NextResponse } from "next/server";

import { getCareer7Context } from "@/lib/career7-auth";
import { publishPublicBdp, serializePrivatePublicBdp } from "@/lib/blizzway-public-bdp";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const authResult = await getCareer7Context(request);
    if (authResult.response) return authResult.response;

    const profile = await publishPublicBdp(authResult.context);
    return NextResponse.json({ profile: serializePrivatePublicBdp(profile) });
  } catch (error) {
    console.error("[career7:bdp:publish]", error);
    return NextResponse.json({ error: "Unable to publish public BDP." }, { status: 500 });
  }
}
