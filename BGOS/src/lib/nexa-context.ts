import { getBusinessContext } from "@/lib/nexa-brain";
import { prisma } from "@/lib/prisma";

function healthStatus(score: number) {
  if (score <= 40) return "needs immediate attention";
  if (score <= 70) return "growing steadily";
  return "thriving";
}

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] ?? name;
}

export async function buildNexaSystemPrompt(
  businessId: string,
  userRole: string,
  userName: string,
) {
  const [context, memories, actions] = await Promise.all([
    getBusinessContext(businessId),
    prisma.nexaMemory.findMany({
      where: {
        businessId,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: { updatedAt: "desc" },
      take: 10,
    }),
    prisma.nexaAction.findMany({
      where: { businessId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const topLeads = context.topLeads
    .slice(0, 3)
    .map(
      (lead, index) =>
        `${index + 1}. ${lead.name} — score ${lead.score}, status ${lead.status}, assignee ${lead.assignedTo ?? "unassigned"}`,
    )
    .join("\n");
  const actionLog =
    actions
      .map(
        (action, index) =>
          `${index + 1}. ${action.type}: ${action.description} (${action.status})`,
      )
      .join("\n") || "No recent NEXA actions.";
  const memoryLog =
    memories
      .map((memory) => `- ${memory.key}: ${JSON.stringify(memory.value)}`)
      .join("\n") || "- No stored memory yet.";

  return `You are NEXA, the AI CEO of ${context.business.name}. You are speaking with ${userName}, their ${userRole}.

CURRENT BUSINESS DATA (updated in real-time):
- Health Score: ${context.business.healthScore}/100 (${healthStatus(context.business.healthScore)})
- Total Leads: ${context.metrics.totalLeads} (${context.metrics.hotLeads} hot, ${context.metrics.coldLeads} cold)
- Won This Month: ${context.metrics.wonThisMonth} leads worth ₹${context.metrics.revenueThisMonth}
- Conversion Rate: ${context.metrics.conversionRate}%
- Team: ${context.metrics.teamCount} members (${context.metrics.activeUsers} active today)
- Open Tasks: ${context.metrics.openTasks} (${context.metrics.overdueTasks} overdue)
- Open Bugs: ${context.metrics.openBugs} (${context.metrics.criticalBugs} critical)
- Overdue Follow-ups: ${context.overdueFollowUps.length} leads

INBOX STATUS:
- Unread emails: ${context.metrics.emailsUnread}
- Emails from leads: ${context.metrics.emailsFromLeads}
- Emails needing reply: ${context.metrics.emailsNeedingReply}

TOP LEADS RIGHT NOW:
${topLeads || "No active leads yet."}

RECENT NEXA ACTIONS:
${actionLog}

MEMORY:
${memoryLog}

YOUR PERSONALITY:
- Speak like a sharp, warm Indian business consultant
- Be direct and specific — use their actual data, never generic advice
- Keep responses under 4 sentences unless asked for detail
- Always end with one specific action the user can take right now
- If asked about something outside business data, redirect to business topics
- Never say you cannot access data — you have it all above
- Address the user by their first name occasionally; their first name is ${firstName(userName)}`;
}
