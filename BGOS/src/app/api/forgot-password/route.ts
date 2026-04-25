import crypto from "crypto";
import { NextResponse } from "next/server";

import { sendEmail } from "@/lib/mail";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const successResponse = {
      message: "If an account exists, a password reset email has been sent.",
    };

    if (!email) {
      return NextResponse.json(successResponse);
    }

    const user = await prisma.user.findUnique({
      where: { email: String(email).toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(successResponse);
    }

    const token = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpiry,
      },
    });

    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

    await sendEmail(
      user.email,
      "Reset your BGOS password",
      `<p>Use the link below to reset your password. This link expires in 1 hour.</p><p><a href="${resetLink}">${resetLink}</a></p>`,
    );

    return NextResponse.json(successResponse);
  } catch {
    return NextResponse.json(
      { error: "Unable to process password reset request." },
      { status: 500 },
    );
  }
}
