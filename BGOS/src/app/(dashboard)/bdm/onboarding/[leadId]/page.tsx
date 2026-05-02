import { redirect } from "next/navigation";
import type { OnboardingEmployee, OnboardingPipeline } from "@prisma/client";

import { OnboardingWizard } from "@/components/bdm/onboarding-wizard";
import auth from "@/lib/auth";
import { generateClientId } from "@/lib/client-id";
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

function extractNoteValue(notes: Array<{ content: string }>, label: string) {
  const prefix = `${label}:`;
  for (const note of notes) {
    const line = note.content
      .split(/\r?\n/)
      .find((item) => item.trim().toLowerCase().startsWith(prefix.toLowerCase()));
    if (line) return line.slice(prefix.length).trim();
  }
  return "";
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

  if (!lead) redirect("/bdm/onboarding");

  const callNoteText = lead.callNotes.map((note) => note.content).join("\n\n");
  const location = extractNoteValue(lead.callNotes, "Location");
  const companyType = extractNoteValue(lead.callNotes, "Company type");
  const teamSize = extractNoteValue(lead.callNotes, "Team size");
  const existingSession = lead.onboardingSession;

  const onboardingSession =
    existingSession ??
    (await prisma.onboardingSession.create({
      data: {
        leadId: lead.id,
        bdmId: user.id,
        clientId: await generateClientId(),
        status: "COLLECTING",
        companyData: {
          name: lead.company ?? lead.name,
          industry: companyType,
          contactName: lead.name,
          email: lead.email,
          phone: lead.phone,
          location,
          employeeCount: Number(teamSize) || 1,
          description: callNoteText,
          callNotes: callNoteText,
        },
        challenges: {
          primary: lead.notes ?? "",
        },
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
        location,
        companyType,
        teamSize,
        callNotes: lead.callNotes.map((note) => ({
          id: note.id,
          content: note.content,
          createdAt: note.createdAt.toISOString(),
          authorName: note.author.name,
        })),
        resumeBanner: existingSession
          ? `Resuming your onboarding session for ${lead.company ?? lead.name}. You are at step ${Math.max(1, onboardingSession.step || 1)} of 7.`
          : null,
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
