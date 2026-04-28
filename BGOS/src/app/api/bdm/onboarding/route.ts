import { NextResponse } from "next/server";

import auth from "@/lib/auth";
import { saveNexaMemory } from "@/lib/nexa-brain";

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id || !session.user.businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await saveNexaMemory(
      session.user.businessId,
      `bde_onboarding_complete:${session.user.id}`,
      {
        key: "bde_onboarding_complete",
        userId: session.user.id,
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
