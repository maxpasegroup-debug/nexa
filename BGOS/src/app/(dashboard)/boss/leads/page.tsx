import { redirect } from "next/navigation";

import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LeadsPage } from "@/components/crm/leads-page";

export default async function BossLeadsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      businessId: true,
      business: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!user?.businessId || !user.business) {
    redirect("/onboarding");
  }

  const [initialLeads, teamMembers] = await Promise.all([
    prisma.lead.findMany({
      where: { businessId: user.businessId },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.user.findMany({
      where: { businessId: user.businessId },
      select: {
        id: true,
        name: true,
        role: true,
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return (
    <LeadsPage
      initialLeads={initialLeads.map((lead) => ({
        ...lead,
        createdAt: lead.createdAt.toISOString(),
        updatedAt: lead.updatedAt.toISOString(),
        followUpDate: lead.followUpDate?.toISOString() ?? null,
      }))}
      teamMembers={teamMembers}
      currentUser={{
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessId: user.businessId,
        businessName: user.business.name,
      }}
    />
  );
}
