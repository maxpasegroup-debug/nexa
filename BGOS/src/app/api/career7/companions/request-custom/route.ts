import { NextResponse } from "next/server";

import { getCareer7Context } from "@/lib/career7-auth";
import { getString } from "@/lib/marketplace";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const authResult = await getCareer7Context(request);
    if (authResult.response) return authResult.response;

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const title = getString(body.title);
    const category = getString(body.category) || "Requestable / Custom";
    const description = getString(body.description);
    const expectedOutput = getString(body.expectedOutput);

    if (!title || !description) {
      return NextResponse.json({ error: "title and description are required." }, { status: 400 });
    }

    const requestRecord = await prisma.blizzwayCompanionRequest.create({
      data: {
        businessModel: authResult.context.businessModel,
        businessId: authResult.context.businessId,
        userId: authResult.context.userId,
        title,
        category,
        description,
        expectedOutput: expectedOutput || null,
        status: "PENDING",
        metadata: {
          requestedFrom: "companions",
          fulfillment: "not_started",
        },
      },
    });

    return NextResponse.json(
      {
        request: {
          id: requestRecord.id,
          title: requestRecord.title,
          category: requestRecord.category,
          description: requestRecord.description,
          expectedOutput: requestRecord.expectedOutput,
          status: requestRecord.status.toLowerCase(),
          createdAt: requestRecord.createdAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[career7:companions:request-custom]", error);
    return NextResponse.json({ error: "Unable to save custom companion request." }, { status: 500 });
  }
}
