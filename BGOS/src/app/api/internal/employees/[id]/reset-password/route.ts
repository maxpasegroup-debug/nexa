import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import auth from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

const DEFAULT_PASSWORD = "123456789";

async function getOwner() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const owner = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, role: true },
  });

  if (owner?.email !== "boss@bgos.online" || owner.role !== "OWNER") {
    return null;
  }

  return owner;
}

export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const owner = await getOwner();
  if (!owner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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
        requestedBy: owner.id,
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
