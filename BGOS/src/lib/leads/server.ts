import type { LeadSource, LeadStatus, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { requireRole } from "@/lib/api-auth";
import { createChatCompletionText } from "@/lib/openai";
import { prisma } from "@/lib/prisma";

const LEAD_SCORE_SYSTEM_PROMPT =
  "You are NEXA, an AI sales analyst. Score this lead from 0 to 100 based on the data provided. Consider: completeness of contact info, engagement history, deal value, time since creation. Return only a JSON object with two fields: score (number 0-100) and reason (one sentence explaining the score). No other text.";

const leadStatuses: LeadStatus[] = [
  "NEW",
  "CONTACTED",
  "DEMO",
  "PROPOSAL",
  "WON",
  "LOST",
];

const leadSources: LeadSource[] = [
  "MANUAL",
  "WEBSITE",
  "REFERRAL",
  "MARKETPLACE",
  "INSTAGRAM",
  "WHATSAPP",
  "EMAIL",
  "COLD_CALL",
  "OTHER",
];

export function isLeadStatus(value: unknown): value is LeadStatus {
  return typeof value === "string" && leadStatuses.includes(value as LeadStatus);
}

export function isLeadSource(value: unknown): value is LeadSource {
  return typeof value === "string" && leadSources.includes(value as LeadSource);
}

export async function getCrmContext() {
  const authResult = await requireRole(["BOSS", "OWNER", "BDM"]);

  if (authResult.response) {
    return { error: authResult.response };
  }

  const user = await prisma.user.findUnique({
    where: { id: authResult.user.id },
    select: {
      id: true,
      name: true,
      role: true,
      businessId: true,
    },
  });

  if (!user?.businessId) {
    return {
      error: NextResponse.json(
        { error: "Business not found for this user." },
        { status: 400 },
      ),
    };
  }

  return { user, businessId: user.businessId };
}

function parseScoreResponse(text: string) {
  const parsed = JSON.parse(text) as unknown;

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Invalid score response");
  }

  const value = parsed as Record<string, unknown>;
  const score = Math.max(
    0,
    Math.min(100, Math.round(Number(value.score) || 0)),
  );
  const reason =
    typeof value.reason === "string"
      ? value.reason
      : "NEXA scored this lead from the available CRM data.";

  return { score, reason };
}

export async function scoreLead(leadId: string) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      activities: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      reminders: {
        orderBy: { dueAt: "asc" },
        take: 5,
      },
    },
  });

  if (!lead) {
    throw new Error("Lead not found");
  }

  const text = await createChatCompletionText({
    maxTokens: 220,
    system: LEAD_SCORE_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: JSON.stringify(lead),
      },
    ],
  });
  const result = text
    ? parseScoreResponse(text)
    : {
        score: 0,
        reason: "NEXA could not score this lead from the available data.",
      };

  await prisma.lead.update({
    where: { id: leadId },
    data: {
      score: result.score,
      scoreReason: result.reason,
    },
  });

  return result;
}

export function buildLeadUpdateData(
  body: Record<string, unknown>,
): Prisma.LeadUncheckedUpdateInput {
  const data: Prisma.LeadUncheckedUpdateInput = {};

  if (typeof body.name === "string") data.name = body.name;
  if (typeof body.phone === "string" || body.phone === null) data.phone = body.phone;
  if (typeof body.email === "string" || body.email === null) data.email = body.email;
  if (typeof body.company === "string" || body.company === null) data.company = body.company;
  if (isLeadSource(body.source)) data.source = body.source;
  if (isLeadStatus(body.status)) data.status = body.status;
  if (typeof body.score === "number") data.score = body.score;
  if (typeof body.scoreReason === "string" || body.scoreReason === null) data.scoreReason = body.scoreReason;
  if (typeof body.value === "number") data.value = body.value;
  if (typeof body.notes === "string" || body.notes === null) data.notes = body.notes;
  if (typeof body.assignedTo === "string" || body.assignedTo === null) data.assignedTo = body.assignedTo;
  if (typeof body.followUpDate === "string" || body.followUpDate === null) {
    data.followUpDate = body.followUpDate ? new Date(body.followUpDate) : null;
  }
  if (typeof body.lastContactAt === "string" || body.lastContactAt === null) {
    data.lastContactAt = body.lastContactAt ? new Date(body.lastContactAt) : null;
  }
  if (typeof body.lostReason === "string" || body.lostReason === null) data.lostReason = body.lostReason;

  return data;
}
