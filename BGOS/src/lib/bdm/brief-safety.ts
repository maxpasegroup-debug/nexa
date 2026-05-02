import { prisma } from "@/lib/prisma";

export type SafeBriefTask = {
  title: string;
  priority: "high" | "medium" | "low";
  leadId: string | null;
  leadName?: string | null;
  type: "follow_up" | "new_lead" | "demo" | "proposal" | "admin";
};

const priorities = ["high", "medium", "low"] as const;
const taskTypes = ["follow_up", "new_lead", "demo", "proposal", "admin"] as const;

function normalizeBriefTasks(value: unknown): SafeBriefTask[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is Record<string, unknown> => {
      return Boolean(item) && typeof item === "object" && !Array.isArray(item);
    })
    .slice(0, 5)
    .map((item, index) => {
      const priority = String(item.priority ?? "medium");
      const type = String(item.type ?? "admin");

      return {
        title:
          typeof item.title === "string"
            ? item.title
            : `Review assigned work ${index + 1}`,
        priority: priorities.includes(priority as SafeBriefTask["priority"])
          ? (priority as SafeBriefTask["priority"])
          : "medium",
        leadId: typeof item.leadId === "string" ? item.leadId : null,
        leadName: typeof item.leadName === "string" ? item.leadName : null,
        type: taskTypes.includes(type as SafeBriefTask["type"])
          ? (type as SafeBriefTask["type"])
          : "admin",
      };
    });
}

export async function filterBriefTasksForBdm(
  bdmId: string,
  tasks: unknown,
): Promise<SafeBriefTask[]> {
  const normalized = normalizeBriefTasks(tasks);
  const leadIds = Array.from(
    new Set(
      normalized
        .map((task) => task.leadId)
        .filter((leadId): leadId is string => Boolean(leadId)),
    ),
  );

  if (leadIds.length === 0) return normalized;

  const allowedLeads = await prisma.lead.findMany({
    where: {
      id: { in: leadIds },
      OR: [{ assignedTo: bdmId }, { createdBy: bdmId }],
    },
    select: { id: true, name: true },
  });
  const allowedById = new Map(allowedLeads.map((lead) => [lead.id, lead.name]));

  return normalized
    .filter((task) => !task.leadId || allowedById.has(task.leadId))
    .map((task) => ({
      ...task,
      leadName: task.leadId ? allowedById.get(task.leadId) ?? task.leadName : task.leadName,
    }));
}
