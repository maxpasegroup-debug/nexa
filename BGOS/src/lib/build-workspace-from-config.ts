import { Prisma } from "@prisma/client";
import { hash } from "bcryptjs";

import { generateClientId } from "@/lib/client-id";
import { saveNexaMemory } from "@/lib/nexa-brain";
import { previewToken, randomPassword } from "@/lib/onboarding-flow";
import { prisma } from "@/lib/prisma";

type EmployeeConfig = {
  name?: string;
  title?: string;
  email?: string;
  phone?: string;
  reportsTo?: string;
  systemRole?: string;
  assignedPipelines?: string[];
  operatingProcedures?: string;
  dailyTasks?: string[];
  decisionAuthority?: string[];
};

type PipelineConfig = {
  name?: string;
  productName?: string;
  stages?: string[];
  visibleTo?: string[];
  slaDays?: Record<string, number>;
};

type WorkspaceConfigSummary = {
  company?: {
    name?: string;
    industry?: string;
    location?: string;
    employeeCount?: number;
  };
  employees?: EmployeeConfig[];
  pipelines?: PipelineConfig[];
  starterTasks?: string[];
  customInsights?: string[];
  operatingRules?: unknown[];
  automations?: unknown[];
  nexaConfig?: Record<string, unknown>;
};

function jsonArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function normalizeRole(value: string | undefined) {
  const role = value?.toUpperCase();
  if (role === "BOSS" || role === "BDM" || role === "SDE" || role === "OWNER" || role === "ADMIN") return role;
  return "BDM";
}

export async function buildWorkspaceFromConfig(sessionId: string) {
  const session = await prisma.onboardingSession.findUnique({
    where: { id: sessionId },
    include: {
      lead: true,
      employees: true,
    },
  });

  if (!session?.summaryJson) {
    throw new Error("Onboarding summary JSON is required before building a workspace.");
  }

  const config = session.summaryJson as WorkspaceConfigSummary;
  const companyData = session.companyData as Record<string, unknown>;
  const companyName =
    config.company?.name ||
    String(companyData.name ?? "") ||
    session.lead?.company ||
    session.lead?.name ||
    "Client workspace";
  const industry = config.company?.industry || String(companyData.industry ?? "") || "Business";
  const location = config.company?.location || String(companyData.location ?? "") || "";
  const pipelines = config.pipelines?.length
    ? config.pipelines
    : jsonArray<PipelineConfig>(session.pipelineData);
  const employees: EmployeeConfig[] = config.employees?.length
    ? config.employees
    : session.employees.map((employee) => ({
        name: employee.name,
        title: employee.title,
        email: employee.email,
        phone: employee.phone ?? undefined,
        systemRole: employee.systemRole,
        assignedPipelines: jsonArray<string>(employee.assignedPipelines),
        operatingProcedures: employee.operatingProcedures ?? undefined,
      }));
  const bossEmail = session.lead?.email?.toLowerCase() || employees[0]?.email?.toLowerCase() || `preview-${session.id}@bgos.online`;
  const bossName = session.lead?.name || employees[0]?.name || companyName;

  const business = await prisma.business.create({
    data: {
      clientId: await generateClientId(),
      name: companyName,
      type: industry,
      teamSize: String(config.company?.employeeCount ?? (employees.length || 1)),
      goal: String(companyData.challenge ?? "") || "Configured intelligent onboarding workspace",
      healthScore: 60,
    },
  });

  const token = previewToken();
  const lead = await prisma.onboardingLead.create({
    data: {
      name: bossName,
      email: bossEmail,
      phone: session.lead?.phone ?? "Not provided",
      companyName,
      employeeCount: String(config.company?.employeeCount ?? (employees.length || 1)),
      businessType: industry,
      challenge: String(companyData.challenge ?? ""),
      status: "SDE_DELIVERED",
      assignedBDMId: session.bdmId,
      assignedSDEId: session.sdeId,
      bdmNotes: session.bdmNotes,
      sdeNotes: "Approved from intelligent onboarding session.",
      selectedPlan: session.selectedPlan ?? "GROWTH",
      businessId: business.id,
      nexaSessionId: token,
      bdmSubmittedAt: session.submittedAt,
      sdeDeliveredAt: new Date(),
    },
  });

  const teamRoles: EmployeeConfig[] = employees.length
    ? employees
    : [{ name: bossName, email: bossEmail, title: "Owner", systemRole: "BOSS" }];
  if (!teamRoles.some((employee) => normalizeRole(employee.systemRole) === "BOSS")) {
    teamRoles.unshift({ name: bossName, email: bossEmail, title: "Owner", systemRole: "BOSS" });
  }

  const passwordHashes = await Promise.all(
    teamRoles.map(async (employee) => ({
      email: (employee.email || bossEmail).toLowerCase(),
      hash: await hash(randomPassword(), 12),
    })),
  );
  const passwordByEmail = new Map(passwordHashes.map((item) => [item.email, item.hash]));

  await prisma.$transaction([
    prisma.workspaceConfig.create({
      data: {
        onboardingLeadId: lead.id,
        businessId: business.id,
        companyName,
        products: pipelines as Prisma.InputJsonValue,
        teamRoles: teamRoles as Prisma.InputJsonValue,
        pipelines: pipelines as Prisma.InputJsonValue,
        nexaConfig: {
          ...config.nexaConfig,
          summary: session.summaryJson,
          plan: session.selectedPlan ?? "GROWTH",
          planReason: session.planReason,
          customWelcomeMessage: `Welcome to ${companyName}. NEXA is ready with your ${industry} workspace context.`,
          operatingRules: config.operatingRules ?? [],
          automations: config.automations ?? [],
        } as Prisma.InputJsonValue,
        sdeBuiltBy: session.sdeId ?? session.approvedBy ?? "",
        status: "delivered",
        deliveredAt: new Date(),
      },
    }),
    ...pipelines.map((pipeline) =>
      prisma.pipeline.create({
        data: {
          businessId: business.id,
          name: pipeline.name || `${pipeline.productName ?? "Sales"} Pipeline`,
          productName: pipeline.productName || pipeline.name || "Sales",
          stages: pipeline.stages?.length ? pipeline.stages : ["New", "Contacted", "Demo", "Proposal", "Won", "Lost"],
          visibleTo: pipeline.visibleTo ?? [],
          slaDays: pipeline.slaDays ?? {},
        },
      }),
    ),
    prisma.businessSnapshot.create({
      data: {
        businessId: business.id,
        healthScore: 60,
        totalLeads: 0,
        newLeads: 0,
        wonLeads: 0,
        lostLeads: 0,
        totalRevenue: 0,
        teamActivity: 0,
        openTasks: 0,
        openBugs: 0,
        nexaActionsCount: 0,
      },
    }),
    ...teamRoles.map((employee) =>
      prisma.user.upsert({
        where: { email: (employee.email || bossEmail).toLowerCase() },
        create: {
          name: employee.name || employee.email || "Team member",
          email: (employee.email || bossEmail).toLowerCase(),
          password: passwordByEmail.get((employee.email || bossEmail).toLowerCase())!,
          role: normalizeRole(employee.systemRole),
          businessId: business.id,
          defaultPassword: true,
          active: false,
        },
        update: {
          name: employee.name || employee.email || "Team member",
          role: normalizeRole(employee.systemRole),
          businessId: business.id,
          defaultPassword: true,
          active: false,
        },
      }),
    ),
    prisma.workspaceTemplate.create({
      data: {
        name: `${companyName} ${industry} workspace`,
        industry,
        description: `Template generated from ${companyName} onboarding.`,
        config: session.summaryJson as Prisma.InputJsonValue,
        createdFrom: session.id,
        createdBy: session.sdeId ?? session.approvedBy ?? "",
        isPublic: false,
      },
    }),
  ]);

  const boss = await prisma.user.findFirst({ where: { businessId: business.id, role: "BOSS" } });
  const starterTasks = config.starterTasks?.length
    ? config.starterTasks
    : ["Review your workspace", "Invite your leadership team", "Check pipeline stages", "Ask NEXA for today's priorities", "Confirm subscription settings"];

  if (boss) {
    await prisma.task.createMany({
      data: starterTasks.slice(0, 5).map((title) => ({
        title,
        description: `Starter setup task for ${companyName}`,
        assignedTo: boss.id,
      })),
    });
  }

  await prisma.nexaInsight.createMany({
    data: (config.customInsights?.length ? config.customInsights : [
      `${companyName} workspace is ready for preview.`,
      `Pipelines and team roles have been configured for ${industry}.`,
      "Trial activation will unlock employee accounts and live reporting.",
    ]).slice(0, 3).map((message) => ({
      businessId: business.id,
      type: "onboarding",
      message,
      action: "Review workspace",
    })),
  });

  await Promise.all([
    prisma.nexaSchedule.createMany({
      data: [
        { businessId: business.id, type: "morning_briefing", cronExpr: "0 8 * * *", nextRunAt: new Date(Date.now() + 24 * 60 * 60 * 1000), meta: { timezone: "Asia/Kolkata" } },
        { businessId: business.id, type: "daily_snapshot", cronExpr: "0 22 * * *", nextRunAt: new Date(Date.now() + 24 * 60 * 60 * 1000), meta: { timezone: "Asia/Kolkata" } },
      ],
    }),
    prisma.business.update({
      where: { id: business.id },
      data: {
        type: industry,
        teamSize: String(config.company?.employeeCount ?? (employees.length || 1)),
        goal: location ? `${industry} business in ${location}` : undefined,
      },
    }),
    saveNexaMemory(business.id, "workspace_context", {
      companyName,
      industry,
      location,
      teamSize: config.company?.employeeCount ?? employees.length,
      pipelines,
      operatingRules: config.operatingRules ?? [],
    } as Prisma.InputJsonValue),
    saveNexaMemory(business.id, "intelligent_onboarding_summary", {
      sessionId,
      summary: session.summaryJson,
      plan: session.selectedPlan ?? "GROWTH",
    } as Prisma.InputJsonValue),
  ]);

  return { success: true, businessId: business.id, previewToken: token };
}
