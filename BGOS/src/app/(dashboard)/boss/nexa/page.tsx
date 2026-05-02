import { redirect } from "next/navigation";

import { MobileBossNexa } from "@/components/boss/mobile/mobile-boss-nexa";
import { NexaLogPage } from "@/components/boss/nexa-log-page";
import { NexaPanel } from "@/components/boss/nexa-panel";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function BossNexaPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      role: true,
      businessId: true,
      business: {
        select: {
          id: true,
          name: true,
          healthScore: true,
        },
      },
    },
  });

  if (!user?.businessId || !user.business) {
    redirect("/onboarding");
  }

  if (user.role !== "BOSS" && user.role !== "ADMIN") {
    redirect(`/${user.role.toLowerCase()}`);
  }

  const cronSecret =
    process.env.NODE_ENV === "development" ? process.env.CRON_SECRET ?? "" : "";

  const [totalLeads, hotLeads, teamCount, wonThisMonth] = await Promise.all([
    prisma.lead.count({ where: { businessId: user.businessId } }),
    prisma.lead.count({ where: { businessId: user.businessId, score: { gt: 70 } } }),
    prisma.user.count({ where: { businessId: user.businessId } }),
    prisma.lead.count({ where: { businessId: user.businessId, status: "WON" } }),
  ]);

  return (
    <>
      <div className="show-mobile hidden">
        <MobileBossNexa
          context={{
            healthScore: user.business.healthScore,
            totalLeads,
            hotLeads,
            teamCount,
            revenueThisMonth: wonThisMonth * 0,
          }}
        />
      </div>
      <div className="hide-mobile min-h-screen bg-[#070709] pl-[240px] text-white md:pr-[320px]">
        <Sidebar
          role={user.role}
          userName={user.name}
          businessName={user.business.name}
        />
        <Navbar title="NEXA" userName={user.name} role="BOSS" />

        <main className="pt-[60px]">
          <div className="p-8">
            <NexaLogPage cronSecret={cronSecret} />
          </div>
        </main>

        <NexaPanel businessId={user.business.id} />
      </div>
    </>
  );
}
