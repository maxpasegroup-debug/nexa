import { sendEmail } from "@/lib/mail";
import {
  calculateHealthScore,
  getBusinessContext,
  runMorningBriefing,
  runNexaAlerts,
} from "@/lib/nexa-brain";
import { prisma } from "@/lib/prisma";

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

function thirtyMinutesFromNow() {
  return new Date(Date.now() + 30 * 60 * 1000);
}

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

export async function runMorningBriefingCron() {
  const businesses = await prisma.business.findMany({ select: { id: true } });
  const results = await Promise.allSettled(
    businesses.map((business) => runMorningBriefing(business.id)),
  );

  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error("Morning briefing failed", {
        businessId: businesses[index]?.id,
        error: result.reason instanceof Error ? result.reason.message : result.reason,
      });
    }
  });

  return {
    processed: businesses.length,
    successes: results.filter((result) => result.status === "fulfilled").length,
    failures: results.filter((result) => result.status === "rejected").length,
    timestamp: new Date().toISOString(),
  };
}

export async function runHealthCheckCron() {
  const businesses = await prisma.business.findMany({ select: { id: true } });
  const results = await Promise.allSettled(
    businesses.map(async (business) => {
      const context = await getBusinessContext(business.id);
      const healthScore = calculateHealthScore(context);

      await prisma.business.update({
        where: { id: business.id },
        data: { healthScore },
      });
      const alerts = await runNexaAlerts(business.id);

      return { businessId: business.id, healthScore, alertsCreated: alerts.length };
    }),
  );

  return {
    processed: businesses.length,
    successes: results.filter((result) => result.status === "fulfilled").length,
    failures: results.filter((result) => result.status === "rejected").length,
    results: results.map((result, index) =>
      result.status === "fulfilled"
        ? result.value
        : {
            businessId: businesses[index]?.id,
            error:
              result.reason instanceof Error
                ? result.reason.message
                : String(result.reason),
          },
    ),
    timestamp: new Date().toISOString(),
  };
}

export async function runDailySnapshotCron() {
  const businesses = await prisma.business.findMany({ select: { id: true } });
  const results = await Promise.allSettled(
    businesses.map(async (business) => {
      const context = await getBusinessContext(business.id);

      return prisma.businessSnapshot.create({
        data: {
          businessId: business.id,
          healthScore: context.business.healthScore,
          totalLeads: context.metrics.totalLeads,
          newLeads: context.metrics.newLeadsThisWeek,
          wonLeads: context.metrics.wonThisMonth,
          lostLeads: context.metrics.lostThisMonth,
          totalRevenue: context.metrics.totalRevenue,
          teamActivity: context.recentActivity.length,
          openTasks: context.metrics.openTasks,
          openBugs: context.metrics.openBugs,
          nexaActionsCount: await prisma.nexaAction.count({
            where: { businessId: business.id, createdAt: { gte: daysAgo(1) } },
          }),
        },
      });
    }),
  );

  return {
    snapshotsCreated: results.filter((result) => result.status === "fulfilled")
      .length,
    failures: results.filter((result) => result.status === "rejected").length,
    timestamp: new Date().toISOString(),
  };
}

export async function runRemindersCron() {
  const reminders = await prisma.reminder.findMany({
    where: {
      sent: false,
      dueAt: {
        lte: thirtyMinutesFromNow(),
      },
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      lead: { select: { id: true, name: true } },
    },
  });

  const results = await Promise.allSettled(
    reminders.map(async (reminder) => {
      await sendEmail(
        reminder.user.email,
        `BGOS reminder: ${reminder.lead.name}`,
        `
          <div style="font-family:Arial,sans-serif;background:#070709;color:#F0EEF8;padding:24px;">
            <div style="max-width:600px;margin:0 auto;background:#13131c;border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:22px;">
              <h2 style="margin:0 0 12px;color:#fff;">Reminder for ${reminder.lead.name}</h2>
              <p style="color:#c9c7d4;line-height:1.6;">${reminder.message}</p>
              <a href="${appUrl()}/bdm/leads?lead=${reminder.lead.id}" style="display:inline-block;margin-top:16px;background:#7C6FFF;color:#fff;padding:10px 14px;border-radius:8px;text-decoration:none;font-weight:700;">Open lead</a>
            </div>
          </div>
        `,
      );
      await prisma.reminder.update({
        where: { id: reminder.id },
        data: { sent: true },
      });
    }),
  );

  return {
    sent: results.filter((result) => result.status === "fulfilled").length,
    failures: results.filter((result) => result.status === "rejected").length,
    timestamp: new Date().toISOString(),
  };
}

export async function runStaleLeadsCron() {
  const fiveDaysAgo = daysAgo(5);
  const now = new Date();
  const staleLeads = await prisma.lead.findMany({
    where: {
      status: { in: ["NEW", "CONTACTED"] },
      OR: [{ lastContactAt: null }, { lastContactAt: { lt: fiveDaysAgo } }],
      AND: [{ OR: [{ followUpDate: null }, { followUpDate: { lt: now } }] }],
    },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      business: { select: { name: true } },
    },
  });

  await prisma.nexaInsight.createMany({
    data: staleLeads.map((lead) => ({
      businessId: lead.businessId,
      type: "action",
      message: `${lead.name} is stale and needs follow-up.`,
      action: "Contact lead today",
    })),
  });

  const grouped = staleLeads.reduce<Record<string, typeof staleLeads>>(
    (acc, lead) => {
      if (!lead.assignedTo) return acc;
      acc[lead.assignedTo] = [...(acc[lead.assignedTo] ?? []), lead];
      return acc;
    },
    {},
  );

  const emailResults = await Promise.allSettled(
    Object.values(grouped).map(async (leads) => {
      const assignee = leads[0]?.assignee;
      if (!assignee?.email) return;
      const list = leads
        .map(
          (lead) =>
            `<li style="margin:8px 0;color:#F0EEF8;">${lead.name} <span style="color:#6B6878;">${lead.phone ?? lead.email ?? ""}</span></li>`,
        )
        .join("");

      await sendEmail(
        assignee.email,
        `BGOS: ${leads.length} stale leads need follow-up`,
        `
          <div style="font-family:Arial,sans-serif;background:#070709;padding:24px;">
            <div style="max-width:640px;margin:0 auto;background:#13131c;border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:22px;">
              <h2 style="color:#fff;margin:0 0 12px;">Stale leads for ${assignee.name}</h2>
              <p style="color:#6B6878;">NEXA found leads that need contact today.</p>
              <ul>${list}</ul>
              <a href="${appUrl()}/bdm/leads" style="display:inline-block;margin-top:16px;background:#7C6FFF;color:#fff;padding:10px 14px;border-radius:8px;text-decoration:none;font-weight:700;">Open my leads</a>
            </div>
          </div>
        `,
      );
    }),
  );

  return {
    staleLeadsFound: staleLeads.length,
    bdmEmailsSent: emailResults.filter((result) => result.status === "fulfilled")
      .length,
    emailFailures: emailResults.filter((result) => result.status === "rejected")
      .length,
    timestamp: new Date().toISOString(),
  };
}
