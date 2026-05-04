import { Prisma } from "@prisma/client";

import {
  calculateCompleteness,
  normalizeEmployee,
  normalizePipeline,
} from "@/lib/nexa-onboarding-engine";
import {
  asRecord,
  jsonArray,
  jsonError,
  getOwnedOnboardingSession,
  requireSessionUser,
  syncEmployeeData,
} from "@/lib/onboarding-session-server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function mergeRecord(current: unknown, next: Record<string, unknown>) {
  return { ...asRecord(current), ...next };
}

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function planFromTeamSize(value: unknown) {
  const raw = getString(value);
  const numeric = typeof value === "number" ? value : Number(raw.match(/\d+/)?.[0] ?? 0);

  if (raw.includes("50+") || numeric > 50) return "ENTERPRISE";
  if (raw.includes("16-50") || (numeric >= 16 && numeric <= 50)) return "SCALE";
  if (raw.includes("4-15") || (numeric >= 4 && numeric <= 15)) return "GROWTH";
  if (raw.includes("1-3") || (numeric >= 1 && numeric <= 3)) return "STARTER";
  return undefined;
}

async function upsertEmployees(sessionId: string, employeesInput: unknown) {
  const employees = jsonArray<Record<string, unknown>>(employeesInput);

  for (const employee of employees) {
    const normalized = normalizeEmployee(employee);
    const existing = normalized.id
      ? null
      : await prisma.onboardingEmployee.findFirst({
          where: {
            sessionId,
            OR: [
              normalized.email ? { email: normalized.email } : undefined,
              normalized.fullName ? { name: normalized.fullName } : undefined,
            ].filter(Boolean) as Prisma.OnboardingEmployeeWhereInput[],
          },
        });
    const employeeId = normalized.id || existing?.id;
    const data = {
      fullName: normalized.fullName,
      name: normalized.name,
      title: normalized.title,
      email: normalized.email,
      phone: normalized.phone,
      reportsTo: normalized.reportsTo,
      bgosRole: normalized.bgosRole,
      systemRole: normalized.systemRole,
      assignedPipelines: normalized.assignedPipelines as Prisma.InputJsonValue,
      operatingProcedures: normalized.operatingProcedures,
      decisionAuthority: normalized.decisionAuthority as Prisma.InputJsonValue,
    };

    if (employeeId) {
      await prisma.onboardingEmployee.update({
        where: { id: employeeId, sessionId },
        data,
      });
    } else {
      await prisma.onboardingEmployee.create({
        data: { sessionId, ...data },
      });
    }
  }

  await syncEmployeeData(sessionId);
}

async function upsertPipeline(sessionId: string, pipelineInput: unknown) {
  const pipelines = jsonArray<Record<string, unknown>>(pipelineInput);

  for (const pipeline of pipelines) {
    const normalized = normalizePipeline(pipeline);
    const existing = normalized.id
      ? null
      : await prisma.onboardingPipeline.findFirst({
          where: {
            sessionId,
            OR: [
              { name: normalized.name },
              { productName: normalized.productName },
            ],
          },
        });
    const pipelineId = normalized.id || existing?.id;
    const data = {
      name: normalized.name,
      productName: normalized.productName,
      stages: normalized.stages as Prisma.InputJsonValue,
      slaRules: normalized.slaRules as Prisma.InputJsonValue,
      visibleTo: normalized.visibleTo as Prisma.InputJsonValue,
      color: normalized.color,
    };

    if (pipelineId) {
      await prisma.onboardingPipeline.update({
        where: { id: pipelineId, sessionId },
        data,
      });
    } else {
      await prisma.onboardingPipeline.create({
        data: { sessionId, ...data },
      });
    }
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { error, user } = await requireSessionUser(["BDM"]);
    if (error) return error;

    const body = (await request.json()) as Record<string, unknown>;
    const sectionNumber = Number(body.sectionNumber);
    const data = asRecord(body.data);
    if (!Number.isInteger(sectionNumber) || sectionNumber < 1 || sectionNumber > 10) {
      return jsonError("sectionNumber must be between 1 and 10.");
    }

    const session = await getOwnedOnboardingSession(
      params.id,
      user.id,
      user.role,
      user.businessId,
    );
    if (!session) return jsonError("Session not found.", 404);

    const currentCompanyData = asRecord(session.companyData);
    let companyData = currentCompanyData;
    let nexaConfig = asRecord(session.nexaConfig);
    let challenges = asRecord(session.challenges);
    let selectedPlan = session.selectedPlan;

    if (sectionNumber === 1) {
      companyData = mergeRecord(companyData, data);
    }

    if (sectionNumber === 2) {
      companyData = mergeRecord(companyData, {
        products: data.products ?? data.products_services ?? data.services,
        services: data.services ?? data.products_services ?? data.products,
      });
    }

    if (sectionNumber === 3) {
      companyData = mergeRecord(companyData, {
        targetCustomers: data.targetCustomers ?? data.target_customers ?? data.customers,
      });
    }

    if (sectionNumber === 4) {
      companyData = mergeRecord(companyData, {
        leadSources: data.leadSources ?? data.lead_sources,
        salesPipeline: data.salesPipeline ?? data.sales_process ?? data.salesFlow,
        followUpStyle: data.followUpStyle ?? data.follow_up_style,
      });
      await upsertPipeline(params.id, data.salesPipeline ?? data.pipelines ?? data.pipelineData ?? []);
    }

    if (sectionNumber === 5) {
      companyData = mergeRecord(companyData, {
        whoHandlesLeads: data.whoHandlesLeads,
        whoFollowsUp: data.whoFollowsUp,
        whoCloses: data.whoCloses,
      });
    }

    if (sectionNumber === 6) {
      nexaConfig = mergeRecord(nexaConfig, {
        bossDashboard: data.bossDashboard,
        employeeDashboard: data.employeeDashboard,
      });
    }

    if (sectionNumber === 7) {
      nexaConfig = mergeRecord(nexaConfig, {
        modules: data.modules,
      });
    }

    if (sectionNumber === 8) {
      await upsertEmployees(params.id, data.employees ?? data.employeeData ?? []);
    }

    if (sectionNumber === 9) {
      const teamSize = data.teamSize ?? data.employeeCount ?? data.size;
      selectedPlan = getString(data.planAutoSelected) || planFromTeamSize(teamSize) || selectedPlan;
      companyData = mergeRecord(companyData, {
        teamSize,
        employeeCount: teamSize,
        planAutoSelected: selectedPlan,
      });
    }

    if (sectionNumber === 10) {
      challenges = mergeRecord(challenges, {
        futureNeeds: data.futureNeeds ?? data.future_needs ?? data,
      });
    }

    await prisma.onboardingSession.update({
      where: { id: params.id },
      data: {
        companyData: companyData as Prisma.InputJsonValue,
        nexaConfig: nexaConfig as Prisma.InputJsonValue,
        challenges: challenges as Prisma.InputJsonValue,
        selectedPlan,
        currentStep: `section-${sectionNumber}`,
      },
    });

    const fresh = await getOwnedOnboardingSession(
      params.id,
      user.id,
      user.role,
      user.businessId,
    );
    if (!fresh) return jsonError("Session not found.", 404);

    const completeness = calculateCompleteness(fresh);
    const updated = await prisma.onboardingSession.update({
      where: { id: params.id },
      data: {
        completenessScore: completeness.score,
        completenessBreakdown: completeness.breakdown as Prisma.InputJsonValue,
        canSubmit: completeness.score >= 60,
        submissionBlocked:
          completeness.score >= 60 ? null : "Minimum 60% completeness required before submission.",
      },
      include: {
        employees: true,
        pipelines: true,
      },
    });

    return Response.json({
      success: true,
      session: updated,
      score: completeness.score,
    });
  } catch (error) {
    console.error("[onboarding-session:section]", error);
    return jsonError("Unable to save onboarding section.", 500);
  }
}
