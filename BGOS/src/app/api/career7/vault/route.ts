import { NextResponse } from "next/server";
import { getCareer7Context } from "@/lib/career7-auth";

export async function GET() {
  const authResult = await getCareer7Context();
  if (authResult.response) return authResult.response;

  // Placeholder vault data
  return NextResponse.json({
    vault: {
      certificates: 0,
      achievements: 0,
      tier: "STARTER",
      vaultItems: [],
    },
  });
}
