import { NextResponse } from "next/server";

import { getCurrentBusiness } from "@/lib/dashboard/server";
import { autoLabelEmail, matchEmailToLead, syncEmails } from "@/lib/gmail";
import { prisma } from "@/lib/prisma";

async function classifyNewEmails(businessId: string, since: Date) {
  const emails = await prisma.email.findMany({
    where: {
      businessId,
      createdAt: { gte: since },
    },
  });

  await Promise.allSettled(
    emails.map(async (email) => {
      const [classification] = await Promise.all([
        autoLabelEmail(email, businessId),
        matchEmailToLead(email, businessId),
      ]);

      await prisma.email.update({
        where: { id: email.id },
        data: {
          label: classification.label,
          nexaReplyDraft: classification.suggestedReply,
        },
      });
    }),
  );
}

export async function POST() {
  try {
    const context = await getCurrentBusiness();

    if (context.error) return context.error;

    const startedAt = new Date();
    const accounts = await prisma.emailAccount.findMany({
      where: { businessId: context.business.id, isActive: true },
    });
    const results = await Promise.allSettled(
      accounts.map((account) => syncEmails(account.id)),
    );
    const totalNewEmails = results.reduce(
      (sum, result) => sum + (result.status === "fulfilled" ? result.value : 0),
      0,
    );

    await classifyNewEmails(context.business.id, startedAt);

    return NextResponse.json({
      accounts: accounts.length,
      totalNewEmails,
      failures: results.filter((result) => result.status === "rejected").length,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to sync email inbox." },
      { status: 500 },
    );
  }
}
