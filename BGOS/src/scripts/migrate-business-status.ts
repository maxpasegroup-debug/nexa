import { PrismaClient, type BusinessStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const businesses = await prisma.business.findMany({
    include: {
      trialSubscription: true,
      onboardingLead: true,
    },
  });

  for (const business of businesses) {
    let newStatus: BusinessStatus = "PREVIEW";

    if (business.trialSubscription?.status === "ACTIVE") {
      newStatus = "ACTIVE";
    } else if (business.trialSubscription?.status === "TRIAL") {
      newStatus = "TRIAL";
    } else if (business.onboardingLead?.status === "SDE_BUILDING") {
      newStatus = "BUILDING";
    } else if (business.onboardingLead?.status === "SDE_DELIVERED") {
      newStatus = "PREVIEW";
    } else if (!business.onboardingLead && !business.trialSubscription) {
      newStatus = business.name === "BGOS" ? "ACTIVE" : "PREVIEW";
    }

    await prisma.business.update({
      where: { id: business.id },
      data: {
        status: newStatus,
        statusUpdatedAt: new Date(),
        trialStartedAt:
          business.trialStartedAt ?? business.trialSubscription?.trialStartedAt ?? null,
        trialEndsAt:
          business.trialEndsAt ?? business.trialSubscription?.trialEndsAt ?? null,
        razorpayCustomerId:
          business.razorpayCustomerId ??
          business.trialSubscription?.razorpayCustomerId ??
          business.onboardingLead?.razorpayCustomerId ??
          null,
        razorpayMandateId:
          business.razorpayMandateId ??
          business.trialSubscription?.razorpayMandateId ??
          business.onboardingLead?.razorpayMandateId ??
          null,
      },
    });

    console.log(`${business.name} -> ${newStatus}`);
  }

  console.log("Migration complete");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
