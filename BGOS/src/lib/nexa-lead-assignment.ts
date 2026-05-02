import { prisma } from "@/lib/prisma";

export async function getNextBDM(businessId: string) {
  const bdms = await prisma.user.findMany({
    where: { businessId, role: "BDM", active: true, status: { not: "ARCHIVED" } },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      _count: {
        select: {
          leads: {
            where: { bdmStatus: { in: ["NEW", "CONTACTED", "FOLLOW_UP"] } },
          },
        },
      },
    },
  });

  const winner = bdms.sort((a, b) => a._count.leads - b._count.leads)[0];
  if (!winner) throw new Error("No active BDM available for lead assignment.");
  return winner;
}

export async function getIntelligentAssignment(
  businessId: string,
  leadData: {
    industry?: string;
    location?: string;
    companySize?: string;
  },
): Promise<{ bdmId: string; bdmName: string; reason: string }> {
  const bdms = await prisma.user.findMany({
    where: { businessId, role: "BDM", active: true, status: { not: "ARCHIVED" } },
    include: {
      leads: {
        where: { bdmStatus: { in: ["NEW", "CONTACTED", "FOLLOW_UP"] } },
      },
      bdeCommissions: {
        where: {
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      },
    },
  });

  if (bdms.length === 0) throw new Error("No active BDM available for assignment.");

  const scores = await Promise.all(
    bdms.map(async (bdm) => {
      let score = 0;

      if (leadData.industry) {
        const industryLeads = await prisma.lead.count({
          where: {
            assignedTo: bdm.id,
            bdmStatus: "ONBOARDING",
            OR: [
              { company: { contains: leadData.industry, mode: "insensitive" } },
              { notes: { contains: leadData.industry, mode: "insensitive" } },
              { managementNotes: { contains: leadData.industry, mode: "insensitive" } },
            ],
          },
        });
        score += Math.min(40, industryLeads * 10);
      }

      const activeLeads = bdm.leads.length;
      score += Math.max(0, 30 - activeLeads * 3);
      score += Math.min(30, bdm.bdeCommissions.length * 5);

      return { bdmId: bdm.id, bdmName: bdm.name, score, activeLeads };
    }),
  );

  scores.sort((a, b) => b.score - a.score);
  const winner = scores[0];
  const reason = `Best lead fit: ${winner.activeLeads} active leads and ${winner.score}/100 assignment score.`;

  const internal = await prisma.business.findFirst({
    where: { name: "BGOS" },
    select: { id: true },
  });
  if (internal) {
    await prisma.nexaInsight.create({
      data: {
        businessId: internal.id,
        type: "LEAD_ASSIGNED",
        message: `Management lead assigned to ${winner.bdmName}. ${reason}`,
        action: "Review assignment",
      },
    });
  }

  return { bdmId: winner.bdmId, bdmName: winner.bdmName, reason };
}
