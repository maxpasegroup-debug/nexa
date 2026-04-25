import { redirect } from "next/navigation";

import { SdeEscalationsPage } from "@/components/sde/sde-escalations-page";
import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function SdeEscalationsRoute() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, name: true, role: true, email: true, businessId: true, business: { select: { name: true } } } });
  if (!user?.businessId || !user.business) redirect("/onboarding");
  const escalations = await prisma.escalation.findMany({ where: { businessId: user.businessId }, include: { raiser: { select: { id: true, name: true, role: true } }, resolver: { select: { id: true, name: true, role: true } } }, orderBy: { createdAt: "desc" } });
  return <SdeEscalationsPage user={{ id: user.id, name: user.name, role: user.role, email: user.email, businessId: user.businessId, businessName: user.business.name }} initialEscalations={escalations.map((item) => ({ ...item, createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString(), resolvedAt: item.resolvedAt?.toISOString() ?? null }))} />;
}
