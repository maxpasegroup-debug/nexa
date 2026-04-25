import { redirect } from "next/navigation";

import { IntegrationHealth } from "@/components/sde/integration-health";
import { NexaPanel } from "@/components/boss/nexa-panel";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function SdeIntegrationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, name: true, role: true, businessId: true, business: { select: { name: true } } } });
  if (!user?.businessId || !user.business) redirect("/onboarding");
  const integrations = await prisma.integrationHealth.findMany({ where: { businessId: user.businessId }, orderBy: { name: "asc" } });
  return <div className="min-h-screen bg-[#070709] pl-[240px] text-white md:pr-[320px]"><Sidebar role="SDE" userName={user.name} businessName={user.business.name} /><Navbar title="Integrations" userName={user.name} /><main className="pt-[60px]"><div className="p-8"><IntegrationHealth integrations={integrations.map((item) => ({ ...item, lastChecked: item.lastChecked.toISOString() }))} /></div></main><NexaPanel businessId={user.businessId} initialMessage="sde_morning_context" /></div>;
}
