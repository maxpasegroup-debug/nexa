import { NextResponse } from "next/server";
import auth from "@/lib/auth";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Placeholder health check
  return NextResponse.json({
    status: "healthy",
    module: "career7",
    timestamp: new Date().toISOString(),
  });
}
