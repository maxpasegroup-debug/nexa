import { Prisma } from "@prisma/client";

import {
  calculateCompleteness,
  generateNexaResponse,
  normalizeEmployee,
  normalizePipeline,
} from "@/lib/nexa-onboarding-engine";
import {
  asRecord,
  jsonArray,
  jsonError,
  requireSessionUser,
  syncEmployeeData,
} from "@/lib/onboarding-session-server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function mergeUnique(current: unknown, additions: string[]) {
  return Array.from(new Set([...jsonArray<string>(current), ...additions]));
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { error, user } = await requireSessionUser(["BDM"]);
    if (error) return error;

    const body = (await request.json()) as Record<string, unknown>;
    const message = getString(body.message);
    if (!message) return jsonError("message is required.");

    const session = await prisma.onboardingSession.findFirst({
      where: { id: params.id, bdmId: user.id },
      include: {
        lead: true,
        bdm: { select: { id: true, name: true, email: true, businessId: true } },
        employees: true,
        pipelines: true,
      },
    });
    if (!session) return jsonError("Session not found.", 404);

    const nexa = await generateNexaResponse(
      session,
      message,
      session.currentStep,
    );
    const extracted = asRecord(nexa.updatedData);

    const company = asRecord(extracted.company);
    const nextCompanyData = Object.keys(company).length
      ? { ...asRecord(session.companyData), ...company }
      : asRecord(session.companyData);

    const employee = asRecord(extracted.employee);
    if (Object.keys(employee).length) {
      const normalized = normalizeEmployee(employee);
      if (normalized.id) {
        await prisma.onboardingEmployee.update({
          where: { id: normalized.id, sessionId: session.id },
          data: {
            fullName: normalized.fullName,
            name: normalized.name,
            title: normalized.title,
            email: normalized.email,
            phone: normalized.phone,
            reportsTo: normalized.reportsTo,
            bgosRole: normalized.bgosRole,
            systemRole: normalized.systemRole,
            assignedPipelines:
              normalized.assignedPipelines as Prisma.InputJsonValue,
            operatingProcedures: normalized.operatingProcedures,
            decisionAuthority:
              normalized.decisionAuthority as Prisma.InputJsonValue,
          },
        });
      } else {
        await prisma.onboardingEmployee.create({
          data: {
            sessionId: session.id,
            fullName: normalized.fullName,
            name: normalized.name,
            title: normalized.title,
            email: normalized.email,
            phone: normalized.phone,
            reportsTo: normalized.reportsTo,
            bgosRole: normalized.bgosRole,
            systemRole: normalized.systemRole,
            assignedPipelines:
              normalized.assignedPipelines as Prisma.InputJsonValue,
            operatingProcedures: normalized.operatingProcedures,
            decisionAuthority:
              normalized.decisionAuthority as Prisma.InputJsonValue,
          },
        });
      }
    }

    const pipeline = asRecord(extracted.pipeline);
    if (Object.keys(pipeline).length) {
      const normalized = normalizePipeline(pipeline);
      if (normalized.id) {
        await prisma.onboardingPipeline.update({
          where: { id: normalized.id, sessionId: session.id },
          data: {
            name: normalized.name,
            productName: normalized.productName,
            stages: normalized.stages as Prisma.InputJsonValue,
            slaRules: normalized.slaRules as Prisma.InputJsonValue,
            visibleTo: normalized.visibleTo as Prisma.InputJsonValue,
            color: normalized.color,
          },
        });
      } else {
        await prisma.onboardingPipeline.create({
          data: {
            sessionId: session.id,
            name: normalized.name,
            productName: normalized.productName,
            stages: normalized.stages as Prisma.InputJsonValue,
            slaRules: normalized.slaRules as Prisma.InputJsonValue,
            visibleTo: normalized.visibleTo as Prisma.InputJsonValue,
            color: normalized.color,
          },
        });
      }
    }

    const rules = jsonArray(extracted.rules);
    const challenges = asRecord(extracted.challenges);
    const nexaConfig = asRecord(extracted.nexaConfig);

    const fresh = await prisma.onboardingSession.findUnique({
      where: { id: session.id },
      include: { employees: true, pipelines: true, lead: true, bdm: true },
    });
    if (!fresh) return jsonError("Session not found.", 404);

    const operatingRules = [...jsonArray(fresh.operatingRules), ...rules];
    const completeness = calculateCompleteness({
      ...fresh,
      companyData: nextCompanyData,
      operatingRules,
      challenges: Object.keys(challenges).length
        ? { ...asRecord(fresh.challenges), ...challenges }
        : fresh.challenges,
    });
    const nexaMessages = [
      ...jsonArray(fresh.nexaMessages),
      { role: "user", content: message, createdAt: new Date().toISOString() },
      {
        role: "assistant",
        content: nexa.response,
        createdAt: new Date().toISOString(),
      },
    ];

    const updated = await prisma.onboardingSession.update({
      where: { id: session.id },
      data: {
        companyData: nextCompanyData as Prisma.InputJsonValue,
        operatingRules: operatingRules as Prisma.InputJsonValue,
        challenges: Object.keys(challenges).length
          ? ({ ...asRecord(fresh.challenges), ...challenges } as Prisma.InputJsonValue)
          : undefined,
        nexaConfig: Object.keys(nexaConfig).length
          ? ({ ...asRecord(fresh.nexaConfig), ...nexaConfig } as Prisma.InputJsonValue)
          : undefined,
        currentStep: nexa.nextStep,
        nexaMessages: nexaMessages as Prisma.InputJsonValue,
        nexaFlags: mergeUnique(fresh.nexaFlags, nexa.newFlags) as Prisma.InputJsonValue,
        nexaSuggestions: mergeUnique(
          fresh.nexaSuggestions,
          nexa.suggestions,
        ) as Prisma.InputJsonValue,
        completenessScore: completeness.score,
        completenessBreakdown: completeness.breakdown as Prisma.InputJsonValue,
        canSubmit: completeness.canSubmit,
        submissionBlocked: completeness.blocked,
      },
      include: {
        employees: true,
        pipelines: true,
      },
    });

    await syncEmployeeData(session.id);
    const pipelineData = updated.pipelines.map((item) => ({
      id: item.id,
      name: item.name,
      productName: item.productName,
      stages: item.stages,
      slaDays: item.slaRules,
      visibleTo: item.visibleTo,
      color: item.color,
    }));
    await prisma.onboardingSession.update({
      where: { id: session.id },
      data: { pipelineData: pipelineData as Prisma.InputJsonValue },
    });

    return Response.json({
      message: nexa.response,
      completeness,
      canSubmit: completeness.canSubmit,
      blocked: completeness.blocked,
      flags: mergeUnique(fresh.nexaFlags, nexa.newFlags),
      suggestions: mergeUnique(fresh.nexaSuggestions, nexa.suggestions),
      step: nexa.nextStep,
      session: updated,
    });
  } catch (error) {
    console.error("[onboarding-session:chat]", error);
    return jsonError("Unable to process NEXA message.", 500);
  }
}
