import { NextResponse } from "next/server";

import { requireInternalOwnerApi } from "@/lib/internal-owner";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const context = await requireInternalOwnerApi();
  if ("error" in context) return context.error;

  const replacementUsers = await prisma.user.findMany({
    where: {
      businessId: context.business.id,
      role: "BDM",
      active: true,
      id: { not: params.id },
    },
    orderBy: { name: "asc" },
    select: { id: true },
  });

  const openLeads = await prisma.lead.findMany({
    where: { assignedTo: params.id, status: { notIn: ["WON", "LOST"] } },
    select: { id: true },
  });

  await prisma.$transaction([
    prisma.user.update({
      where: { id: params.id },
      data: { active: false, status: "ARCHIVED" },
    }),
    ...openLeads.map((lead, index) =>
      prisma.lead.update({
        where: { id: lead.id },
        data: {
          assignedTo: replacementUsers.length
            ? replacementUsers[index % replacementUsers.length].id
            : null,
        },
      }),
    ),
  ]);

  return NextResponse.json({ success: true, reassignedLeads: openLeads.length });
}
