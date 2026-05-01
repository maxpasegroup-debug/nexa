import { NextRequest, NextResponse } from "next/server";

import {
  exchangeCodeForTokens,
  syncEmails,
  verifyGmailOAuthState,
} from "@/lib/gmail";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!code || !state) {
    return NextResponse.redirect(`${appUrl}/boss/inbox?connected=false`);
  }

  let userId: string;
  try {
    userId = verifyGmailOAuthState(state).userId;
  } catch (error) {
    console.warn("[gmail:oauth:state]", error);
    return NextResponse.redirect(`${appUrl}/boss/inbox?connected=false`);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, businessId: true },
  });

  if (!user?.businessId) {
    return NextResponse.redirect(`${appUrl}/boss/inbox?connected=false`);
  }

  const tokens = await exchangeCodeForTokens(code);

  if (!tokens.email || !tokens.accessToken) {
    return NextResponse.redirect(`${appUrl}/boss/inbox?connected=false`);
  }

  const existing = await prisma.emailAccount.findUnique({
    where: {
      userId_email: {
        userId: user.id,
        email: tokens.email,
      },
    },
  });

  const account = existing
    ? await prisma.emailAccount.update({
        where: { id: existing.id },
        data: {
          businessId: user.businessId,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken || existing.refreshToken,
          tokenExpiry: tokens.tokenExpiry,
          isActive: true,
        },
      })
    : await prisma.emailAccount.create({
        data: {
          userId: user.id,
          businessId: user.businessId,
          email: tokens.email,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          tokenExpiry: tokens.tokenExpiry,
        },
      });

  void syncEmails(account.id).catch((error) => {
    console.error("Initial Gmail sync failed", error);
  });

  return NextResponse.redirect(`${appUrl}/boss/inbox?connected=true`);
}
