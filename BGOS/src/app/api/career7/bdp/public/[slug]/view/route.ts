import { NextResponse } from "next/server";

import { getPublishedPublicBdp, incrementPublicBdpView } from "@/lib/blizzway-public-bdp";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: { slug: string } },
) {
  const profile = await getPublishedPublicBdp(params.slug);
  if (!profile) return NextResponse.json({ error: "Public BDP not available." }, { status: 404 });

  const updated = await incrementPublicBdpView(params.slug);
  return NextResponse.json({ ok: true, viewCount: updated?.viewCount ?? profile.viewCount });
}
