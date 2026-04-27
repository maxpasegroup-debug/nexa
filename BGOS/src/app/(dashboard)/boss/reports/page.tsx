import { redirect } from "next/navigation";

import { AnalyticsCharts } from "@/components/boss/analytics-charts";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function BossReportsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      role: true,
      business: { select: { id: true, name: true } },
    },
  });

  if (!user?.business) redirect("/onboarding");

  return (
    <div className="min-h-screen bg-[#070709] pl-[240px] text-white md:pr-[320px]">
      <Sidebar
        role={user.role}
        userName={user.name}
        businessName={user.business.name}
      />
      <Navbar title="Reports" userName={user.name} role={user.role} />
      <main className="pt-[60px]">
        <div className="space-y-6 p-8">
          <div>
            <h1 className="font-heading text-2xl font-bold">Reports</h1>
            <p className="mt-2 text-sm text-zinc-500">
              Performance reports generated from real workspace data.
            </p>
          </div>
          <AnalyticsCharts businessId={user.business.id} />
        </div>
      </main>
    </div>
  );
}
