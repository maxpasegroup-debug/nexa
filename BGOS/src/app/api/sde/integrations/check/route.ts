import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSdeContext } from "@/lib/sde/server";

const defaultIntegrations = [
  { name: "Email", type: "smtp" },
  { name: "Database", type: "postgresql" },
  { name: "Claude API", type: "ai" },
  { name: "App Server", type: "server" },
];

async function ensureIntegrations(businessId: string) {
  const existing = await prisma.integrationHealth.findMany({
    where: { businessId },
  });

  if (existing.length > 0) return existing;

  await prisma.integrationHealth.createMany({
    data: defaultIntegrations.map((integration) => ({
      businessId,
      ...integration,
    })),
  });

  return prisma.integrationHealth.findMany({ where: { businessId } });
}

async function checkIntegration(type: string) {
  const startedAt = Date.now();

  try {
    if (type === "postgresql") {
      await prisma.$queryRaw`SELECT 1`;
    } else if (type === "ai") {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1,
        messages: [{ role: "user", content: "ping" }],
      });
    } else if (type === "smtp") {
      const configured = Boolean(
        process.env.BREVO_SMTP_HOST &&
          process.env.BREVO_SMTP_USER &&
          process.env.BREVO_SMTP_PASS,
      );

      if (!configured) {
        throw new Error("SMTP environment variables are missing.");
      }
    } else if (type === "server") {
      process.uptime();
    }

    return {
      status: "healthy",
      lastError: null,
      responseTime: Date.now() - startedAt,
    };
  } catch (error) {
    return {
      status: "down",
      lastError: error instanceof Error ? error.message : "Health check failed.",
      responseTime: Date.now() - startedAt,
    };
  }
}

export async function POST() {
  try {
    const context = await getSdeContext();

    if (context.error) return context.error;

    const integrations = await ensureIntegrations(context.businessId);
    const results = await Promise.all(
      integrations.map(async (integration) => {
        const result = await checkIntegration(integration.type);

        return prisma.integrationHealth.update({
          where: { id: integration.id },
          data: {
            status: result.status,
            lastError: result.lastError,
            responseTime: result.responseTime,
            lastChecked: new Date(),
          },
        });
      }),
    );

    return NextResponse.json({ integrations: results });
  } catch {
    return NextResponse.json(
      { error: "Unable to check integrations." },
      { status: 500 },
    );
  }
}
