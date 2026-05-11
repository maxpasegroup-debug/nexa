import { NextResponse } from "next/server";

import { getCareer7Context } from "@/lib/career7-auth";
import { generateStarterBdp } from "@/lib/blizzway-nexa-engine";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const authResult = await getCareer7Context(request);
  if (authResult.response) return authResult.response;

  return NextResponse.json({ bdp: await generateStarterBdp(authResult.context) });
}
