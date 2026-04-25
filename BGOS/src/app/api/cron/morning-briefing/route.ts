import { NextRequest, NextResponse } from "next/server";

import { verifyCronSecret } from "@/lib/cron-guard";
import { runMorningBriefingCron } from "@/lib/cron-jobs";

export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runMorningBriefingCron();

  return NextResponse.json(result);
}
