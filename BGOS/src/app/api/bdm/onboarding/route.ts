import { NextResponse } from "next/server";

import { requireRole } from "@/lib/api-auth";
import { saveNexaMemory } from "@/lib/nexa-brain";

export async function POST() {
  try {
    const authResult = await requireRole("BDM");
    if (authResult.response) {
      return authResult.response;
    }

    if (!authResult.user.businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await saveNexaMemory(
      authResult.user.businessId,
      `bde_onboarding_complete:${authResult.user.id}`,
      {
        key: "bde_onboarding_complete",
        userId: authResult.user.id,
        completedAt: new Date().toISOString(),
      },
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Unable to complete onboarding." },
      { status: 500 },
    );
  }
}
