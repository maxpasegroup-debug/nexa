import { redirect } from "next/navigation";

import { OnboardingWizard } from "@/components/bdm/onboarding-wizard";
import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export default async function BdmOnboardingWizardPage({
  params,
}: {
  params: { leadId: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true },
  });

  if (!user || user.role !== "BDM") redirect("/login");

  const lead = await prisma.lead.findFirst({
    where: {
      id: params.leadId,
      OR: [{ assignedTo: user.id }, { createdBy: user.id }],
    },
    include: {
      onboardingSession: true,
    },
  });

  if (!lead) redirect("/bdm/onboarding");

  const onboardingSession =
    lead.onboardingSession ??
    (await prisma.onboardingSession.create({
      data: {
        leadId: lead.id,
        bdmId: user.id,
        status: "COLLECTING",
        companyData: {
          name: lead.company ?? lead.name,
          industry: "",
          contactName: lead.name,
          email: lead.email,
          phone: lead.phone,
        },
      },
    }));

  return (
    <OnboardingWizard
      lead={{
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        value: lead.value,
        notes: lead.notes,
        onboardingSession: {
          id: onboardingSession.id,
          companyData: asRecord(onboardingSession.companyData),
          employeeData: asArray(onboardingSession.employeeData),
          pipelineData: asArray(onboardingSession.pipelineData),
          operatingRules: asArray(onboardingSession.operatingRules),
          nexaGaps: asArray(onboardingSession.nexaGaps),
          nexaSuggestions: asArray(onboardingSession.nexaSuggestions),
          completenessScore: onboardingSession.completenessScore,
          summaryGenerated: onboardingSession.summaryGenerated,
          summaryText: onboardingSession.summaryText,
          selectedPlan: onboardingSession.selectedPlan,
          bdmNotes: onboardingSession.bdmNotes,
        },
      }}
    />
  );
}
