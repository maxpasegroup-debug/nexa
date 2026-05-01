import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

import auth from "@/lib/auth";
import { requireRole } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

type InternalOwner = {
  id: string;
  name: string;
  email: string;
  role: "OWNER";
  business: { id: string; name: string; healthScore: number } | null;
};

function isInternalOwner(owner: {
  email: string;
  role: string;
  business: { name: string } | null;
}) {
  return owner.role === "OWNER" && (owner.email === "boss@bgos.online" || owner.business?.name === "BGOS");
}

async function findInternalBusiness(owner: InternalOwner) {
  return (
    owner.business ??
    (await prisma.business.findFirst({
      where: { name: "BGOS" },
      select: { id: true, name: true, healthScore: true },
    }))
  );
}

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

  if (!owner || !isInternalOwner(owner)) {
    redirect("/login");
  }

  const business = await findInternalBusiness(owner as InternalOwner);

  if (!business) redirect("/login");

  return { owner, business };
}

export async function requireInternalOwnerApi() {
  const authResult = await requireRole("OWNER");
  if (authResult.response) return { error: authResult.response };

  const owner = await prisma.user.findUnique({
    where: { id: authResult.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      business: { select: { id: true, name: true, healthScore: true } },
    },
  });

  if (!owner || !isInternalOwner(owner)) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  const business = await findInternalBusiness(owner as InternalOwner);
  if (!business) {
    return {
      error: NextResponse.json(
        { error: "BGOS internal business not found." },
        { status: 404 },
      ),
    };
  }

  return { owner: owner as InternalOwner, business };
}

export function customerBusinessWhere(internalBusinessId: string) {
  return { id: { not: internalBusinessId } };
}
