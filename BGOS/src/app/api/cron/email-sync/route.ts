import { NextRequest, NextResponse } from "next/server";

import { verifyCronSecret } from "@/lib/cron-guard";
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

export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = new Date();
  const accounts = await prisma.emailAccount.findMany({
    where: { isActive: true },
  });
  const results = await Promise.allSettled(
    accounts.map((account) => syncEmails(account.id)),
  );
  const businesses = new Set(accounts.map((account) => account.businessId));

  await Promise.allSettled(
    Array.from(businesses).map((businessId) =>
      classifyNewEmails(businessId, startedAt),
    ),
  );

  return NextResponse.json({
    accounts: accounts.length,
    totalNewEmails: results.reduce(
      (sum, result) => sum + (result.status === "fulfilled" ? result.value : 0),
      0,
    ),
    failures: results.filter((result) => result.status === "rejected").length,
    timestamp: new Date().toISOString(),
  });
}
