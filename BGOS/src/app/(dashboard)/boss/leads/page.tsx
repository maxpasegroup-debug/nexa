import { redirect } from "next/navigation";

import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LeadsPage } from "@/components/crm/leads-page";
import { MobileBossPipeline } from "@/components/boss/mobile/mobile-boss-pipeline";

function parseStages(value: unknown) {
  if (Array.isArray(value)) return value.map(String);
  return ["NEW", "CONTACTED", "DEMO", "PROPOSAL", "WON"];
}

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

  const [initialLeads, teamMembers, pipelines] = await Promise.all([
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
    prisma.pipeline.findMany({
      where: { businessId: user.businessId, isActive: true },
      include: {
        leads: {
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
        },
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const serializedLeads = initialLeads.map((lead) => ({
    ...lead,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
    followUpDate: lead.followUpDate?.toISOString() ?? null,
  }));

  return (
    <>
      <div className="show-mobile hidden">
        <MobileBossPipeline
          leads={serializedLeads.map((lead) => ({
            id: lead.id,
            name: lead.name,
            company: lead.company,
            phone: lead.phone,
            score: lead.score,
            status: lead.status,
            notes: lead.notes,
            assignee: lead.assignee,
          }))}
          pipelines={pipelines.map((pipeline) => ({
            id: pipeline.id,
            name: pipeline.name,
            productName: pipeline.productName,
            color: pipeline.color,
            stages: parseStages(pipeline.stages),
            leads: pipeline.leads.map((lead) => ({
              id: lead.id,
              name: lead.name,
              company: lead.company,
              phone: lead.phone,
              score: lead.score,
              status: lead.status,
              notes: lead.notes,
              assignee: lead.assignee,
            })),
          }))}
        />
      </div>
      <div className="hide-mobile">
        <LeadsPage
          initialLeads={serializedLeads}
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
      </div>
    </>
  );
}
