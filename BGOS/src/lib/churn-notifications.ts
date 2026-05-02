import { sendEmail } from "@/lib/email";
import { getInternalBusiness, planMonthlyAmount } from "@/lib/onboarding-flow";
import { prisma } from "@/lib/prisma";

export async function notifyRenewalFailed(businessId: string) {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: {
      users: { where: { role: "BOSS" } },
      onboardingLead: {
        include: { assignedBDM: { select: { id: true, name: true, email: true } } },
      },
    },
  });
  if (!business) return;

  await prisma.nexaInsight.create({
    data: {
      businessId,
      type: "PAYMENT_FAILED",
      message:
        "Your BGOS payment failed. Please update your payment method. Access continues for 3 more days.",
      action: "Update payment",
    },
  });

  const internalBusiness = await getInternalBusiness();
  const bdm = business.onboardingLead?.assignedBDM;
  if (internalBusiness && bdm) {
    await prisma.nexaInsight.create({
      data: {
        businessId: internalBusiness.id,
        type: "CHURN_RISK",
        message: `${business.name} renewal failed. Contact them today. Access may be suspended in 3 days.`,
        action: "Call customer",
      },
    });

    await sendEmail({
      to: bdm.email,
      toName: bdm.name,
      subject: `Renewal failed - ${business.name}`,
      html: `<p>${business.name}'s payment failed. Contact them immediately. Access may be suspended in 3 days if not resolved. Renewal commission is at risk.</p>`,
    });
  }

  await prisma.business.update({
    where: { id: businessId },
    data: { bdmNotifiedAt: new Date() },
  });
}

export async function escalateToOwner(businessId: string) {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: {
      trialSubscription: true,
      onboardingLead: {
        include: { assignedBDM: { select: { name: true } } },
      },
    },
  });
  if (!business) return;

  const internalBusiness = await getInternalBusiness();
  if (!internalBusiness) return;

  const plan = business.trialSubscription?.plan ?? "STARTER";
  const amount = business.trialSubscription?.monthlyAmount ?? planMonthlyAmount(plan);
  const bdmName = business.onboardingLead?.assignedBDM?.name ?? "unknown";

  await prisma.nexaInsight.create({
    data: {
      businessId: internalBusiness.id,
      type: "ESCALATION",
      message: `${business.name} renewal failed 24 hours ago. BDM ${bdmName} has not resolved it. Revenue at risk: Rs ${amount.toLocaleString("en-IN")}/month.`,
      action: "Escalate renewal recovery",
    },
  });

  await prisma.business.update({
    where: { id: businessId },
    data: { bossEscalatedAt: new Date() },
  });
}

export async function notifyLowEngagement(
  businessId: string,
  daysSinceLogin: number,
) {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: { onboardingLead: { include: { assignedBDM: true } } },
  });
  if (!business) return;

  const internalBusiness = await getInternalBusiness();
  if (!internalBusiness) return;

  const isUrgent = daysSinceLogin >= 14;
  await prisma.nexaInsight.create({
    data: {
      businessId: internalBusiness.id,
      type: "CHURN_RISK",
      message: `${business.name} has not logged in for ${daysSinceLogin} days. ${
        isUrgent ? "High churn risk. Contact immediately." : "Check in with them."
      }`,
      action: isUrgent ? "Call customer today" : "Schedule customer check-in",
    },
  });

  await prisma.business.update({
    where: { id: businessId },
    data: { churnRiskAlertedAt: new Date() },
  });
}
