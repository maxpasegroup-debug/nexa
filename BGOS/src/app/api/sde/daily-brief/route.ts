import { NextResponse } from "next/server";

import { createChatCompletionText } from "@/lib/openai";
import { getSdeContext } from "@/lib/sde/server";
import { prisma } from "@/lib/prisma";

const SYSTEM_PROMPT =
  "You are NEXA, the AI CEO. Generate a morning brief for this software developer. Return only a JSON object with: greeting (string — motivational dev-focused good morning under 20 words), tasks (array of 5 most important tasks ordered by priority — each with title, priority, type as 'bug'/'feature'/'review'/'deploy'/'admin'), insights (array of 3 strings — technical tips or process improvements for today). No other text.";

export async function GET() {
  try {
    const context = await getSdeContext();
    if (context.error) return context.error;

    const activeSprint = await prisma.sprint.findFirst({
      where: { businessId: context.businessId, status: "ACTIVE" },
      include: { tasks: true },
    });
    const [tasksByPriority, criticalBugsCount, openEscalationsCount] = await Promise.all([
      prisma.task.groupBy({
        by: ["priority"],
        where: { assignedTo: context.user.id, status: { not: "DONE" } },
        _count: { _all: true },
      }),
      prisma.bug.count({ where: { businessId: context.businessId, severity: "CRITICAL", status: { in: ["OPEN", "IN_PROGRESS"] } } }),
      prisma.escalation.count({ where: { businessId: context.businessId, status: { in: ["OPEN", "ACKNOWLEDGED", "IN_PROGRESS"] } } }),
    ]);
    const sprintTasks = activeSprint?.tasks.length ?? 0;
    const sprintDone = activeSprint?.tasks.filter((task) => task.status === "DONE").length ?? 0;
    const text = await createChatCompletionText({
      maxTokens: 700,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: JSON.stringify({
        openTasksCountByPriority: tasksByPriority,
        criticalBugsCount,
        openEscalationsCount,
        sprintProgress: sprintTasks > 0 ? Math.round((sprintDone / sprintTasks) * 100) : 0,
        daysLeftInSprint: activeSprint ? Math.max(0, Math.ceil((activeSprint.endDate.getTime() - Date.now()) / 86400000)) : 0,
      }) }],
    });
    const brief = text ? JSON.parse(text) : null;
    return NextResponse.json({ brief });
  } catch {
    return NextResponse.json({
      brief: {
        greeting: "Good morning. Clear the riskiest issue first.",
        tasks: [],
        insights: ["Keep fixes small.", "Verify critical paths before deploy.", "Document blockers early."],
      },
    });
  }
}
