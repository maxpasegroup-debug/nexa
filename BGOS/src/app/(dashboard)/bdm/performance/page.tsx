import { redirect } from "next/navigation";

import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function BdmPerformancePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      business: { select: { name: true } },
    },
  });

  if (!user?.business) redirect("/onboarding");

  const [total, won, calls] = await Promise.all([
    prisma.lead.count({ where: { assignedTo: user.id } }),
    prisma.lead.count({ where: { assignedTo: user.id, status: "WON" } }),
    prisma.callLog.count({ where: { userId: user.id } }),
  ]);

  return (
    <div className="min-h-screen bg-[#070709] pl-[240px] text-white md:pr-[320px]">
      <Sidebar role="BDM" userName={user.name} businessName={user.business.name} />
      <Navbar title="Performance" userName={user.name} />
      <main className="pt-[60px]">
        <div className="space-y-6 p-8">
          <h1 className="font-heading text-2xl font-bold">Performance</h1>
          <section className="grid gap-4 md:grid-cols-3">
            {[
              ["Assigned leads", total],
              ["Won leads", won],
              ["Logged calls", calls],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-white/10 bg-[#13131c] p-5"
              >
                <p className="text-xs uppercase text-zinc-500">{label}</p>
                <p className="mt-2 text-2xl font-bold">{value}</p>
              </div>
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}
