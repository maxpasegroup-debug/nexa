import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/api-auth";
import { getGmailAuthUrl } from "@/lib/gmail";

export async function GET() {
  const authResult = await requireAuth();
  if (authResult.response) {
    return authResult.response;
  }

  return NextResponse.json({ url: getGmailAuthUrl(authResult.user.id) });
}
