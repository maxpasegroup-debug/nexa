import { NextResponse } from "next/server";
import { getCareer7Context } from "@/lib/career7-auth";

export async function GET(request: Request) {
  const authResult = await getCareer7Context(request);
  if (authResult.response) return authResult.response;

  return NextResponse.json({
    status: "healthy",
    module: "blizzway",
    businessModel: authResult.context.businessModel,
    timestamp: new Date().toISOString(),
  });
}
