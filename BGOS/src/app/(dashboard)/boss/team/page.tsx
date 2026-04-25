import { redirect } from "next/navigation";

import { SetTargets } from "@/components/boss/set-targets";
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

  return (
    <div className="min-h-screen bg-[#070709] pl-[240px] text-white md:pr-[320px]">
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
  );
}
