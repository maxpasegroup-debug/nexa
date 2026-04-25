import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

import { getCurrentBusiness } from "@/lib/dashboard/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const context = await getCurrentBusiness();

    if (context.error) return context.error;

    const email = await prisma.email.findFirst({
      where: { id: params.id, businessId: context.business.id },
    });

    if (!email) {
      return NextResponse.json({ error: "Email not found." }, { status: 404 });
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      system:
        "You are NEXA, an AI email assistant for an Indian SME. Write a professional, warm, concise email reply. Sound human, not corporate. Under 150 words. Return only the email body text, no subject line, no greeting/sign-off.",
      messages: [
        {
          role: "user",
          content: JSON.stringify({
            subject: email.subject,
            body: email.body.slice(0, 6000),
            senderName: email.fromName ?? email.from,
          }),
        },
      ],
    });
    const text = response.content.find((block) => block.type === "text");
    const draft =
      text?.type === "text"
        ? text.text.trim()
        : "Thanks for reaching out. We will review this and get back to you shortly.";

    await prisma.email.update({
      where: { id: email.id },
      data: { nexaReplyDraft: draft },
    });

    return NextResponse.json({ draft });
  } catch {
    return NextResponse.json(
      { error: "Unable to generate draft." },
      { status: 500 },
    );
  }
}
