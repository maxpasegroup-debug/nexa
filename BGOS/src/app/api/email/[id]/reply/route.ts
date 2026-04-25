import { NextRequest, NextResponse } from "next/server";

import { getCurrentBusiness } from "@/lib/dashboard/server";
import { sendEmail } from "@/lib/gmail";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const context = await getCurrentBusiness();

    if (context.error) return context.error;

    const body = (await request.json()) as { body?: string };

    if (!body.body || typeof body.body !== "string") {
      return NextResponse.json({ error: "Reply body is required." }, { status: 400 });
    }

    const email = await prisma.email.findFirst({
      where: { id: params.id, businessId: context.business.id },
      include: { account: true },
    });

    if (!email) {
      return NextResponse.json({ error: "Email not found." }, { status: 404 });
    }

    const messageId = await sendEmail(
      email.accountId,
      email.from,
      email.subject.startsWith("Re:") ? email.subject : `Re: ${email.subject}`,
      body.body,
      email.threadId,
    );

    if (email.leadId) {
      await prisma.leadActivity.create({
        data: {
          leadId: email.leadId,
          userId: context.user.id,
          type: "email",
          note: `Replied to email: ${email.subject}`,
        },
      });
      await prisma.lead.update({
        where: { id: email.leadId },
        data: { lastContactAt: new Date() },
      });
    }

    return NextResponse.json({ success: true, messageId });
  } catch {
    return NextResponse.json(
      { error: "Unable to send reply." },
      { status: 500 },
    );
  }
}
