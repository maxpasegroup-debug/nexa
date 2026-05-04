import { NextResponse } from "next/server";
import auth from "@/lib/auth";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Placeholder dashboard metrics
  return NextResponse.json({
    metrics: {
      careerScore: null,
      walletBalance: 0,
      credits: 0,
      tasksCompleted: 0,
    },
  });
}
