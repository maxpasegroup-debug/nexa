import { NextResponse } from "next/server";

import auth from "@/lib/auth";
import { generateClientId } from "@/lib/client-id";
import {
  generateNexaInsights,
  getBusinessContext,
  saveNexaMemory,
} from "@/lib/nexa-brain";
import { prisma } from "@/lib/prisma";

type OnboardingAnswers = Record<string, string>;

function toAnswers(value: unknown): OnboardingAnswers {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.entries(value).reduce<OnboardingAnswers>(
    (answers, [key, answer]) => {
      if (typeof answer === "string") {
        answers[key] = answer;
      }

      return answers;
    },
    {},
  );
}

function tomorrowAt8am() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(8, 0, 0, 0);
  return date;
}

function tonightAt11pm() {
  const date = new Date();
  date.setHours(23, 0, 0, 0);
  if (date <= new Date()) {
    date.setDate(date.getDate() + 1);
  }
  return date;
}

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const onboardingSession = await prisma.onboardingSession.findUnique({
      where: { userId: user.id },
    });

    if (!onboardingSession) {
      return NextResponse.json(
        { error: "Onboarding session not found." },
        { status: 404 },
      );
    }

    const answers = toAnswers(onboardingSession.answers);
    const business = await prisma.business.create({
      data: {
        clientId: await generateClientId(),
        name: `${user.name} business`,
        type: answers["0"] ?? "Business",
        teamSize: answers["1"] ?? "Not specified",
        goal: answers["2"] ?? "Grow the business",
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { businessId: business.id },
    });

    await prisma.onboardingSession.update({
      where: { userId: user.id },
      data: {
        completed: true,
        step: 5,
      },
    });

    await Promise.all([
      prisma.emailTemplate.createMany({
        data: [
          {
            businessId: business.id,
            name: "Post-demo follow up",
            category: "Sales",
            subject: "Following up on our demo — [Company Name]",
            body: "Hi [Name],\n\nThank you for taking the time to see our demo today. I wanted to follow up and see if you had any questions. We'd love to help [Company Name] grow with BGOS. Would you be available for a quick 15-minute call this week?\n\nLooking forward to hearing from you.",
          },
          {
            businessId: business.id,
            name: "Introduction",
            category: "Sales",
            subject: "Quick introduction — BGOS",
            body: "Hi [Name],\n\nI came across [Company Name] and thought BGOS could be a great fit for your team. We help Indian businesses automate their sales and operations with NEXA, our AI CEO. Would you be open to a quick demo this week? Takes just 20 minutes.",
          },
          {
            businessId: business.id,
            name: "Support received",
            category: "Support",
            subject: "We received your message",
            body: "Hi [Name],\n\nThank you for reaching out. We have received your message and our team will get back to you within 24 hours. If this is urgent, please reply to this email with URGENT in the subject line.",
          },
          {
            businessId: business.id,
            name: "Proposal follow up",
            category: "Sales",
            subject: "Checking in on our proposal",
            body: "Hi [Name],\n\nI wanted to follow up on the proposal we sent last week. Have you had a chance to review it? I am happy to answer any questions or adjust anything to better fit your needs. Let me know a good time to connect.",
          },
        ],
      }),
      prisma.businessSnapshot.create({
        data: {
          businessId: business.id,
          healthScore: 50,
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
      prisma.nexaSchedule.createMany({
        data: [
          {
            businessId: business.id,
            type: "morning_briefing",
            cronExpr: "0 8 * * *",
            nextRunAt: tomorrowAt8am(),
          },
          {
            businessId: business.id,
            type: "health_check",
            cronExpr: "*/30 * * * *",
            nextRunAt: new Date(Date.now() + 30 * 60 * 1000),
          },
          {
            businessId: business.id,
            type: "daily_snapshot",
            cronExpr: "0 23 * * *",
            nextRunAt: tonightAt11pm(),
          },
        ],
      }),
      saveNexaMemory(business.id, "onboarding_completed", true),
      prisma.nexaAction.create({
        data: {
          businessId: business.id,
          type: "business_setup",
          description: "NEXA has set up your business HQ",
          payload: { onboardingAnswers: answers },
        },
      }),
    ]);

    const context = await getBusinessContext(business.id);
    await generateNexaInsights(business.id, context);

    return NextResponse.json({ businessId: business.id });
  } catch {
    return NextResponse.json(
      { error: "Unable to complete onboarding." },
      { status: 500 },
    );
  }
}
