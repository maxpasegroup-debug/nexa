import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSdeContext } from "@/lib/sde/server";

const defaultIntegrations = [
  { name: "Email", type: "smtp" },
  { name: "Database", type: "postgresql" },
  { name: "Claude API", type: "ai" },
  { name: "App Server", type: "server" },
];

export async function GET() {
  try {
    const context = await getSdeContext();

    if (context.error) return context.error;

    const existing = await prisma.integrationHealth.findMany({
      where: { businessId: context.businessId },
      orderBy: { name: "asc" },
    });

    if (existing.length === 0) {
      await prisma.integrationHealth.createMany({
        data: defaultIntegrations.map((integration) => ({
          businessId: context.businessId,
          ...integration,
        })),
      });
    }

    const integrations = await prisma.integrationHealth.findMany({
      where: { businessId: context.businessId },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ integrations });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch integrations." },
      { status: 500 },
    );
  }
}
