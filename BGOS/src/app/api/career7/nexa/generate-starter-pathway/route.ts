import { NextResponse } from "next/server";

import { getCareer7Context } from "@/lib/career7-auth";
import { generateStarterPathway } from "@/lib/blizzway-nexa-engine";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const authResult = await getCareer7Context(request);
  if (authResult.response) return authResult.response;

  return NextResponse.json({ pathway: await generateStarterPathway(authResult.context) });
}
