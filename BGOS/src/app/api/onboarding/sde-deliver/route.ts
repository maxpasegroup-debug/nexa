import { Prisma } from "@prisma/client";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

import auth from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import {
  addDays,
  getString,
  planMonthlyAmount,
  previewToken,
  previewUrl,
  randomPassword,
} from "@/lib/onboarding-flow";
import { saveNexaMemory } from "@/lib/nexa-brain";
import { prisma } from "@/lib/prisma";

type ProductConfig = {
  name: string;
  pipelineStages: string[];
  color?: string;
  visibleToRoles?: string[];
  slaDays?: Record<string, number>;
};

type WorkspacePayload = {
  companyName: string;
  products: ProductConfig[];
  teamRoles: Array<{
    displayName: string;
    systemRole: string;
    assignedProducts: string[];
  }>;
  nexaPersonality: string;
  customInsights: string[];
  starterTasks: string[];
};

function isWorkspacePayload(value: unknown): value is WorkspacePayload {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.companyName === "string" &&
    Array.isArray(record.products) &&
    Array.isArray(record.teamRoles)
  );
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "SDE") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const onboardingLeadId = getString(body.onboardingLeadId);
    const notes = getString(body.notes);
    const workspaceConfig = body.workspaceConfig;

    if (!onboardingLeadId || !isWorkspacePayload(workspaceConfig)) {
      return NextResponse.json(
        { error: "onboardingLeadId and workspaceConfig are required." },
        { status: 400 },
      );
    }

    const lead = await prisma.onboardingLead.findFirst({
      where: { id: onboardingLeadId, assignedSDEId: session.user.id },
      include: {
        assignedBDM: { select: { name: true, email: true } },
      },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    }

    const token = previewToken();
    const password = randomPassword();
    const hashedPassword = await hash(password, 12);
    const trialStartedAt = new Date();
    const trialEndsAt = addDays(14);
    const selectedPlan = lead.selectedPlan ?? "STARTER";

    const business = await prisma.business.create({
      data: {
        name: workspaceConfig.companyName,
        type: lead.businessType,
        teamSize: lead.employeeCount,
        goal: lead.challenge ?? "Configured onboarding workspace",
        healthScore: 65,
      },
    });

    const boss = await prisma.user.upsert({
      where: { email: lead.email.toLowerCase() },
      create: {
        name: lead.name,
        email: lead.email.toLowerCase(),
        password: hashedPassword,
        role: "BOSS",
        businessId: business.id,
        defaultPassword: true,
      },
      update: {
        name: lead.name,
        password: hashedPassword,
        role: "BOSS",
        businessId: business.id,
        defaultPassword: true,
      },
    });

    const pipelinesPayload = workspaceConfig.products.map((product) => ({
      name: product.name,
      stages: product.pipelineStages,
      color: product.color ?? "#7C6FFF",
      visibleTo: product.visibleToRoles ?? [],
      slaDays: product.slaDays ?? {},
    }));

    const [, savedWorkspace] = await prisma.$transaction([
      prisma.onboardingLead.update({
        where: { id: lead.id },
        data: {
          status: "SDE_DELIVERED",
          sdeNotes: notes || undefined,
          sdeDeliveredAt: new Date(),
          businessId: business.id,
          nexaSessionId: token,
        },
      }),
      prisma.workspaceConfig.create({
        data: {
          onboardingLeadId: lead.id,
          businessId: business.id,
          companyName: workspaceConfig.companyName,
          products: workspaceConfig.products as unknown as Prisma.InputJsonValue,
          teamRoles: workspaceConfig.teamRoles as unknown as Prisma.InputJsonValue,
          pipelines: pipelinesPayload as Prisma.InputJsonValue,
          nexaConfig: {
            personality: workspaceConfig.nexaPersonality,
            customInsights: workspaceConfig.customInsights,
            starterTasks: workspaceConfig.starterTasks,
          },
          sdeBuiltBy: session.user.id,
          status: "delivered",
          deliveredAt: new Date(),
        },
      }),
      prisma.trialSubscription.create({
        data: {
          businessId: business.id,
          plan: selectedPlan,
          trialStartedAt,
          trialEndsAt,
          monthlyAmount: planMonthlyAmount(selectedPlan),
          razorpayMandateId: lead.razorpayMandateId,
          razorpayCustomerId: lead.razorpayCustomerId,
        },
      }),
      ...workspaceConfig.products.map((product) =>
        prisma.pipeline.create({
          data: {
            businessId: business.id,
            name: `${product.name} Pipeline`,
            productName: product.name,
            color: product.color ?? "#7C6FFF",
            stages: product.pipelineStages,
            visibleTo: product.visibleToRoles ?? [],
            slaDays: product.slaDays ?? {},
          },
        }),
      ),
    ]);

    await saveNexaMemory(business.id, "workspace_config", {
      companyName: workspaceConfig.companyName,
      products: workspaceConfig.products,
      teamRoles: workspaceConfig.teamRoles,
      nexaPersonality: workspaceConfig.nexaPersonality,
      customInsights: workspaceConfig.customInsights,
      starterTasks: workspaceConfig.starterTasks,
      builtBy: session.user.id,
      onboardingLeadId: lead.id,
    } as Prisma.InputJsonValue);

    await Promise.allSettled([
      sendEmail({
        to: lead.email,
        toName: lead.name,
        subject: `Your BGOS workspace is ready - ${workspaceConfig.companyName}`,
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.7">
            <h1>Your BGOS workspace is ready</h1>
            <p>Hi ${lead.name},</p>
            <p>Your workspace has been personally configured by our technical team.</p>
            <p><strong>Pipelines:</strong> ${workspaceConfig.products.map((item) => item.name).join(", ")}</p>
            <p><strong>Team roles:</strong> ${workspaceConfig.teamRoles.map((item) => item.displayName).join(", ")}</p>
            <p><strong>NEXA configuration:</strong> ${workspaceConfig.nexaPersonality}</p>
            <p><a href="${previewUrl(token)}" style="display:inline-block;background:#7C6FFF;color:white;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:bold;">Preview your workspace</a></p>
            <p>To activate your team and start your free trial, log in and click Start Free Trial.</p>
            <p><strong>Temporary password:</strong> ${password}</p>
          </div>
        `,
      }),
      lead.assignedBDM
        ? sendEmail({
            to: lead.assignedBDM.email,
            toName: lead.assignedBDM.name,
            subject: `Workspace delivered - ${lead.companyName}`,
            html: `<p>Workspace delivered for <strong>${lead.companyName}</strong>. Follow up with the boss and walk them through it.</p>`,
          })
        : Promise.resolve(false),
    ]);

    return NextResponse.json({
      success: true,
      previewToken: token,
      previewUrl: previewUrl(token),
      businessId: business.id,
      bossUserId: boss.id,
      workspaceConfig: savedWorkspace,
    });
  } catch (error) {
    console.error("[onboarding:sde-deliver]", error);
    return NextResponse.json(
      { error: "Unable to deliver workspace." },
      { status: 500 },
    );
  }
}
