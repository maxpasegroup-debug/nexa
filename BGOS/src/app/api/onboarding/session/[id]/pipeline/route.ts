import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { randomUUID } from "crypto";

import { getString } from "@/lib/onboarding-flow";
import {
  asRecord,
  asStringArray,
  getOwnedOnboardingSession,
  jsonArray,
  jsonError,
  requireSessionUser,
} from "@/lib/onboarding-session-server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type SessionPipeline = {
  id: string;
  name: string;
  productName: string;
  stages: string[];
  visibleTo?: string[];
  slaDays?: Record<string, unknown>;
};

async function loadSession(paramsId: string, userId: string) {
  return getOwnedOnboardingSession(paramsId, userId, "BDM");
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { error, user } = await requireSessionUser(["BDM"]);
    if (error) return error;
    const session = await loadSession(params.id, user.id);
    if (!session) return jsonError("Session not found.", 404);

    const body = (await request.json()) as Record<string, unknown>;
    const name = getString(body.name);
    const productName = getString(body.productName) || name;
    const stages = asStringArray(body.stages);
    if (!name || stages.length === 0) return jsonError("name and stages are required.");

    const pipeline: SessionPipeline = {
      id: randomUUID(),
      name,
      productName,
      stages,
      visibleTo: asStringArray(body.visibleTo),
      slaDays: asRecord(body.slaDays),
    };
    const pipelines = [...jsonArray<SessionPipeline>(session.pipelineData), pipeline];

    const updated = await prisma.onboardingSession.update({
      where: { id: params.id },
      data: { pipelineData: pipelines as Prisma.InputJsonValue },
      include: { employees: true, clarifications: true, lead: true },
    });

    return NextResponse.json({ session: updated, pipeline });
  } catch (error) {
    console.error("[onboarding-session:pipeline:create]", error);
    return jsonError("Unable to create pipeline.", 500);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { error, user } = await requireSessionUser(["BDM"]);
    if (error) return error;
    const session = await loadSession(params.id, user.id);
    if (!session) return jsonError("Session not found.", 404);

    const body = (await request.json()) as Record<string, unknown>;
    const pipelineId = getString(body.pipelineId);
    if (!pipelineId) return jsonError("pipelineId is required.");

    const pipelines = jsonArray<SessionPipeline>(session.pipelineData).map((pipeline) =>
      pipeline.id === pipelineId
        ? {
            ...pipeline,
            name: getString(body.name) || pipeline.name,
            productName: getString(body.productName) || pipeline.productName,
            stages: Array.isArray(body.stages) ? asStringArray(body.stages) : pipeline.stages,
            visibleTo: Array.isArray(body.visibleTo)
              ? asStringArray(body.visibleTo)
              : pipeline.visibleTo,
            slaDays: body.slaDays ? asRecord(body.slaDays) : pipeline.slaDays,
          }
        : pipeline,
    );

    const updated = await prisma.onboardingSession.update({
      where: { id: params.id },
      data: { pipelineData: pipelines as Prisma.InputJsonValue },
      include: { employees: true, clarifications: true, lead: true },
    });

    return NextResponse.json({ session: updated });
  } catch (error) {
    console.error("[onboarding-session:pipeline:update]", error);
    return jsonError("Unable to update pipeline.", 500);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { error, user } = await requireSessionUser(["BDM"]);
    if (error) return error;
    const session = await loadSession(params.id, user.id);
    if (!session) return jsonError("Session not found.", 404);

    const { searchParams } = new URL(request.url);
    const pipelineId = searchParams.get("pipelineId") ?? "";
    if (!pipelineId) return jsonError("pipelineId is required.");

    const pipelines = jsonArray<SessionPipeline>(session.pipelineData).filter(
      (pipeline) => pipeline.id !== pipelineId,
    );
    const updated = await prisma.onboardingSession.update({
      where: { id: params.id },
      data: { pipelineData: pipelines as Prisma.InputJsonValue },
      include: { employees: true, clarifications: true, lead: true },
    });

    return NextResponse.json({ session: updated });
  } catch (error) {
    console.error("[onboarding-session:pipeline:delete]", error);
    return jsonError("Unable to delete pipeline.", 500);
  }
}
