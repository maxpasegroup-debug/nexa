import { NextResponse } from "next/server";

import { getNexaConversation } from "@/lib/blizzway-nexa-advanced";
import { getCareer7Context } from "@/lib/career7-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const authResult = await getCareer7Context(request);
    if (authResult.response) return authResult.response;
    const conversation = await getNexaConversation(authResult.context, params.id);
    if (!conversation) return NextResponse.json({ error: "NEXA conversation not found." }, { status: 404 });
    return NextResponse.json({
      conversation: {
        ...conversation,
        generatedAt: conversation.generatedAt.toISOString(),
        createdAt: conversation.createdAt.toISOString(),
        updatedAt: conversation.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("[career7:nexa:conversation]", error);
    return NextResponse.json({ error: "Unable to load NEXA conversation." }, { status: 500 });
  }
}
