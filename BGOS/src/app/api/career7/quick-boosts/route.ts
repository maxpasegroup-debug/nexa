import { NextResponse } from "next/server";

import { getCareer7Context } from "@/lib/career7-auth";
import { quickBoosts } from "@/lib/career7-data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authResult = await getCareer7Context(request);
    if (authResult.response) return authResult.response;

    return NextResponse.json({
      boosts: quickBoosts,
      total: quickBoosts.length,
    });
  } catch (error) {
    console.error("[career7:quick-boosts]", error);
    return NextResponse.json({ error: "Unable to load Blizzway quick boosts." }, { status: 500 });
  }
}
