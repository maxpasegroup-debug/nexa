import { redirect } from "next/navigation";

import { MobileBDMNexa } from "@/components/bdm/mobile/mobile-bdm-nexa";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function BdmNexaPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      role: true,
      businessId: true,
      business: { select: { name: true } },
    },
  });

  if (!user?.businessId || !user.business) redirect("/onboarding");
  if (user.role !== "BDM") redirect("/");

  return (
    <>
      <div className="show-mobile hidden">
        <MobileBDMNexa />
      </div>
      <div className="hide-mobile min-h-screen bg-[#070709] pl-[240px] text-white">
        <Sidebar role="BDM" userName={user.name} businessName={user.business.name} />
        <Navbar title="NEXA" userName={user.name} role="BDM" />
        <main className="pt-[60px]">
          <div className="p-8">
            <MobileBDMNexa />
          </div>
        </main>
      </div>
    </>
  );
}
