import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import type { Priority } from "@prisma/client";

import { getCurrentBusiness } from "@/lib/dashboard/server";
import { generateNexaInsights, getBusinessContext } from "@/lib/nexa-brain";
import { sendEmail } from "@/lib/mail";
import { prisma } from "@/lib/prisma";

const leadStatuses = ["NEW", "CONTACTED", "DEMO", "PROPOSAL", "WON", "LOST"];
const priorities: Priority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

function getString(payload: Record<string, unknown>, key: string) {
  return typeof payload[key] === "string" ? payload[key] : undefined;
}

function getPriority(payload: Record<string, unknown>) {
  const priority = getString(payload, "priority");
  return priority && priorities.includes(priority as Priority)
    ? (priority as Priority)
    : "MEDIUM";
}

async function logAction(
  businessId: string,
  type: string,
  description: string,
  payload: Prisma.InputJsonObject,
) {
  return prisma.nexaAction.create({
    data: {
      businessId,
      type,
      description,
      payload,
      status: "completed",
    },
  });
}

export async function POST(request: Request) {
  try {
    const context = await getCurrentBusiness();

    if (context.error) return context.error;

    const { command, payload } = await request.json();
    const commandPayload =
      payload && typeof payload === "object" && !Array.isArray(payload)
        ? (payload as Record<string, unknown>)
        : {};
    const commandPayloadJson = JSON.parse(
      JSON.stringify(commandPayload),
    ) as Prisma.InputJsonObject;

    if (typeof command !== "string") {
      return NextResponse.json({ error: "command is required." }, { status: 400 });
    }

    if (command === "reassign_lead") {
      const leadId = getString(commandPayload, "leadId");
      const assignedTo = getString(commandPayload, "assignedTo");
      if (!leadId || !assignedTo) {
        return NextResponse.json(
          { error: "leadId and assignedTo are required." },
          { status: 400 },
        );
      }

      const lead = await prisma.lead.update({
        where: { id: leadId },
        data: { assignedTo },
      });
      await logAction(context.business.id, command, `Reassigned lead ${lead.name}`, commandPayloadJson);
      return NextResponse.json({ success: true, message: `Reassigned ${lead.name}.`, lead });
    }

    if (command === "create_task") {
      const title = getString(commandPayload, "title");
      const assignedTo = getString(commandPayload, "assignedTo") ?? context.user.id;
      if (!title) {
        return NextResponse.json({ error: "title is required." }, { status: 400 });
      }

      const task = await prisma.task.create({
        data: {
          title,
          description: getString(commandPayload, "description"),
          assignedTo,
          priority: getPriority(commandPayload),
          dueDate: getString(commandPayload, "dueDate")
            ? new Date(getString(commandPayload, "dueDate")!)
            : undefined,
        },
      });
      await logAction(context.business.id, command, `Created task ${task.title}`, commandPayloadJson);
      return NextResponse.json({ success: true, message: `Created task ${task.title}.`, task });
    }

    if (command === "set_reminder") {
      const leadId = getString(commandPayload, "leadId");
      const userId = getString(commandPayload, "userId") ?? context.user.id;
      const message = getString(commandPayload, "message");
      const dueAt = getString(commandPayload, "dueAt");
      if (!leadId || !message || !dueAt) {
        return NextResponse.json(
          { error: "leadId, message and dueAt are required." },
          { status: 400 },
        );
      }

      const reminder = await prisma.reminder.create({
        data: { leadId, userId, message, dueAt: new Date(dueAt) },
      });
      await logAction(context.business.id, command, "Created lead reminder", commandPayloadJson);
      return NextResponse.json({ success: true, message: "Reminder created.", reminder });
    }

    if (command === "update_lead_status") {
      const leadId = getString(commandPayload, "leadId");
      const status = getString(commandPayload, "status");
      if (!leadId || !status || !leadStatuses.includes(status)) {
        return NextResponse.json(
          { error: "leadId and valid status are required." },
          { status: 400 },
        );
      }

      const lead = await prisma.lead.update({
        where: { id: leadId },
        data: {
          status: status as "NEW" | "CONTACTED" | "DEMO" | "PROPOSAL" | "WON" | "LOST",
          ...(status === "WON" ? { wonAt: new Date() } : {}),
          ...(status === "LOST" ? { lostAt: new Date() } : {}),
        },
      });
      await logAction(context.business.id, command, `Updated ${lead.name} to ${status}`, commandPayloadJson);
      return NextResponse.json({ success: true, message: `Updated ${lead.name} to ${status}.`, lead });
    }

    if (command === "generate_insights") {
      const businessContext = await getBusinessContext(context.business.id);
      const insights = await generateNexaInsights(context.business.id, businessContext);
      await logAction(context.business.id, command, "Generated fresh NEXA insights", commandPayloadJson);
      return NextResponse.json({ success: true, message: "Generated fresh insights.", insights });
    }

    if (command === "send_team_alert") {
      const subject = getString(commandPayload, "subject") ?? "BGOS team alert";
      const body = getString(commandPayload, "body") ?? "NEXA has an update for your team.";
      const users = await prisma.user.findMany({
        where: { businessId: context.business.id },
        select: { email: true },
      });

      await Promise.all(
        users.map((user) =>
          sendEmail(user.email, subject, `<p>${body}</p>`),
        ),
      );
      await logAction(context.business.id, command, `Sent alert to ${users.length} team members`, commandPayloadJson);
      return NextResponse.json({ success: true, message: `Alert sent to ${users.length} team members.` });
    }

    return NextResponse.json({ error: "Unsupported command." }, { status: 400 });
  } catch {
    return NextResponse.json(
      { error: "Unable to execute NEXA command." },
      { status: 500 },
    );
  }
}
