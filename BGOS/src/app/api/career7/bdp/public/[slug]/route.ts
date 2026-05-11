import { NextResponse } from "next/server";

import { getPublishedPublicBdp, serializePublicBdp } from "@/lib/blizzway-public-bdp";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } },
) {
  const profile = await getPublishedPublicBdp(params.slug);
  if (!profile) return NextResponse.json({ error: "Public BDP not available." }, { status: 404 });

  return NextResponse.json({ profile: serializePublicBdp(profile) });
}
