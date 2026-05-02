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
      onboardingSession: true,
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
        },
      }}
    />
  );
}
