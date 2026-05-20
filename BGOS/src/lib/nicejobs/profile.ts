"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getNiceJobsProfile(userId: string) {
  return prisma.niceJobsProfile.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
}

function last4(value: string) {
  const compact = value.replace(/\s+/g, "");
  return compact.slice(-4);
}

export async function updateNiceJobsProfile(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?businessModel=nicejobs&callbackUrl=/nicejobs/profile");
  }

  const phone = String(formData.get("phone") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const country = String(formData.get("country") || "").trim();
  const payoutName = String(formData.get("payoutName") || "").trim();
  const payoutMethod = String(formData.get("payoutMethod") || "BANK").trim();
  const payoutAccount = String(formData.get("payoutAccount") || "").trim();
  const payoutRouting = String(formData.get("payoutRouting") || "").trim();
  const profileStatus = phone && payoutName && payoutAccount ? "READY_FOR_APPROVAL" : "INCOMPLETE";

  await prisma.niceJobsProfile.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      phone,
      city,
      country,
      payoutName,
      payoutMethod,
      payoutAccountLast4: payoutAccount ? last4(payoutAccount) : null,
      payoutDetails: {
        payoutMethod,
        payoutRouting,
        hasAccount: Boolean(payoutAccount),
      },
      profileStatus,
    },
    update: {
      phone,
      city,
      country,
      payoutName,
      payoutMethod,
      payoutAccountLast4: payoutAccount ? last4(payoutAccount) : undefined,
      payoutDetails: {
        payoutMethod,
        payoutRouting,
        hasAccount: Boolean(payoutAccount),
      },
      profileStatus,
    },
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { phone: phone || undefined },
  });

  revalidatePath("/nicejobs/profile");
  revalidatePath("/nicejobs/dashboard");
}
