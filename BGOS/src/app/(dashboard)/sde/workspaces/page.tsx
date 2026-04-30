import { redirect } from "next/navigation";

import { WorkspaceBuildsPage } from "@/components/sde/workspace-builds-page";
import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function SdeWorkspacesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      businessId: true,
      business: { select: { name: true } },
    },
  });

  if (!user?.businessId || !user.business || user.role !== "SDE") {
    redirect("/login");
  }

  const leads = await prisma.onboardingLead.findMany({
    where: { assignedSDEId: user.id },
    include: {
      assignedBDM: { select: { name: true, email: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <WorkspaceBuildsPage
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessId: user.businessId,
        businessName: user.business.name,
      }}
      initialLeads={leads.map((lead) => ({
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        companyName: lead.companyName,
        businessType: lead.businessType,
        employeeCount: lead.employeeCount,
        challenge: lead.challenge,
        status: lead.status,
        selectedPlan: lead.selectedPlan,
        bdmNotes: lead.bdmNotes,
        updatedAt: lead.updatedAt.toISOString(),
        assignedBDM: lead.assignedBDM,
      }))}
    />
  );
}
