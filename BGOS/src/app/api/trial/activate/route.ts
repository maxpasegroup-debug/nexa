import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

import { calcFirstSale } from "@/lib/commission";
import { sendEmail } from "@/lib/email";
import { addDays, getInternalBusiness, getString, planMonthlyAmount } from "@/lib/onboarding-flow";
import { prisma } from "@/lib/prisma";
import { sendEmployeeWelcomeEmails } from "@/lib/welcome-emails";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const businessId = getString(body.businessId);
    const planType = (getString(body.plan) || getString(body.planType)).toUpperCase() || "STARTER";
    const razorpayMandateId = getString(body.razorpayMandateId);
    const razorpayCustomerId = getString(body.razorpayCustomerId);
    const name = getString(body.name);
    const email = getString(body.email).toLowerCase();
    const password = getString(body.password);

    if (!businessId || !planType || !razorpayMandateId) {
      return NextResponse.json(
        { error: "businessId, plan, and razorpayMandateId are required." },
        { status: 400 },
      );
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        users: true,
        onboardingLead: {
          include: {
            assignedBDM: { select: { id: true, name: true, email: true, businessId: true } },
          },
        },
      },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found." }, { status: 404 });
    }

    const trialStartedAt = new Date();
    const trialEndsAt = addDays(7);
    const monthlyAmount = planMonthlyAmount(planType);
    const bossEmail = email || business.onboardingLead?.email?.toLowerCase();
    const boss = bossEmail
      ? await prisma.user.findFirst({ where: { businessId, email: bossEmail } })
      : await prisma.user.findFirst({ where: { businessId, role: "BOSS" } });

    if (!boss) {
      return NextResponse.json({ error: "Boss account not found." }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.trialSubscription.upsert({
        where: { businessId },
        create: {
          businessId,
          plan: planType,
          trialStartedAt,
          trialEndsAt,
          autoPayEnabled: true,
          razorpayMandateId,
          razorpayCustomerId,
          monthlyAmount,
        },
        update: {
          plan: planType,
          trialStartedAt,
          trialEndsAt,
          autoPayEnabled: true,
          razorpayMandateId,
          razorpayCustomerId,
          monthlyAmount,
          status: "TRIAL",
          cancelledAt: null,
          cancelReason: null,
        },
      }),
      prisma.user.updateMany({
        where: { businessId },
        data: { active: true },
      }),
      prisma.user.update({
        where: { id: boss.id },
        data: {
          name: name || boss.name,
          email: bossEmail ?? boss.email,
          ...(password ? { password: await hash(password, 12), defaultPassword: false } : {}),
          active: true,
        },
      }),
      ...(business.onboardingLead
        ? [
            prisma.onboardingLead.update({
              where: { id: business.onboardingLead.id },
              data: {
                status: "TRIAL_ACTIVE",
                selectedPlan: planType,
                trialActivated: true,
                trialStartedAt,
                trialEndsAt,
                razorpayMandateId,
                razorpayCustomerId,
              },
            }),
          ]
        : []),
    ]);

    const template = await prisma.workspaceTemplate.findFirst({
      where: { name: { startsWith: business.name } },
      orderBy: { createdAt: "desc" },
      select: { createdFrom: true },
    });
    if (template?.createdFrom) {
      await prisma.onboardingSession.update({
        where: { id: template.createdFrom },
        data: { status: "TRIAL_ACTIVE" },
      }).catch(() => null);
    }

    const internalBusiness = await getInternalBusiness();
    await Promise.allSettled([
      sendEmployeeWelcomeEmails(businessId),
      business.onboardingLead?.assignedBDM
        ? sendEmail({
            to: business.onboardingLead.assignedBDM.email,
            toName: business.onboardingLead.assignedBDM.name,
            subject: `${business.name} activated their BGOS trial`,
            html: `<p>${business.name} has activated their trial. Commission is pending. ₹${calcFirstSale(planType).toLocaleString("en-IN")} will be triggered on conversion.</p>`,
          })
        : Promise.resolve(false),
      internalBusiness
        ? prisma.nexaInsight.create({
            data: {
              businessId: internalBusiness.id,
              type: "opportunity",
              message: `${business.name} trial activated - ${planType} plan. Converts on ${trialEndsAt.toLocaleDateString("en-IN")}. Watch for churn signals.`,
              action: "Monitor trial",
            },
          })
        : Promise.resolve(null),
    ]);

    return NextResponse.json({
      success: true,
      businessId,
      dashboardUrl: "/boss",
      trialEndsAt: trialEndsAt.toISOString(),
      monthlyAmount,
    });
  } catch (error) {
    console.error("[trial:activate]", error);
    return NextResponse.json(
      { error: "Unable to activate trial." },
      { status: 500 },
    );
  }
}
