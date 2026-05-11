import { NextResponse } from "next/server";

import { getCareer7Context } from "@/lib/career7-auth";
import { getNexaChatReply } from "@/lib/blizzway-nexa-engine";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const authResult = await getCareer7Context(request);
  if (authResult.response) return authResult.response;

  const body = (await request.json().catch(() => ({}))) as {
    message?: string;
    quickAction?: string;
  };
  const message = body.message?.trim() || body.quickAction?.trim();
  if (!message) return NextResponse.json({ error: "message is required." }, { status: 400 });

  return NextResponse.json(await getNexaChatReply(authResult.context, message, body.quickAction));
}
