"use server";

import { revalidatePath } from "next/cache";

import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireNiceJobsAdmin() {
  const session = await auth();
  const role = session?.user?.role;

  if (!session?.user?.id || !["OWNER", "ADMIN"].includes(String(role))) {
    throw new Error("Not authorized");
  }

  return session.user;
}

export async function createNiceJobsFranchise(formData: FormData) {
  await requireNiceJobsAdmin();

  const name = String(formData.get("name") || "").trim();
  const slug =
    String(formData.get("slug") || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const commissionPercent = Number(formData.get("commissionPercent") || 0);

  if (!name || !slug || !commissionPercent) {
    throw new Error("Missing franchise fields");
  }

  await prisma.niceJobsFranchise.upsert({
    where: { slug },
    create: {
      slug,
      name,
      category: String(formData.get("category") || "Micro-franchise"),
      description: String(formData.get("description") || "NICEJOBS partner opportunity"),
      potentialEarnings: String(formData.get("potentialEarnings") || "Commission based"),
      commissionPercent,
      trainingDurationDays: Number(formData.get("trainingDurationDays") || 7),
      status: "ACTIVE",
    },
    update: {
      name,
      category: String(formData.get("category") || "Micro-franchise"),
      description: String(formData.get("description") || "NICEJOBS partner opportunity"),
      potentialEarnings: String(formData.get("potentialEarnings") || "Commission based"),
      commissionPercent,
      trainingDurationDays: Number(formData.get("trainingDurationDays") || 7),
      status: "ACTIVE",
    },
  });

  revalidatePath("/internal/nicejobs");
  revalidatePath("/nicejobs/opportunities");
}

export async function updateNiceJobsApplicationStatus(formData: FormData) {
  const actor = await requireNiceJobsAdmin();
  const applicationId = String(formData.get("applicationId") || "");
  const status = String(formData.get("status") || "");

  if (!applicationId || !status) throw new Error("Missing application status");

  await prisma.niceJobsApplication.update({
    where: { id: applicationId },
    data: {
      status,
      approvedAt: ["APPROVED", "ACTIVE"].includes(status) ? new Date() : undefined,
      activatedAt: status === "ACTIVE" ? new Date() : undefined,
      rejectedAt: status === "REJECTED" ? new Date() : undefined,
    },
  });

  await prisma.niceJobsAuditLog.create({
    data: {
      actorId: actor.id,
      action: "application.status.updated",
      entity: "NiceJobsApplication",
      entityId: applicationId,
      metadata: { status },
    },
  });

  revalidatePath("/internal/nicejobs");
}

export async function updateNiceJobsReferralStatus(formData: FormData) {
  const actor = await requireNiceJobsAdmin();
  const referralId = String(formData.get("referralId") || "");
  const status = String(formData.get("status") || "");

  if (!referralId || !status) throw new Error("Missing referral status");

  await prisma.niceJobsReferral.update({
    where: { id: referralId },
    data: {
      status,
      validatedAt: ["VALIDATED", "APPROVED"].includes(status) ? new Date() : undefined,
    },
  });

  await prisma.niceJobsAuditLog.create({
    data: {
      actorId: actor.id,
      action: "referral.status.updated",
      entity: "NiceJobsReferral",
      entityId: referralId,
      metadata: { status },
    },
  });

  revalidatePath("/internal/nicejobs");
}
