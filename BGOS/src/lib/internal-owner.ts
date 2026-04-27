import { redirect } from "next/navigation";

import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function requireInternalOwner() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const owner = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      business: { select: { id: true, name: true, healthScore: true } },
    },
  });

  if (owner?.email !== "boss@bgos.online" || owner.role !== "OWNER") {
    redirect("/login");
  }

  const business =
    owner.business ??
    (await prisma.business.findFirst({
      where: { name: "BGOS" },
      select: { id: true, name: true, healthScore: true },
    }));

  if (!business) redirect("/login");

  return { owner, business };
}

export function customerBusinessWhere(internalBusinessId: string) {
  return { id: { not: internalBusinessId } };
}
