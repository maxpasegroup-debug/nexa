import Anthropic from "@anthropic-ai/sdk";
import type {
  ActivityLog,
  Business,
  Lead,
  NexaInsight,
  Prisma,
  User,
} from "@prisma/client";

import { sendEmail } from "@/lib/mail";
import { prisma } from "@/lib/prisma";

type BusinessCore = Pick<
  Business,
  "name" | "type" | "teamSize" | "goal" | "healthScore"
>;

type BusinessContext = {
  business: BusinessCore;
  metrics: {
    totalLeads: number;
    hotLeads: number;
    coldLeads: number;
    wonThisMonth: number;
    lostThisMonth: number;
    newLeadsThisWeek: number;
    conversionRate: number;
    totalRevenue: number;
    revenueThisMonth: number;
    teamCount: number;
    activeUsers: number;
    openTasks: number;
    overdueTasks: number;
    completedTasks: number;
    totalTasks: number;
    openBugs: number;
    highBugs: number;
    criticalBugs: number;
    openEscalations: number;
    emailsUnread: number;
    emailsFromLeads: number;
    emailsNeedingReply: number;
  };
  recentActivity: ActivityLog[];
  topLeads: Lead[];
  overdueFollowUps: Lead[];
  underperformingBDMs: User[];
  recentInsights: NexaInsight[];
};

type GeneratedInsight = {
  type: "warning" | "opportunity" | "action";
  message: string;
  action: string;
  priority: "high" | "medium" | "low";
};

const INSIGHT_PROMPT =
  "You are NEXA, the AI CEO of a business. Analyse the business data provided and generate exactly 3 actionable insights. Each insight must be specific, data-driven, and tell the user exactly what to do. Return only a valid JSON array with no markdown, no code blocks. Each object has: type ('warning'|'opportunity'|'action'), message (string, max 20 words, specific to their data), action (string, max 10 words, one concrete next step), priority ('high'|'medium'|'low').";

function nexaLog(fn: string, error: unknown) {
  console.error(`[NEXA Brain] ${fn} failed:`, error);
}

function fallbackContext(): BusinessContext {
  return {
    business: {
      name: "Business",
      type: "Business",
      teamSize: "0",
      goal: "Grow the business",
      healthScore: 50,
    },
    metrics: {
      totalLeads: 0,
      hotLeads: 0,
      coldLeads: 0,
      wonThisMonth: 0,
      lostThisMonth: 0,
      newLeadsThisWeek: 0,
      conversionRate: 0,
      totalRevenue: 0,
      revenueThisMonth: 0,
      teamCount: 0,
      activeUsers: 0,
      openTasks: 0,
      overdueTasks: 0,
      completedTasks: 0,
      totalTasks: 0,
      openBugs: 0,
      highBugs: 0,
      criticalBugs: 0,
      openEscalations: 0,
      emailsUnread: 0,
      emailsFromLeads: 0,
      emailsNeedingReply: 0,
    },
    recentActivity: [],
    topLeads: [],
    overdueFollowUps: [],
    underperformingBDMs: [],
    recentInsights: [],
  };
}

function monthBounds(date = new Date()) {
  return {
    start: new Date(date.getFullYear(), date.getMonth(), 1),
    end: new Date(date.getFullYear(), date.getMonth() + 1, 1),
  };
}

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function insightFallback(context: BusinessContext): GeneratedInsight[] {
  return [
    {
      type: "warning",
      message: `${context.overdueFollowUps.length} leads need follow-up today.`,
      action: "Call overdue leads",
      priority: "high",
    },
    {
      type: "opportunity",
      message: `${context.metrics.hotLeads} hot leads are ready for conversion.`,
      action: "Prioritise hot leads",
      priority: "medium",
    },
    {
      type: "action",
      message: `Business health is ${context.business.healthScore}. Review weak areas.`,
      action: "Open dashboard",
      priority: "medium",
    },
  ];
}

function parseInsights(text: string, context: BusinessContext): GeneratedInsight[] {
  try {
    const parsed = JSON.parse(text) as unknown;
    if (!Array.isArray(parsed)) return insightFallback(context);

    return parsed.slice(0, 3).map((item) => {
      const value =
        item && typeof item === "object" && !Array.isArray(item)
          ? (item as Record<string, unknown>)
          : {};

      const type = String(value.type);
      const priority = String(value.priority);

      return {
        type:
          type === "warning" || type === "opportunity" || type === "action"
            ? type
            : "action",
        message:
          typeof value.message === "string"
            ? value.message
            : "Review today's business priorities.",
        action:
          typeof value.action === "string" ? value.action : "Open dashboard",
        priority:
          priority === "high" || priority === "medium" || priority === "low"
            ? priority
            : "medium",
      };
    });
  } catch {
    return insightFallback(context);
  }
}

function scoreColor(score: number) {
  if (score <= 40) return "#FF6B6B";
  if (score <= 70) return "#F5A623";
  return "#22D9A0";
}

function dashboardUrl() {
  return `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/boss`;
}

type TopUnreadEmail = {
  fromName: string | null;
  from: string;
  subject: string;
  snippet: string | null;
};

function morningEmailHtml(
  bossName: string,
  score: number,
  insights: GeneratedInsight[],
  topLeads: Lead[],
  emailMetrics?: {
    unread: number;
    fromLeads: number;
    topEmails: TopUnreadEmail[];
  },
) {
  const color = scoreColor(score);
  const emailSection =
    emailMetrics && emailMetrics.unread > 0
      ? `
        <h2 style="color:#fff; margin:28px 0 10px;">📧 Inbox</h2>
        <div style="border:1px solid rgba(255,255,255,0.08); background:#13131c; border-radius:12px; padding:16px;">
          <p style="color:#F0EEF8; margin:0 0 8px;">
            <span style="color:#7C6FFF; font-weight:900;">${emailMetrics.unread}</span> unread emails
            ${emailMetrics.fromLeads > 0 ? `· <span style="color:#22D9A0; font-weight:900;">${emailMetrics.fromLeads}</span> from leads` : ""}
          </p>
          ${
            emailMetrics.topEmails.length > 0
              ? `<ul style="padding-left:18px; margin:8px 0;">
                  ${emailMetrics.topEmails
                    .map(
                      (e) => `
                    <li style="margin:6px 0; color:#F0EEF8;">
                      <span style="font-weight:bold;">${e.fromName ?? e.from}</span>
                      <span style="color:#6B6878;"> — ${e.subject}</span>
                      ${e.snippet ? `<br><span style="font-size:12px;color:#6B6878;">${e.snippet}</span>` : ""}
                    </li>
                  `,
                    )
                    .join("")}
                </ul>`
              : ""
          }
          <a href="${dashboardUrl().replace("/boss", "/boss/inbox")}" style="display:inline-block; margin-top:10px; background:rgba(124,111,255,0.15); color:#c6c1ff; text-decoration:none; padding:8px 14px; border-radius:8px; font-weight:700; font-size:13px; border:1px solid rgba(124,111,255,0.3);">View inbox →</a>
        </div>
      `
      : "";

  const insightCards = insights
    .map(
      (insight) => `
        <div style="border:1px solid rgba(255,255,255,0.08); background:#13131c; border-radius:12px; padding:14px; margin-top:10px;">
          <div style="color:#7C6FFF; font-size:11px; font-weight:800; text-transform:uppercase;">${insight.type} · ${insight.priority}</div>
          <p style="color:#F0EEF8; margin:8px 0 4px; line-height:1.5;">${insight.message}</p>
          <p style="color:#6B6878; margin:0;">Action: ${insight.action}</p>
        </div>
      `,
    )
    .join("");
  const leads = topLeads
    .slice(0, 3)
    .map(
      (lead) => `
        <li style="margin:8px 0; color:#F0EEF8;">
          ${lead.name} <span style="color:#6B6878;">Score ${lead.score}</span>
        </li>
      `,
    )
    .join("");

  return `
    <div style="background:#070709; padding:28px; font-family:Arial,sans-serif;">
      <div style="max-width:680px; margin:0 auto; border:1px solid rgba(255,255,255,0.08); background:#0f0f14; border-radius:18px; padding:26px;">
        <div style="font-size:24px; font-weight:900;"><span style="color:#fff;">BG</span><span style="color:#7C6FFF;">OS</span></div>
        <h1 style="color:#fff; margin:28px 0 8px;">Good morning ${bossName}</h1>
        <p style="color:#6B6878; margin:0 0 22px;">NEXA has reviewed your business and prepared today's priorities.</p>
        <div style="border:1px solid ${color}; background:${color}18; border-radius:16px; padding:20px; text-align:center;">
          <p style="color:#6B6878; margin:0; font-size:12px; text-transform:uppercase;">Business health</p>
          <div style="color:${color}; font-size:52px; font-weight:900; margin-top:8px;">${score}</div>
        </div>
        ${emailSection}
        <h2 style="color:#fff; margin:28px 0 10px;">NEXA insights</h2>
        ${insightCards}
        <h2 style="color:#fff; margin:28px 0 10px;">Top 3 leads to focus on today</h2>
        <ol style="padding-left:20px;">${leads || '<li style="color:#6B6878;">No leads yet.</li>'}</ol>
        <a href="${dashboardUrl()}" style="display:inline-block; margin-top:24px; background:#7C6FFF; color:#fff; text-decoration:none; padding:12px 18px; border-radius:10px; font-weight:800;">Open dashboard</a>
        <p style="color:#6B6878; font-size:11px; margin-top:26px;">You are receiving this because NEXA is enabled for your BGOS business. You can unsubscribe from daily briefings in settings.</p>
      </div>
    </div>
  `;
}

async function createInsightIfNotDuplicate(
  businessId: string,
  insight: Pick<GeneratedInsight, "type" | "message" | "action">,
) {
  const since = daysAgo(1);
  const tokens = insight.message
    .toLowerCase()
    .split(/\s+/)
    .filter((token) => token.length > 4)
    .slice(0, 5);
  const duplicate = await prisma.nexaInsight.findFirst({
    where: {
      businessId,
      createdAt: { gte: since },
      OR: tokens.length
        ? tokens.map((token) => ({
            message: { contains: token, mode: "insensitive" },
          }))
        : [{ message: insight.message }],
    },
  });

  if (duplicate) return null;

  return prisma.nexaInsight.create({
    data: {
      businessId,
      type: insight.type,
      message: insight.message,
      action: insight.action,
    },
  });
}

export async function getBusinessContext(
  businessId: string,
): Promise<BusinessContext> {
  try {
    const now = new Date();
    const month = monthBounds(now);
    const weekAgo = daysAgo(7);
    const threeDaysAgo = daysAgo(3);
    const overdueDate = new Date();
    const activeSince = daysAgo(3);

    const business = await prisma.business.findUniqueOrThrow({
      where: { id: businessId },
      select: {
        name: true,
        type: true,
        teamSize: true,
        goal: true,
        healthScore: true,
      },
    });

    const [
      totalLeads,
      hotLeads,
      coldLeads,
      wonThisMonth,
      lostThisMonth,
      newLeadsThisWeek,
      totalRevenue,
      revenueThisMonthAgg,
      teamCount,
      activeUserIds,
      openTasks,
      overdueTasks,
      totalTasks,
      completedTasks,
      openBugs,
      highBugs,
      criticalBugs,
      openEscalations,
      recentActivity,
      topLeads,
      overdueFollowUps,
      bdms,
      recentInsights,
      emailsUnread,
      emailsFromLeads,
      emailsNeedingReply,
    ] = await Promise.all([
      prisma.lead.count({ where: { businessId } }),
      prisma.lead.count({ where: { businessId, score: { gt: 70 } } }),
      prisma.lead.count({ where: { businessId, score: { lt: 40 } } }),
      prisma.lead.count({
        where: {
          businessId,
          status: "WON",
          wonAt: { gte: month.start, lt: month.end },
        },
      }),
      prisma.lead.count({
        where: {
          businessId,
          status: "LOST",
          lostAt: { gte: month.start, lt: month.end },
        },
      }),
      prisma.lead.count({ where: { businessId, createdAt: { gte: weekAgo } } }),
      prisma.lead.aggregate({
        where: { businessId, status: "WON" },
        _sum: { value: true },
      }),
      prisma.lead.aggregate({
        where: {
          businessId,
          status: "WON",
          wonAt: { gte: month.start, lt: month.end },
        },
        _sum: { value: true },
      }),
      prisma.user.count({ where: { businessId } }),
      prisma.activityLog.findMany({
        where: { businessId, createdAt: { gte: activeSince } },
        distinct: ["userId"],
        select: { userId: true },
      }),
      prisma.task.count({
        where: { assignee: { businessId }, status: { not: "DONE" } },
      }),
      prisma.task.count({
        where: {
          assignee: { businessId },
          status: { not: "DONE" },
          dueDate: { lt: now },
        },
      }),
      prisma.task.count({ where: { assignee: { businessId } } }),
      prisma.task.count({ where: { assignee: { businessId }, status: "DONE" } }),
      prisma.bug.count({
        where: { businessId, status: { in: ["OPEN", "IN_PROGRESS"] } },
      }),
      prisma.bug.count({
        where: {
          businessId,
          severity: "HIGH",
          status: { in: ["OPEN", "IN_PROGRESS"] },
        },
      }),
      prisma.bug.count({
        where: {
          businessId,
          severity: "CRITICAL",
          status: { in: ["OPEN", "IN_PROGRESS"] },
        },
      }),
      prisma.escalation.count({
        where: {
          businessId,
          status: { in: ["OPEN", "ACKNOWLEDGED", "IN_PROGRESS"] },
        },
      }),
      prisma.activityLog.findMany({
        where: { businessId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.lead.findMany({
        where: { businessId, status: { notIn: ["WON", "LOST"] } },
        orderBy: { score: "desc" },
        take: 5,
      }),
      prisma.lead.findMany({
        where: {
          businessId,
          followUpDate: { lt: overdueDate },
          status: { notIn: ["WON", "LOST"] },
        },
        orderBy: { followUpDate: "asc" },
        take: 20,
      }),
      prisma.user.findMany({ where: { businessId, role: "BDM" } }),
      prisma.nexaInsight.findMany({
        where: { businessId, read: false },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.email.count({ where: { businessId, isRead: false } }),
      prisma.email.count({ where: { businessId, label: "LEAD" } }),
      prisma.email.count({
        where: {
          businessId,
          nexaReplyDraft: null,
          receivedAt: { gte: daysAgo(2) },
        },
      }),
    ]);

    const recentActiveBdmIds = new Set(
      (
        await prisma.activityLog.findMany({
          where: {
            businessId,
            createdAt: { gte: threeDaysAgo },
            user: { role: "BDM" },
          },
          select: { userId: true },
        })
      ).map((item) => item.userId),
    );

    return {
      business,
      metrics: {
        totalLeads,
        hotLeads,
        coldLeads,
        wonThisMonth,
        lostThisMonth,
        newLeadsThisWeek,
        conversionRate:
          totalLeads > 0
            ? Math.round((wonThisMonth / totalLeads) * 1000) / 10
            : 0,
        totalRevenue: totalRevenue._sum.value ?? 0,
        revenueThisMonth: revenueThisMonthAgg._sum.value ?? 0,
        teamCount,
        activeUsers: activeUserIds.length,
        openTasks,
        overdueTasks,
        completedTasks,
        totalTasks,
        openBugs,
        highBugs,
        criticalBugs,
        openEscalations,
        emailsUnread,
        emailsFromLeads,
        emailsNeedingReply,
      },
      recentActivity,
      topLeads,
      overdueFollowUps,
      underperformingBDMs: bdms.filter((bdm) => !recentActiveBdmIds.has(bdm.id)),
      recentInsights,
    };
  } catch (error) {
    nexaLog("getBusinessContext", error);
    return fallbackContext();
  }
}

export function calculateHealthScore(context: BusinessContext): number {
  try {
    if (!context?.metrics) return 50;

    const leadActivity = Math.min(context.metrics.newLeadsThisWeek * 2, 30);
    const conversion = Math.min(context.metrics.conversionRate * 0.25, 25);
    const teamActivity =
      context.metrics.teamCount > 0
        ? (context.metrics.activeUsers / context.metrics.teamCount) * 20
        : 0;
    const taskCompletion =
      context.metrics.totalTasks > 0
        ? (context.metrics.completedTasks / context.metrics.totalTasks) * 15
        : 15;
    const bugHealth = Math.max(
      0,
      10 - context.metrics.criticalBugs * 5 - context.metrics.highBugs * 2,
    );
    const score = leadActivity + conversion + teamActivity + taskCompletion + bugHealth;

    return Number.isFinite(score) ? Math.round(clamp(score, 0, 100)) : 50;
  } catch (error) {
    nexaLog("calculateHealthScore", error);
    return 50;
  }
}

export async function generateNexaInsights(
  businessId: string,
  context: BusinessContext,
) {
  let insights = insightFallback(context);

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 700,
      system: INSIGHT_PROMPT,
      messages: [
        {
          role: "user",
          content: JSON.stringify(context, null, 2),
        },
      ],
    });
    const text = response.content.find((block) => block.type === "text");
    if (text?.type === "text") {
      insights = parseInsights(text.text, context);
    }
  } catch (error) {
    nexaLog("generateNexaInsights:claude", error);
    insights = insightFallback(context);
  }

  try {
    await prisma.nexaInsight.createMany({
      data: insights.map((insight) => ({
        businessId,
        type: insight.type,
        message: insight.message,
        action: insight.action,
      })),
    });
  } catch (error) {
    nexaLog("generateNexaInsights:save", error);
  }

  return insights;
}

export async function runMorningBriefing(businessId: string) {
  try {
    const context = await getBusinessContext(businessId);
    const healthScore = calculateHealthScore(context);

    await prisma.business.update({
      where: { id: businessId },
      data: { healthScore },
    });

    await prisma.businessSnapshot.create({
      data: {
        businessId,
        healthScore,
        totalLeads: context.metrics.totalLeads,
        newLeads: context.metrics.newLeadsThisWeek,
        wonLeads: context.metrics.wonThisMonth,
        lostLeads: context.metrics.lostThisMonth,
        totalRevenue: context.metrics.totalRevenue,
        teamActivity: context.recentActivity.length,
        openTasks: context.metrics.openTasks,
        openBugs: context.metrics.openBugs,
        nexaActionsCount: await prisma.nexaAction.count({
          where: { businessId, createdAt: { gte: daysAgo(1) } },
        }),
      },
    });

    const insights = await generateNexaInsights(businessId, context);

    const [bosses, topUnreadEmails] = await Promise.all([
      prisma.user.findMany({ where: { businessId, role: "BOSS" } }),
      prisma.email.findMany({
        where: { businessId, label: "LEAD", isRead: false },
        orderBy: { receivedAt: "desc" },
        take: 2,
        select: {
          fromName: true,
          from: true,
          subject: true,
          snippet: true,
        },
      }),
    ]);

    const emailMetrics =
      context.metrics.emailsUnread > 0
        ? {
            unread: context.metrics.emailsUnread,
            fromLeads: context.metrics.emailsFromLeads,
            topEmails: topUnreadEmails,
          }
        : undefined;

    await Promise.allSettled(
      bosses.map((boss) =>
        sendEmail(
          boss.email,
          `BGOS morning briefing: ${context.business.name}`,
          morningEmailHtml(
            boss.name,
            healthScore,
            insights,
            context.topLeads,
            emailMetrics,
          ),
        ),
      ),
    );

    await prisma.nexaAction.create({
      data: {
        businessId,
        type: "morning_briefing",
        description: "NEXA generated and sent the morning briefing.",
        payload: { healthScore, insights },
      },
    });

    return { context, healthScore, insights, bossesNotified: bosses.length };
  } catch (error) {
    nexaLog("runMorningBriefing", error);
    const context = fallbackContext();
    return {
      context,
      healthScore: 50,
      insights: insightFallback(context),
      bossesNotified: 0,
    };
  }
}

export async function runNexaAlerts(businessId: string) {
  try {
    const context = await getBusinessContext(businessId);
    const alerts: Array<Pick<GeneratedInsight, "type" | "message" | "action">> = [];

    const veryOverdue = context.overdueFollowUps.filter(
      (lead) => lead.followUpDate && lead.followUpDate < daysAgo(3),
    );
    if (veryOverdue.length > 0) {
      alerts.push({
        type: "warning",
        message: `${veryOverdue.length} leads are 3+ days overdue.`,
        action: "Assign follow-ups",
      });
    }

    const yesterday = await prisma.businessSnapshot.findFirst({
      where: { businessId, date: { lt: new Date() } },
      orderBy: { date: "desc" },
    });
    if (yesterday && yesterday.healthScore - context.business.healthScore > 10) {
      alerts.push({
        type: "warning",
        message: "Health score dropped more than 10 points.",
        action: "Review dashboard",
      });
    }

    if (context.metrics.newLeadsThisWeek === 0) {
      alerts.push({
        type: "warning",
        message: "No new leads came in for 7 days.",
        action: "Launch campaign",
      });
    }

    context.underperformingBDMs.forEach((bdm) => {
      alerts.push({
        type: "action",
        message: `${bdm.name} has no activity in 48 hours.`,
        action: "Check with BDM",
      });
    });

    if (context.metrics.conversionRate < 10) {
      alerts.push({
        type: "opportunity",
        message: "Conversion rate is below 10 percent.",
        action: "Audit pipeline",
      });
    }

    const oldCriticalBugs = await prisma.bug.count({
      where: {
        businessId,
        severity: "CRITICAL",
        status: { in: ["OPEN", "IN_PROGRESS"] },
        createdAt: { lt: daysAgo(1) },
      },
    });
    if (oldCriticalBugs > 0) {
      alerts.push({
        type: "warning",
        message: `${oldCriticalBugs} critical bugs are open 24+ hours.`,
        action: "Escalate fixes",
      });
    }

    const created = await Promise.all(
      alerts.map((alert) => createInsightIfNotDuplicate(businessId, alert)),
    );

    return created.filter(Boolean);
  } catch (error) {
    nexaLog("runNexaAlerts", error);
    return [];
  }
}

export async function saveNexaMemory(
  businessId: string,
  key: string,
  value: Prisma.InputJsonValue,
  ttlHours?: number,
) {
  try {
    const expiresAt =
      typeof ttlHours === "number"
        ? new Date(Date.now() + ttlHours * 60 * 60 * 1000)
        : null;

    return prisma.nexaMemory.upsert({
      where: { businessId_key: { businessId, key } },
      update: { value, expiresAt },
      create: { businessId, key, value, expiresAt },
    });
  } catch (error) {
    nexaLog("saveNexaMemory", error);
    return null;
  }
}

export async function getNexaMemory(businessId: string, key: string) {
  try {
    const memory = await prisma.nexaMemory.findUnique({
      where: { businessId_key: { businessId, key } },
    });

    if (!memory) return null;

    if (memory.expiresAt && memory.expiresAt < new Date()) {
      await prisma.nexaMemory.delete({ where: { id: memory.id } });
      return null;
    }

    return memory;
  } catch (error) {
    nexaLog("getNexaMemory", error);
    return null;
  }
}

export type { BusinessContext, GeneratedInsight };
