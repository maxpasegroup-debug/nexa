import { NextResponse } from "next/server";

import { generateAdvancedNexaResponse } from "@/lib/blizzway-nexa-advanced";
import { getCareer7Context } from "@/lib/career7-auth";
import type { Career7NexaMessage } from "@/lib/career7-nexa";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const authResult = await getCareer7Context(request);
  if (authResult.response) return authResult.response;

  const body = (await request.json()) as {
    message?: string;
    quickAction?: string;
    history?: Career7NexaMessage[];
    conversationId?: string;
  };

  const message = body.message?.trim() || body.quickAction?.trim();
  if (!message) {
    return NextResponse.json({ error: "message is required." }, { status: 400 });
  }

  return NextResponse.json(await generateAdvancedNexaResponse(authResult.context, {
    message,
    quickAction: body.quickAction,
    conversationId: body.conversationId,
  }));
}
