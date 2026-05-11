import { NextResponse } from "next/server";

import { getCareer7Context } from "@/lib/career7-auth";
import { buildBdp } from "@/lib/career7-data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authResult = await getCareer7Context(request);
    if (authResult.response) return authResult.response;

    return NextResponse.json({ bdp: await buildBdp(authResult.context) });
  } catch (error) {
    console.error("[career7:bdp]", error);
    return NextResponse.json({ error: "Unable to load Blizzway Digital Profile." }, { status: 500 });
  }
}
