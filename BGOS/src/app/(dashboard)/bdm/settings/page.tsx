import { redirect } from "next/navigation";

import { ChangePasswordForm } from "@/components/employee/change-password-form";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function updateProfile(formData: FormData) {
  "use server";

  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name },
  });
}

export default async function BdmSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
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
          <form action={updateProfile} className="rounded-2xl border border-white/10 bg-[#13131c] p-6">
            <h2 className="font-heading text-lg font-bold">Profile</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-zinc-300">
                Name
                <input name="name" defaultValue={user.name} className="mt-2 w-full rounded-xl border border-white/10 bg-[#0e0e13] px-4 py-3 text-white outline-none focus:border-[#7C6FFF]" />
              </label>
              <label className="text-sm font-medium text-zinc-300">
                Email
                <input value={user.email} readOnly className="mt-2 w-full rounded-xl border border-white/10 bg-[#0e0e13] px-4 py-3 text-zinc-500 outline-none" />
              </label>
            </div>
            <button className="mt-5 rounded-xl bg-[#7C6FFF] px-4 py-3 text-sm font-bold text-white">
              Save profile
            </button>
          </form>
          <ChangePasswordForm />
        </div>
      </main>
    </div>
  );
}
