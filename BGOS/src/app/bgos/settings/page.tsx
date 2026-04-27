import Link from "next/link";
import { redirect } from "next/navigation";

import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function updateCompanyName(formData: FormData) {
  "use server";

  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { businessId: true },
  });

  if (!user?.businessId) redirect("/onboarding");

  await prisma.business.update({
    where: { id: user.businessId },
    data: { name },
  });
}

export default async function BgosSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      business: {
        select: {
          name: true,
          type: true,
          teamSize: true,
        },
      },
    },
  });

  if (!user?.business) redirect("/onboarding");

  const domain = user.email.split("@")[1] ?? "Workspace domain unavailable";

  return (
    <main className="min-h-screen bg-[#070709] p-6 text-white">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="mt-2 text-white/60">
            Company, workspace, and account preferences.
          </p>
        </div>

        <section className="rounded-2xl border border-white/10 bg-[#13131c] p-6">
          <h2 className="font-heading text-lg font-bold">Company</h2>
          <form action={updateCompanyName} className="mt-4 space-y-3">
            <label className="block text-sm text-zinc-400">
              Company name
              <input
                name="name"
                defaultValue={user.business.name}
                className="mt-2 w-full rounded-xl border border-white/10 bg-[#0e0e13] px-4 py-3 text-white outline-none focus:border-[#7C6FFF]"
              />
            </label>
            <button className="rounded-lg bg-[#7C6FFF] px-4 py-2 text-sm font-bold">
              Save changes
            </button>
          </form>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-[#13131c] p-5">
            <p className="text-xs uppercase text-zinc-500">Company plan</p>
            <p className="mt-2 text-lg font-semibold">Active workspace</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#13131c] p-5">
            <p className="text-xs uppercase text-zinc-500">Workspace domain</p>
            <p className="mt-2 text-lg font-semibold">{domain}</p>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#13131c] p-6">
          <h2 className="font-heading text-lg font-bold">
            Notification preferences
          </h2>
          <div className="mt-4 space-y-3 text-sm text-zinc-300">
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="accent-[#7C6FFF]" />
              Email notifications
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="accent-[#7C6FFF]" />
              Daily Nexa briefing
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#13131c] p-6">
          <h2 className="font-heading text-lg font-bold">Password</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Use the password settings page to update your sign-in credentials.
          </p>
          <Link
            href="/boss/settings"
            className="mt-4 inline-flex rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-white"
          >
            Change password
          </Link>
        </section>
      </div>
    </main>
  );
}
