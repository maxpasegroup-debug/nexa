import { redirect } from "next/navigation";

import { LeadList } from "@/components/bdm/lead-list";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function BdmMarketplaceLeadsRoute() {
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
  if (user.role !== "BDM") redirect("/");

  return (
    <div className="min-h-screen bg-[#070709] pl-[240px] text-white">
      <Sidebar role="BDM" userName={user.name} businessName={user.business.name} />
      <Navbar title="Marketplace leads" userName={user.name} role="BDM" />
      <main className="pt-[60px]">
        <div className="p-8">
          <LeadList
            sourceFilter="marketplace"
            title="Marketplace leads"
            subtitle="These prospects came from the BGOS marketplace — they already know what agent they want."
            bdmName={user.name}
          />
        </div>
      </main>
    </div>
  );
}
