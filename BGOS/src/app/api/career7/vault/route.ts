import { NextResponse } from "next/server";
import auth from "@/lib/auth";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
