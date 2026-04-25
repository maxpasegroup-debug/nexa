import { redirect } from "next/navigation";

import { BdmLeadsPage } from "@/components/bdm/bdm-leads-page";
import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function BdmLeadsRoute() {
  const session = await auth();

  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      role: true,
      businessId: true,
      business: { select: { name: true } },
    },
  });

  if (!user?.businessId || !user.business) redirect("/onboarding");

  const leads = await prisma.lead.findMany({
    where: { assignedTo: user.id },
    include: {
      assignee: { select: { id: true, name: true, role: true } },
      _count: { select: { activities: true } },
      activities: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      },
    },
    orderBy: [{ score: "desc" }],
  });

  return (
    <BdmLeadsPage
      user={{
        id: user.id,
        name: user.name,
        role: user.role,
        businessId: user.businessId,
        businessName: user.business.name,
      }}
      initialLeads={leads.map((lead) => ({
        id: lead.id,
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        company: lead.company,
        source: lead.source,
        status: lead.status,
        score: lead.score,
        scoreReason: lead.scoreReason,
        value: lead.value,
        notes: lead.notes,
        assignedTo: lead.assignedTo,
        assignee: lead.assignee,
        followUpDate: lead.followUpDate?.toISOString() ?? null,
        createdAt: lead.createdAt.toISOString(),
        updatedAt: lead.updatedAt.toISOString(),
        activitiesCount: lead._count.activities,
        lastActivityDate: lead.activities[0]?.createdAt.toISOString() ?? null,
      }))}
    />
  );
}
