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

async function syncPipelineData(sessionId: string) {
  const pipelines = await prisma.onboardingPipeline.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
  });

  const pipelineData = pipelines.map((pipeline) => ({
    id: pipeline.id,
    name: pipeline.name,
    productName: pipeline.productName,
    stages: pipeline.stages,
    slaDays: pipeline.slaRules,
    visibleTo: pipeline.visibleTo,
    color: pipeline.color,
  }));

  await prisma.onboardingSession.update({
    where: { id: sessionId },
    data: { pipelineData: pipelineData as Prisma.InputJsonValue },
  });

  return pipelineData;
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { error, user } = await requireSessionUser(["BDM"]);
    if (error) return error;
    const session = await loadSession(params.id, user.id);
    if (!session) return jsonError("Session not found.", 404);

    const body = (await request.json()) as Record<string, unknown>;
    const pipelineId = getString(body.pipelineId) || getString(body.id);
    const name = getString(body.name);
    const productName = getString(body.productName) || name;
    const stages = asStringArray(body.stages);
    if (!name || stages.length < 1) return jsonError("name and stages are required.");

    const data = {
      name,
      productName,
      stages: stages as Prisma.InputJsonValue,
      slaRules: asRecord(body.slaRules ?? body.slaDays) as Prisma.InputJsonValue,
      visibleTo: asStringArray(body.visibleTo) as Prisma.InputJsonValue,
      color: getString(body.color) || "#7C6FFF",
    };

    const pipeline = pipelineId
      ? await prisma.onboardingPipeline.update({
          where: { id: pipelineId, sessionId: params.id },
          data,
        })
      : await prisma.onboardingPipeline.create({
          data: { sessionId: params.id, ...data },
        });

    const pipelineData = await syncPipelineData(params.id);

    return NextResponse.json({ pipeline, pipelineData });
  } catch (error) {
    console.error("[onboarding-session:pipeline:upsert]", error);
    return jsonError("Unable to upsert pipeline.", 500);
  }
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
    await prisma.onboardingPipeline.create({
      data: {
        sessionId: params.id,
        name: pipeline.name,
        productName: pipeline.productName,
        stages: pipeline.stages as Prisma.InputJsonValue,
        slaRules: (pipeline.slaDays ?? {}) as Prisma.InputJsonValue,
        visibleTo: (pipeline.visibleTo ?? []) as Prisma.InputJsonValue,
        color: "#7C6FFF",
      },
    }).catch(() => null);

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
