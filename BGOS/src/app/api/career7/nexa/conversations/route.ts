import { NextResponse } from "next/server";

import { listNexaConversations } from "@/lib/blizzway-nexa-advanced";
import { getCareer7Context } from "@/lib/career7-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authResult = await getCareer7Context(request);
    if (authResult.response) return authResult.response;
    const conversations = await listNexaConversations(authResult.context);
    return NextResponse.json({
      conversations: conversations.map((conversation) => ({
        ...conversation,
        generatedAt: conversation.generatedAt.toISOString(),
        updatedAt: conversation.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("[career7:nexa:conversations]", error);
    return NextResponse.json({ error: "Unable to load NEXA conversations." }, { status: 500 });
  }
}
