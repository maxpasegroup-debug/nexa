"use server";

import { redirect } from "next/navigation";

import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCareer7ReferralCode } from "@/lib/nicejobs/career7";
import { ensureNiceJobsFranchise } from "@/lib/nicejobs/data";

function buildMouDocument(input: {
  userName: string;
  userEmail: string;
  franchiseName: string;
  commissionPercent: number;
}) {
  return [
    `NICEJOBS MICRO-FRANCHISE MEMORANDUM OF UNDERSTANDING`,
    ``,
    `Partner: ${input.franchiseName}`,
    `Participant: ${input.userName} (${input.userEmail})`,
    `Commission: ${input.commissionPercent}% on validated and approved sales/referrals.`,
    `Payment schedule: eligible monthly payouts are processed between the 1st and 10th of the following month.`,
    ``,
    `The participant agrees to complete assigned training, use only approved promotional resources, submit accurate referral information, and follow partner brand rules. NICEJOBS may validate referral events through BGOS or partner app data before marking earnings payable.`,
    ``,
    `This digital acceptance creates the application agreement record inside the BGOS-powered NICEJOBS system.`,
  ].join("\n");
}

export async function applyToNiceJobsOpportunity(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id || !session.user.email) {
    redirect("/login?businessModel=nicejobs&callbackUrl=/nicejobs/opportunities");
  }

  const slug = String(formData.get("slug") || "");
  const signatureText = String(formData.get("signatureText") || "").trim();
  const accepted = formData.get("accepted") === "on";

  if (!slug || !signatureText || !accepted) {
    redirect(`/nicejobs/opportunities/${slug}/apply?error=signature`);
  }

  const franchise = await ensureNiceJobsFranchise(slug);

  if (!franchise) {
    redirect("/nicejobs/opportunities?error=not-found");
  }

  const userName = session.user.name || signatureText;
  const commissionPercent = Number(franchise.commissionPercent);
  const isCareer7 = franchise.slug === "career7-in";
  const referralCode = isCareer7
    ? getCareer7ReferralCode(session.user.id || session.user.email)
    : undefined;
  const mouDocument = buildMouDocument({
    userName,
    userEmail: session.user.email,
    franchiseName: franchise.name,
    commissionPercent,
  });

  const existing = await prisma.niceJobsApplication.findUnique({
    where: {
      userId_franchiseId: {
        userId: session.user.id,
        franchiseId: franchise.id,
      },
    },
    include: { agreements: true },
  });

  if (existing) {
    if (!existing.agreements.length) {
      await prisma.niceJobsAgreement.create({
        data: {
          applicationId: existing.id,
          mouDocument,
          signerName: userName,
          signerEmail: session.user.email,
          signatureText,
          commissionPercent,
        },
      });
    }

    await prisma.niceJobsApplication.update({
      where: { id: existing.id },
      data: { status: existing.status === "PENDING_MOU" ? "SIGNED" : existing.status },
    });

    redirect(`/nicejobs/applications/${existing.id}`);
  }

  const application = await prisma.niceJobsApplication.create({
    data: {
      userId: session.user.id,
      franchiseId: franchise.id,
      status: isCareer7 ? "ACTIVE" : "SIGNED",
      referralCode,
      agreements: {
        create: {
          mouDocument,
          signerName: userName,
          signerEmail: session.user.email,
          signatureText,
          commissionPercent,
        },
      },
    },
  });

  redirect(`/nicejobs/applications/${application.id}`);
}
