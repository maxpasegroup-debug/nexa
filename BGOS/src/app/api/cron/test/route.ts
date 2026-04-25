import { NextRequest, NextResponse } from "next/server";

import { verifyCronSecret } from "@/lib/cron-guard";
import {
  runDailySnapshotCron,
  runHealthCheckCron,
  runMorningBriefingCron,
  runRemindersCron,
  runStaleLeadsCron,
} from "@/lib/cron-jobs";

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = {
    morningBriefing: await runMorningBriefingCron(),
    healthCheck: await runHealthCheckCron(),
    dailySnapshot: await runDailySnapshotCron(),
    reminders: await runRemindersCron(),
    staleLeads: await runStaleLeadsCron(),
  };

  return NextResponse.json({ results, timestamp: new Date().toISOString() });
}
