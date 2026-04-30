import { redirect } from "next/navigation";

import { OnboardingLeads } from "@/components/bdm/onboarding-leads";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function BdmOnboardingPage() {
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
    <div className="min-h-screen bg-[#070709] pl-[240px] text-white">
      <Sidebar role="BDM" userName={user.name} businessName={user.business.name} />
      <Navbar title="Onboarding" userName={user.name} role={user.role} />
      <main className="pt-[60px]">
        <div className="space-y-6 p-8">
          <div>
            <h1 className="font-heading text-2xl font-bold">Onboarding</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Turn landing page enquiries into complete workspace build briefs.
            </p>
          </div>
          <OnboardingLeads />
        </div>
      </main>
    </div>
  );
}
