import { NextResponse } from "next/server";

import { getCareer7Context } from "@/lib/career7-auth";
import {
  type Career7NexaMessage,
  getCareer7NexaReply,
} from "@/lib/career7-nexa";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const authResult = await getCareer7Context(request);
  if (authResult.response) return authResult.response;

  const body = (await request.json()) as {
    message?: string;
    quickAction?: string;
    history?: Career7NexaMessage[];
  };

  const message = body.message?.trim() || body.quickAction?.trim();
  if (!message) {
    return NextResponse.json({ error: "message is required." }, { status: 400 });
  }

  const reply = await getCareer7NexaReply({
    userId: authResult.context.userId,
    businessId: authResult.context.businessId,
    message,
    quickAction: body.quickAction,
    history: body.history,
  });

  return NextResponse.json(reply);
}
