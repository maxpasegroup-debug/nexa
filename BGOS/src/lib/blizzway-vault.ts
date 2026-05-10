import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type BlizzwayVisionBoard = {
  sixMonths: string;
  oneYear: string;
  threeYears: string;
  fiveYears: string;
};

export type BlizzwayVaultPayload = {
  onboardingAnswers: Record<string, string>;
  digitalProfile: {
    stage: string;
    summary: string;
    strengths: string[];
  };
  dreamGoals: string[];
  visionBoard: BlizzwayVisionBoard;
  updatedAt: string;
};

const emptyVault: BlizzwayVaultPayload = {
  onboardingAnswers: {},
  digitalProfile: {
    stage: "",
    summary: "",
    strengths: [],
  },
  dreamGoals: [],
  visionBoard: {
    sixMonths: "",
    oneYear: "",
    threeYears: "",
    fiveYears: "",
  },
  updatedAt: "",
};

function vaultKey(userId: string) {
  return `blizzway:vault:${userId}`;
}

function getString(value: unknown) {
  return typeof value === "string" ? value.trim().slice(0, 2000) : "";
}

function getStringList(value: unknown) {
  return Array.isArray(value)
    ? value.map(getString).filter(Boolean).slice(0, 12)
    : [];
}

function sanitizeAnswers(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .map(([key, answer]) => [key.slice(0, 80), getString(answer)])
      .filter(([, answer]) => Boolean(answer)),
  );
}

export function sanitizeBlizzwayVaultPayload(value: unknown): BlizzwayVaultPayload {
  const input = value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
  const digitalProfile =
    input.digitalProfile && typeof input.digitalProfile === "object" && !Array.isArray(input.digitalProfile)
      ? (input.digitalProfile as Record<string, unknown>)
      : {};
  const visionBoard =
    input.visionBoard && typeof input.visionBoard === "object" && !Array.isArray(input.visionBoard)
      ? (input.visionBoard as Record<string, unknown>)
      : {};

  return {
    onboardingAnswers: sanitizeAnswers(input.onboardingAnswers),
    digitalProfile: {
      stage: getString(digitalProfile.stage),
      summary: getString(digitalProfile.summary),
      strengths: getStringList(digitalProfile.strengths),
    },
    dreamGoals: getStringList(input.dreamGoals),
    visionBoard: {
      sixMonths: getString(visionBoard.sixMonths),
      oneYear: getString(visionBoard.oneYear),
      threeYears: getString(visionBoard.threeYears),
      fiveYears: getString(visionBoard.fiveYears),
    },
    updatedAt: new Date().toISOString(),
  };
}

export async function getBlizzwayVault({
  businessId,
  userId,
}: {
  businessId: string;
  userId: string;
}) {
  const memory = await prisma.nexaMemory.findUnique({
    where: {
      businessId_key: {
        businessId,
        key: vaultKey(userId),
      },
    },
  });

  const payload = memory?.value
    ? sanitizeBlizzwayVaultPayload(memory.value)
    : emptyVault;

  return {
    ...payload,
    updatedAt: memory?.updatedAt.toISOString() ?? payload.updatedAt,
  };
}

export async function saveBlizzwayVault({
  businessId,
  userId,
  payload,
}: {
  businessId: string;
  userId: string;
  payload: BlizzwayVaultPayload;
}) {
  return prisma.nexaMemory.upsert({
    where: {
      businessId_key: {
        businessId,
        key: vaultKey(userId),
      },
    },
    create: {
      businessId,
      key: vaultKey(userId),
      value: payload as unknown as Prisma.InputJsonValue,
    },
    update: {
      value: payload as unknown as Prisma.InputJsonValue,
    },
  });
}
