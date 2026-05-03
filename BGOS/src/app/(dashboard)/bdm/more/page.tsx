import { redirect } from "next/navigation";

import { MobileBDMMore } from "@/components/bdm/mobile/mobile-bdm-more";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function BdmMorePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      role: true,
      business: { select: { name: true } },
    },
  });

  if (!user?.business || user.role !== "BDM") redirect("/login");

  return (
    <>
      <div className="show-mobile hidden">
        <MobileBDMMore />
      </div>
      <div className="hide-mobile min-h-screen bg-[#070709] pl-[240px] text-white">
        <Sidebar role="BDM" userName={user.name} businessName={user.business.name} />
        <Navbar title="More" userName={user.name} />
        <main className="pt-[60px]">
          <div className="grid gap-3 p-8 md:max-w-xl">
            <a href="/bdm/nexa" className="rounded-2xl border border-white/10 bg-[#13131c] p-4 font-bold text-white">
              🧠 NEXA
            </a>
            <a href="/bdm/settings" className="rounded-2xl border border-white/10 bg-[#13131c] p-4 font-bold text-white">
              ⚙️ Settings
            </a>
          </div>
        </main>
      </div>
    </>
  );
}
