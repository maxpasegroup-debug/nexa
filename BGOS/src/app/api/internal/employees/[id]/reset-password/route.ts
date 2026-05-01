import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { sendPasswordResetEmail } from "@/lib/email";
import { requireInternalOwnerApi } from "@/lib/internal-owner";
import { prisma } from "@/lib/prisma";

const DEFAULT_PASSWORD = "123456789";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const context = await requireInternalOwnerApi();
  if ("error" in context) return context.error;

  const employee = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true, name: true, email: true },
  });

  if (!employee) {
    return NextResponse.json({ error: "Employee not found." }, { status: 404 });
  }

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: employee.id },
      data: {
        password: hashedPassword,
        defaultPassword: true,
      },
    }),
    prisma.passwordResetRequest.create({
      data: {
        userId: employee.id,
        requestedBy: context.owner.id,
        completed: true,
      },
    }),
  ]);

  const emailSent = await sendPasswordResetEmail({
    name: employee.name,
    email: employee.email,
    newPassword: DEFAULT_PASSWORD,
  });

  return NextResponse.json({
    message: emailSent
      ? "Password reset. Email sent."
      : "Password reset. Email could not be sent.",
    emailSent,
  });
}
