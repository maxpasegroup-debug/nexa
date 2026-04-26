import { EmailLabel } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { getCurrentBusiness } from "@/lib/dashboard/server";
import { getGmailClient } from "@/lib/gmail";
import { createChatCompletionText } from "@/lib/openai";
import { prisma } from "@/lib/prisma";

function isEmailLabel(value: unknown): value is EmailLabel {
  return (
    typeof value === "string" &&
    Object.values(EmailLabel).includes(value as EmailLabel)
  );
}

async function summarizeEmail(subject: string, body: string) {
  try {
    const text = await createChatCompletionText({
      maxTokens: 180,
      system:
        "Summarize this email in exactly 2 concise sentences for a business owner. Return only the summary.",
      messages: [
        {
          role: "user",
          content: `Subject: ${subject}\n\n${body.slice(0, 6000)}`,
        },
      ],
    });
    return text ? text.trim() : null;
  } catch {
    return null;
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const context = await getCurrentBusiness();

    if (context.error) return context.error;

    const email = await prisma.email.findFirst({
      where: { id: params.id, businessId: context.business.id },
      include: {
        account: true,
        lead: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    if (!email) {
      return NextResponse.json({ error: "Email not found." }, { status: 404 });
    }

    const gmail = await getGmailClient(email.account);
    await gmail.users.messages.modify({
      userId: "me",
      id: email.gmailId,
      requestBody: { removeLabelIds: ["UNREAD"] },
    });

    const summary =
      email.nexaSummary ?? (await summarizeEmail(email.subject, email.body));
    const updated = await prisma.email.update({
      where: { id: email.id },
      data: {
        isRead: true,
        ...(summary && !email.nexaSummary ? { nexaSummary: summary } : {}),
      },
      include: {
        account: { select: { id: true, email: true } },
        lead: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    return NextResponse.json({ email: updated });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch email." },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const context = await getCurrentBusiness();

    if (context.error) return context.error;

    const body = (await request.json()) as {
      isStarred?: boolean;
      label?: unknown;
    };
    const email = await prisma.email.findFirst({
      where: { id: params.id, businessId: context.business.id },
    });

    if (!email) {
      return NextResponse.json({ error: "Email not found." }, { status: 404 });
    }

    let leadId = email.leadId;
    const nextLabel = isEmailLabel(body.label) ? body.label : undefined;

    if (nextLabel === "LEAD" && !leadId) {
      const lead = await prisma.lead.create({
        data: {
          name: email.fromName ?? email.from.split("@")[0] ?? "Email lead",
          email: email.from,
          source: "EMAIL",
          notes: `Created from email: ${email.subject}`,
          businessId: context.business.id,
        },
      });
      leadId = lead.id;
    }

    const updated = await prisma.email.update({
      where: { id: email.id },
      data: {
        ...(typeof body.isStarred === "boolean"
          ? { isStarred: body.isStarred }
          : {}),
        ...(nextLabel ? { label: nextLabel } : {}),
        ...(leadId ? { leadId } : {}),
      },
      include: { lead: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ email: updated });
  } catch {
    return NextResponse.json(
      { error: "Unable to update email." },
      { status: 500 },
    );
  }
}
