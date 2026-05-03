import { redirect } from "next/navigation";
import type { OnboardingEmployee, OnboardingPipeline } from "@prisma/client";

import { OnboardingWizard } from "@/components/bdm/onboarding-wizard";
import { generateClientId } from "@/lib/client-id";
import { requireInternalOwner } from "@/lib/internal-owner";
import { prisma } from "@/lib/prisma";

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asNumberRecord(value: unknown): Record<string, number> {
  const record = asRecord(value);
  return Object.fromEntries(
    Object.entries(record).filter((entry): entry is [string, number] => typeof entry[1] === "number"),
  );
}

export default async function InternalBossOnboardingPage({
  params,
}: {
  params: { leadId: string };
}) {
  const { owner, business } = await requireInternalOwner();

  const lead = await prisma.lead.findFirst({
    where: { id: params.leadId, businessId: business.id },
    include: {
      onboardingSession: {
        include: {
          employees: true,
          pipelines: true,
        },
      },
      callNotes: {
        orderBy: { createdAt: "desc" },
        include: { author: { select: { id: true, name: true } } },
      },
    },
  });

  if (!lead) redirect("/internal/leads");

  const callNoteText = lead.callNotes.map((note) => note.content).join("\n\n");
  const existingSession = lead.onboardingSession;
  const onboardingSession =
    existingSession ??
    (await prisma.onboardingSession.create({
      data: {
        leadId: lead.id,
        bdmId: lead.assignedTo,
        clientId: await generateClientId(),
        status: "COLLECTING",
        companyData: {
          name: lead.company ?? lead.name,
          contactName: lead.name,
          email: lead.email,
          phone: lead.phone,
          description: callNoteText,
          callNotes: callNoteText,
        },
        challenges: { primary: lead.notes ?? "" },
      },
    }));

  if (!existingSession) {
    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        onboardingStarted: true,
        onboardingSessionId: onboardingSession.id,
        bdmStatus: "ONBOARDING",
      },
    });
  }

  await prisma.activityLog.create({
    data: {
      businessId: business.id,
      userId: owner.id,
      action: "Boss opened NEXA onboarding",
      entity: "OnboardingSession",
      entityId: onboardingSession.id,
      meta: { leadId: lead.id, leadName: lead.name },
    },
  });

  const onboardingEmployees =
    ("employees" in onboardingSession && Array.isArray(onboardingSession.employees)
      ? onboardingSession.employees
      : []) as OnboardingEmployee[];
  const onboardingPipelines =
    ("pipelines" in onboardingSession && Array.isArray(onboardingSession.pipelines)
      ? onboardingSession.pipelines
      : []) as OnboardingPipeline[];

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
        location: "",
        companyType: "",
        teamSize: "",
        callNotes: lead.callNotes.map((note) => ({
          id: note.id,
          content: note.content,
          createdAt: note.createdAt.toISOString(),
          authorName: note.author.name,
        })),
        resumeBanner: existingSession
          ? `Boss mode: resuming onboarding for ${lead.company ?? lead.name}.`
          : `Boss mode: NEXA onboarding started for ${lead.company ?? lead.name}.`,
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
          currentStep: onboardingSession.currentStep,
          canSubmit: onboardingSession.canSubmit,
          submissionBlocked: onboardingSession.submissionBlocked,
          completenessBreakdown: asNumberRecord(onboardingSession.completenessBreakdown),
          nexaMessages: asArray(onboardingSession.nexaMessages),
          nexaFlags: asArray(onboardingSession.nexaFlags),
          challenges: asRecord(onboardingSession.challenges),
          employees: onboardingEmployees.map((employee) => ({
            id: employee.id,
            fullName: employee.fullName || employee.name,
            name: employee.name,
            title: employee.title,
            email: employee.email,
            phone: employee.phone,
            reportsTo: employee.reportsTo,
            bgosRole: employee.bgosRole || employee.systemRole,
            systemRole: employee.systemRole,
            assignedPipelines: asArray(employee.assignedPipelines),
            operatingProcedures: employee.operatingProcedures,
            decisionAuthority: employee.decisionAuthority,
            completenessScore: employee.completenessScore || employee.completeness,
            nexaFlags: asArray(employee.nexaFlags),
          })),
          pipelines: onboardingPipelines.map((pipeline) => ({
            id: pipeline.id,
            name: pipeline.name,
            productName: pipeline.productName,
            stages: asArray(pipeline.stages),
            slaRules: asRecord(pipeline.slaRules),
            visibleTo: asArray(pipeline.visibleTo),
            color: pipeline.color,
          })),
        },
      }}
    />
  );
}
