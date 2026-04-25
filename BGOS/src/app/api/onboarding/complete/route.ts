import { NextResponse } from "next/server";

import auth from "@/lib/auth";
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

    return NextResponse.json({ businessId: business.id });
  } catch {
    return NextResponse.json(
      { error: "Unable to complete onboarding." },
      { status: 500 },
    );
  }
}
