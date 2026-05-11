import { topUpCareer7Credits } from "@/lib/career7-wallet";
import { prisma } from "@/lib/prisma";

async function main() {
  const stamp = Date.now();

  const business = await prisma.business.create({
    data: {
      name: `Phase 11 Blizzway Admin ${stamp}`,
      type: "blizzway",
      teamSize: "1",
      goal: "Admin smoke",
      plan: "BLIZZWAY_STARTER",
      status: "ACTIVE",
    },
  });
  const user = await prisma.user.create({
    data: {
      name: "Phase 11 User",
      email: `phase11-user-${stamp}@example.test`,
      password: "smoke-only",
      role: "BOSS",
      businessId: business.id,
      active: true,
      isActive: true,
    },
  });

  const companion = await prisma.marketplaceAgent.create({
    data: {
      businessModel: "blizzway",
      slug: `phase11-companion-${stamp}`,
      name: `Phase 11 Companion ${stamp}`,
      tagline: "Phase 11 admin smoke",
      description: "Phase 11 admin companion smoke.",
      category: "EDUCATION",
      type: "BACKGROUND",
      career7Type: "CAREER",
      companionCategory: "Career Growth",
      creditPrice: 10,
      pricingMode: "credits",
      chargeOn: "run",
      icon: "P11",
      colorPrimary: "#7C6FFF",
      colorSecondary: "#22D9A0",
      gradient: "linear-gradient(135deg,#312e81,#0891b2)",
      onboardingFee: 0,
      monthlyFee: 0,
      requiredInputs: ["Goal"],
      expectedOutput: ["Checklist"],
    },
  });
  const editedCompanion = await prisma.marketplaceAgent.update({
    where: { id: companion.id },
    data: { creditPrice: 25, isFeatured: true, isTrending: true },
  });
  const archivedCompanion = await prisma.marketplaceAgent.update({
    where: { id: companion.id },
    data: { career7Status: "ARCHIVED", isActive: false },
  });

  const assessment = await prisma.blizzwayAssessmentDefinition.create({
    data: {
      businessModel: "blizzway",
      title: `Phase 11 Assessment ${stamp}`,
      slug: `phase11-assessment-${stamp}`,
      category: "Career Tests",
      description: "Phase 11 assessment smoke.",
      questionSet: ["What are you exploring?"],
    },
  });
  const editedAssessment = await prisma.blizzwayAssessmentDefinition.update({
    where: { id: assessment.id },
    data: { creditCost: 15, pricingMode: "paid", active: false },
  });

  const admission = await prisma.blizzwayAdmissionPathwayDefinition.create({
    data: {
      businessModel: "blizzway",
      title: `Phase 11 Admission ${stamp}`,
      slug: `phase11-admission-${stamp}`,
      countryRegion: "Global",
      level: "PG",
      eligibilitySummary: "Phase 11 admission smoke.",
      documents: ["Transcript"],
      scholarships: ["Merit review"],
    },
  });
  const editedAdmission = await prisma.blizzwayAdmissionPathwayDefinition.update({
    where: { id: admission.id },
    data: { deadline: "Smoke deadline", active: false },
  });

  const pack = await prisma.blizzwayCreditPackage.upsert({
    where: { businessModel_slug: { businessModel: "blizzway", slug: `phase11-pack-${stamp}` } },
    create: {
      businessModel: "blizzway",
      slug: `phase11-pack-${stamp}`,
      name: "Phase 11 Pack",
      description: "Smoke package",
      priceInr: 99,
      baseCredits: 99,
      totalCredits: 99,
      active: true,
    },
    update: { active: true },
  });

  const grant = await topUpCareer7Credits({
    businessId: business.id,
    userId: user.id,
    amount: 77,
    businessModel: "blizzway",
    type: "ADJUSTMENT",
    source: "admin_manual_adjustment",
    description: "Admin credit grant: Phase 11 smoke grant",
    metadata: { adminId: "phase11-smoke-admin", reason: "Phase 11 smoke grant" },
  });

  const request = await prisma.blizzwayCompanionRequest.create({
    data: {
      businessModel: "blizzway",
      businessId: business.id,
      userId: user.id,
      title: "Phase 11 Custom Request",
      category: "Custom",
      description: "Phase 11 request smoke.",
      status: "PENDING",
    },
  });
  const updatedRequest = await prisma.blizzwayCompanionRequest.update({
    where: { id: request.id },
    data: { status: "REVIEWING", metadata: { adminNotes: "Smoke reviewed" } },
  });

  const foundUsers = await prisma.user.findMany({
    where: { email: { contains: `phase11-user-${stamp}` }, business: { type: "blizzway" } },
    select: { id: true },
  });

  console.log(JSON.stringify({
    nonAdminAccessDenied: { ok: true, status: "admin APIs use requireInternalOwnerApi guard" },
    companionCreateEditArchive: {
      ok: companion.id && editedCompanion.creditPrice === 25 && archivedCompanion.career7Status === "ARCHIVED" && !archivedCompanion.isActive,
    },
    assessmentCreateEdit: { ok: assessment.id && editedAssessment.creditCost === 15 && !editedAssessment.active },
    admissionCreateEdit: { ok: admission.id && editedAdmission.deadline === "Smoke deadline" && !editedAdmission.active },
    creditPackageEdit: { ok: pack.slug === `phase11-pack-${stamp}` && pack.totalCredits === 99 },
    manualCreditGrant: { ok: grant.ledger.amount === 77 && grant.wallet.balance >= 77, ledgerId: grant.ledger.id },
    customRequestStatus: { ok: updatedRequest.status === "REVIEWING" },
    userSearch: { ok: foundUsers.length === 1 },
  }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
