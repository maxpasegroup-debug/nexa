import { NextResponse } from "next/server";
import { getCareer7Context } from "@/lib/career7-auth";

export async function GET() {
  const authResult = await getCareer7Context();
  if (authResult.response) return authResult.response;

  // Placeholder health check
  return NextResponse.json({
    status: "healthy",
    module: "career7",
    timestamp: new Date().toISOString(),
  });
}
