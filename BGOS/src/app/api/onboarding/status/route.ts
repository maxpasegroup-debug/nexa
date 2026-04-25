import { NextResponse } from "next/server";

import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        businessId: true,
        onboarding: {
          select: {
            completed: true,
            step: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({
      completed: user.onboarding?.completed ?? false,
      step: user.onboarding?.step ?? 0,
      businessId: user.businessId,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch onboarding status." },
      { status: 500 },
    );
  }
}
