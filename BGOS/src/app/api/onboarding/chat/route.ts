import { NextResponse } from "next/server";

import auth from "@/lib/auth";
import { createChatCompletionText } from "@/lib/openai";
import { prisma } from "@/lib/prisma";

const NEXA_SYSTEM_PROMPT =
  "You are NEXA, the AI CEO of BGOS. You are onboarding a new business owner. You are warm, confident, and speak like a smart Indian business consultant — not like a robot. Keep responses short, 1-3 sentences max. Ask only one question at a time. The 5 steps are: Step 0: Welcome them and ask what kind of business they run. Step 1: Ask how many people are on their team. Step 2: Ask what their biggest business challenge is right now. Step 3: Ask which city they are based in. Step 4: Tell them their business HQ is ready and give them one specific insight based on their answers. Make it feel magical.";

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

function buildMessages(answers: OnboardingAnswers) {
  return Object.entries(answers)
    .sort(([stepA], [stepB]) => Number(stepA) - Number(stepB))
    .map(([step, answer]) => ({
      role: "user" as const,
      content: `Step ${step} answer: ${answer}`,
    }));
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { step, answer } = await request.json();

    if (typeof step !== "number" || typeof answer !== "string") {
      return NextResponse.json(
        { error: "Step and answer are required." },
        { status: 400 },
      );
    }

    const onboardingSession = await prisma.onboardingSession.upsert({
      where: { userId: session.user.id },
      update: {},
      create: { userId: session.user.id },
    });
    const answers = toAnswers(onboardingSession.answers);
    const nextStep = step + 1;
    const completed = nextStep >= 5;
    const updatedAnswers = {
      ...answers,
      [String(step)]: answer,
    };

    await prisma.onboardingSession.update({
      where: { userId: session.user.id },
      data: {
        step: nextStep,
        answers: updatedAnswers,
        completed,
      },
    });

    const text = await createChatCompletionText({
      maxTokens: 220,
      system: NEXA_SYSTEM_PROMPT,
      messages: buildMessages(updatedAnswers),
    });
    const nextMessage =
      text || "Your business HQ is ready. Let us move forward.";

    return NextResponse.json({
      nextMessage,
      nextStep,
      completed,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to continue onboarding." },
      { status: 500 },
    );
  }
}
