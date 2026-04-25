import { NextResponse } from "next/server";

import {
  getCurrentBusiness,
  getDashboardMetrics,
} from "@/lib/dashboard/server";

export async function GET() {
  try {
    const context = await getCurrentBusiness();

    if (context.error) {
      return context.error;
    }

    const metrics = await getDashboardMetrics(
      context.business.id,
      context.business.healthScore,
    );

    return NextResponse.json(metrics);
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch dashboard metrics." },
      { status: 500 },
    );
  }
}
