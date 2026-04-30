import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { checkEmployeeCompleteness } from "@/lib/nexa-onboarding-intelligence";
import { getString } from "@/lib/onboarding-flow";
import {
  asRecord,
  asStringArray,
  getOwnedOnboardingSession,
  jsonError,
  requireSessionUser,
  syncEmployeeData,
} from "@/lib/onboarding-session-server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function employeePayload(body: Record<string, unknown>) {
  const name = getString(body.name);
  const title = getString(body.title);
  const email = getString(body.email).toLowerCase();
  const phone = getString(body.phone);
  const reportsTo = getString(body.reportsTo);
  const systemRole = getString(body.systemRole) || "BDM";
  const operatingProcedures = getString(body.operatingProcedures);
  const assignedPipelines = asStringArray(body.assignedPipelines);
  const dailyTasks = asStringArray(body.dailyTasks);
  const decisionAuthority = asStringArray(body.decisionAuthority);
  const directReports = asStringArray(body.directReports);
  const communicationPrefs = asRecord(body.communicationPrefs);
  const completeness = checkEmployeeCompleteness({
    name,
    title,
    email,
    phone,
    reportsTo,
    operatingProcedures,
    assignedPipelines,
    decisionAuthority,
  });

  return {
    data: {
      name,
      title,
      email,
      phone: phone || undefined,
      reportsTo: reportsTo || undefined,
      directReports,
      systemRole,
      assignedPipelines,
      operatingProcedures: operatingProcedures || undefined,
      dailyTasks,
      decisionAuthority,
      communicationPrefs,
      nexaFlags: completeness.flags,
      completeness: completeness.score,
    },
    completeness,
  };
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { error, user } = await requireSessionUser(["BDM"]);
    if (error) return error;

    const session = await getOwnedOnboardingSession(params.id, user.id, "BDM");
    if (!session) return jsonError("Session not found.", 404);

    const body = (await request.json()) as Record<string, unknown>;
    const payload = employeePayload(body);
    if (!payload.data.name || !payload.data.title || !payload.data.email) {
      return jsonError("name, title, and email are required.");
    }

    const employee = await prisma.onboardingEmployee.create({
      data: {
        sessionId: params.id,
        ...payload.data,
        directReports: payload.data.directReports as Prisma.InputJsonValue,
        assignedPipelines: payload.data.assignedPipelines as Prisma.InputJsonValue,
        dailyTasks: payload.data.dailyTasks as Prisma.InputJsonValue,
        decisionAuthority: payload.data.decisionAuthority as Prisma.InputJsonValue,
        communicationPrefs: payload.data.communicationPrefs as Prisma.InputJsonValue,
        nexaFlags: payload.data.nexaFlags as Prisma.InputJsonValue,
      },
    });
    await syncEmployeeData(params.id);

    return NextResponse.json({
      employee,
      completenessScore: payload.completeness.score,
      flags: payload.completeness.flags,
      missing: payload.completeness.missing,
    });
  } catch (error) {
    console.error("[onboarding-session:employee:create]", error);
    return jsonError("Unable to create employee.", 500);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { error, user } = await requireSessionUser(["BDM"]);
    if (error) return error;

    const session = await getOwnedOnboardingSession(params.id, user.id, "BDM");
    if (!session) return jsonError("Session not found.", 404);

    const body = (await request.json()) as Record<string, unknown>;
    const employeeId = getString(body.employeeId);
    if (!employeeId) return jsonError("employeeId is required.");

    const payload = employeePayload(body);
    const employee = await prisma.onboardingEmployee.update({
      where: { id: employeeId, sessionId: params.id },
      data: {
        ...payload.data,
        directReports: payload.data.directReports as Prisma.InputJsonValue,
        assignedPipelines: payload.data.assignedPipelines as Prisma.InputJsonValue,
        dailyTasks: payload.data.dailyTasks as Prisma.InputJsonValue,
        decisionAuthority: payload.data.decisionAuthority as Prisma.InputJsonValue,
        communicationPrefs: payload.data.communicationPrefs as Prisma.InputJsonValue,
        nexaFlags: payload.data.nexaFlags as Prisma.InputJsonValue,
      },
    });
    await syncEmployeeData(params.id);

    return NextResponse.json({
      employee,
      completenessScore: payload.completeness.score,
      flags: payload.completeness.flags,
      missing: payload.completeness.missing,
    });
  } catch (error) {
    console.error("[onboarding-session:employee:update]", error);
    return jsonError("Unable to update employee.", 500);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { error, user } = await requireSessionUser(["BDM"]);
    if (error) return error;

    const session = await getOwnedOnboardingSession(params.id, user.id, "BDM");
    if (!session) return jsonError("Session not found.", 404);

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId") ?? "";
    if (!employeeId) return jsonError("employeeId is required.");

    await prisma.onboardingEmployee.delete({
      where: { id: employeeId, sessionId: params.id },
    });
    await syncEmployeeData(params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[onboarding-session:employee:delete]", error);
    return jsonError("Unable to delete employee.", 500);
  }
}
