import { NextResponse } from "next/server";

import { finishBossWorkLock } from "@/lib/boss-work-locks";
import { requireInternalOwnerApi } from "@/lib/internal-owner";

export async function PATCH(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const context = await requireInternalOwnerApi();
  if ("error" in context) return context.error;

  const lock = await finishBossWorkLock(params.id, context.owner.id);
  return NextResponse.json({ lock });
}
