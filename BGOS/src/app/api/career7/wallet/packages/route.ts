import { NextResponse } from "next/server";

import { listBlizzwayCreditPackages } from "@/lib/blizzway-pricing";
import { getCareer7Context } from "@/lib/career7-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authResult = await getCareer7Context(request);
  if (authResult.response) return authResult.response;

  const packages = await listBlizzwayCreditPackages();
  return NextResponse.json({ packages });
}
