import { NextResponse } from "next/server";
import { getCareer7Context } from "@/lib/career7-auth";
import { buildBdp } from "@/lib/career7-data";
import { ensureCareer7Wallet } from "@/lib/career7-wallet";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authResult = await getCareer7Context(request);
    if (authResult.response) return authResult.response;

    const [bdp, wallet, tasksCompleted] = await Promise.all([
      buildBdp(authResult.context),
      ensureCareer7Wallet(authResult.context.businessId, authResult.context.userId),
      prisma.career7GrowthBoardAgent.count({
        where: {
          businessId: authResult.context.businessId,
          userId: authResult.context.userId,
          status: "ACTIVE",
        },
      }),
    ]);

    return NextResponse.json({
      metrics: {
        careerScore: bdp.profileStrength,
        walletBalance: wallet.balance,
        credits: wallet.balance,
        tasksCompleted,
      },
    });
  } catch (error) {
    console.error("[career7:metrics]", error);
    return NextResponse.json({ error: "Unable to load Blizzway metrics." }, { status: 500 });
  }
}
