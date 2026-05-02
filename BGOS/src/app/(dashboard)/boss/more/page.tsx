import { redirect } from "next/navigation";

import { MobileBossMore } from "@/components/boss/mobile/mobile-boss-more";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function BossMorePage() {
  const session = await auth();

  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      role: true,
      businessId: true,
      business: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!user?.businessId || !user.business) redirect("/onboarding");
  if (user.role !== "BOSS" && user.role !== "ADMIN") redirect(`/${user.role.toLowerCase()}`);

  return (
    <>
      <div className="show-mobile hidden">
        <MobileBossMore />
      </div>
      <div className="hide-mobile min-h-screen bg-[#070709] pl-[240px] text-white">
        <Sidebar role={user.role} userName={user.name} businessName={user.business.name} />
        <Navbar title="More" userName={user.name} role={user.role} />
        <main className="pt-[60px]">
          <div className="p-8">
            <MobileBossMore />
          </div>
        </main>
      </div>
    </>
  );
}
