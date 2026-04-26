import { redirect } from "next/navigation";

import { ChangePasswordForm } from "@/components/employee/change-password-form";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function BdmSettingsPage() {
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
      <Navbar title="Settings" userName={user.name} />
      <main className="pt-[60px]">
        <div className="space-y-6 p-8">
          <section>
            <h1 className="font-heading text-2xl font-bold">Settings</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Manage your employee account security.
            </p>
          </section>
          <ChangePasswordForm />
        </div>
      </main>
    </div>
  );
}
