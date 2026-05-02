import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { requireInternalOwnerApi } from "@/lib/internal-owner";
import { prisma } from "@/lib/prisma";

const DEFAULT_PASSWORD = "BGOS@123456";

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

  return NextResponse.json({
    success: true,
    message: "Password reset to BGOS@123456.",
  });
}
