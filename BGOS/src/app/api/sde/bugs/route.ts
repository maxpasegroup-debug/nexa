import { NextResponse } from "next/server";

import { notifyDev } from "@/lib/notify-dev";
import { prisma } from "@/lib/prisma";
import {
  getSdeContext,
  isBugStatus,
  isSeverity,
  severityOrder,
} from "@/lib/sde/server";

export async function GET(request: Request) {
  try {
    const context = await getSdeContext();

    if (context.error) return context.error;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const severity = searchParams.get("severity");
    const assignedTo = searchParams.get("assignedTo");

    const bugs = await prisma.bug.findMany({
      where: {
        businessId: context.businessId,
        ...(isBugStatus(status) ? { status } : {}),
        ...(isSeverity(severity) ? { severity } : {}),
        ...(assignedTo ? { assignedTo } : {}),
      },
      include: {
        reporter: { select: { id: true, name: true, role: true } },
        assignee: { select: { id: true, name: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      bugs: bugs.sort(
        (a, b) =>
          severityOrder(b.severity) - severityOrder(a.severity) ||
          b.createdAt.getTime() - a.createdAt.getTime(),
      ),
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch bugs." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const context = await getSdeContext();

    if (context.error) return context.error;

    const { title, description, severity, stepsToRepro, assignedTo } =
      await request.json();

    if (typeof title !== "string" || typeof description !== "string") {
      return NextResponse.json(
        { error: "title and description are required." },
        { status: 400 },
      );
    }

    if (assignedTo) {
      const assignee = await prisma.user.findFirst({
        where: { id: String(assignedTo), businessId: context.businessId },
        select: { id: true },
      });

      if (!assignee) {
        return NextResponse.json({ error: "Assignee not found." }, { status: 404 });
      }
    }

    const bug = await prisma.bug.create({
      data: {
        businessId: context.businessId,
        title,
        description,
        severity: isSeverity(severity) ? severity : "MEDIUM",
        stepsToRepro: typeof stepsToRepro === "string" ? stepsToRepro : undefined,
        assignedTo: typeof assignedTo === "string" && assignedTo ? assignedTo : undefined,
        reportedBy: context.user.id,
      },
      include: {
        reporter: { select: { id: true, name: true, role: true } },
        assignee: { select: { id: true, name: true, role: true } },
      },
    });

    if (bug.severity === "CRITICAL") {
      await prisma.escalation.create({
        data: {
          businessId: context.businessId,
          type: "BUG",
          title: `Critical bug: ${bug.title}`,
          description: bug.description,
          priority: "URGENT",
          raisedBy: context.user.id,
          notifiedDev: Boolean(process.env.DEV_EMAIL),
        },
      });

      await notifyDev(
          "CRITICAL BUG reported in BGOS",
          `${bug.title}\n\n${bug.description}\n\n${bug.stepsToRepro ?? ""}`,
          "urgent",
        );
    }

    return NextResponse.json({ bug }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Unable to create bug." },
      { status: 500 },
    );
  }
}
