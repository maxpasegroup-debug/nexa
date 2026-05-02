import { redirect } from "next/navigation";

import { SetTargets } from "@/components/boss/set-targets";
import { MobileBossTeam } from "@/components/boss/mobile/mobile-boss-team";
import { TeamPerformance } from "@/components/boss/team-performance";
import { NexaPanel } from "@/components/boss/nexa-panel";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function BossTeamPage() {
  const session = await auth();

  if (!session?.user?.id) redirect("/login");

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
        },
      },
    },
  });

  if (!user?.businessId || !user.business) redirect("/onboarding");
  if (user.role !== "BOSS") redirect("/bdm");

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);

  const members = await prisma.user.findMany({
    where: { businessId: user.businessId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      updatedAt: true,
      _count: {
        select: {
          leads: {
            where: { createdAt: { gte: weekStart } },
          },
          tasks: {
            where: { status: "DONE" },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <>
      <div className="show-mobile hidden">
        <MobileBossTeam
          members={members.map((member) => ({
            id: member.id,
            name: member.name,
            email: member.email,
            role: member.role,
            active: member.updatedAt.getTime() > weekStart.getTime(),
            leadsThisWeek: member._count.leads,
            tasksDone: member._count.tasks,
          }))}
        />
      </div>
      <div className="hide-mobile min-h-screen bg-[#070709] pl-[240px] text-white md:pr-[320px]">
        <Sidebar role="BOSS" userName={user.name} businessName={user.business.name} />
        <Navbar title="Team" userName={user.name} role="BOSS" />

        <main className="pt-[60px]">
          <div className="space-y-6 p-8">
            <section>
              <h1 className="font-heading text-2xl font-bold">Team</h1>
              <p className="mt-1 text-sm text-zinc-500">
                Track BDM performance and set monthly targets.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-heading text-base font-bold">
                Team Performance
              </h2>
              <TeamPerformance />
            </section>

            <SetTargets />
          </div>
        </main>

        <NexaPanel businessId={user.business.id} />
      </div>
    </>
  );
}
