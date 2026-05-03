import { redirect } from "next/navigation";

import { CustomersPageContent } from "@/components/bdm/customers-page";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function BdmCustomersPage() {
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
    <div className="min-h-screen bg-[#070709] text-white md:pl-[240px]">
      <Sidebar role="BDM" userName={user.name} businessName={user.business.name} />
      <Navbar title="My Customers" userName={user.name} role={user.role} />
      <main className="pt-[60px]">
        <div className="p-8">
          <CustomersPageContent />
        </div>
      </main>
    </div>
  );
}
