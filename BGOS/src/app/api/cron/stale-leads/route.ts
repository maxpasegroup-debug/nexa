import { NextRequest, NextResponse } from "next/server";

import { verifyCronSecret } from "@/lib/cron-guard";
import { runStaleLeadsCron } from "@/lib/cron-jobs";

export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runStaleLeadsCron();

  return NextResponse.json(result);
}
