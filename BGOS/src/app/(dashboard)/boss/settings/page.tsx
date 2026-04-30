import { redirect } from "next/navigation";

import { CancelTrialButton } from "@/components/boss/cancel-trial-button";
import { ChangePasswordForm } from "@/components/employee/change-password-form";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function updateBusiness(formData: FormData) {
  "use server";

  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { businessId: true, role: true },
  });

  if (!user?.businessId || user.role !== "BOSS") redirect("/login");

  await prisma.business.update({
    where: { id: user.businessId },
    data: {
      name: String(formData.get("name") ?? "").trim(),
      type: String(formData.get("type") ?? "").trim(),
      teamSize: String(formData.get("teamSize") ?? "").trim(),
      goal: String(formData.get("goal") ?? "").trim(),
    },
  });
}

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

export default async function BossSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      business: {
        select: {
          id: true,
          name: true,
          type: true,
          teamSize: true,
          goal: true,
          trialSubscription: {
            select: {
              status: true,
              trialEndsAt: true,
              monthlyAmount: true,
            },
          },
        },
      },
    },
  });

  if (!user?.business || user.role !== "BOSS") redirect("/login");

  return (
    <div className="min-h-screen bg-[#070709] pl-[240px] text-white">
      <Sidebar role="BOSS" userName={user.name} businessName={user.business.name} />
      <Navbar title="Settings" userName={user.name} role={user.role} />
      <main className="pt-[60px]">
        <div className="max-w-4xl space-y-6 p-8">
          <section>
            <h1 className="font-heading text-2xl font-bold">Settings</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Manage business profile, account security, and notifications.
            </p>
          </section>

          <form action={updateBusiness} className="rounded-2xl border border-white/10 bg-[#13131c] p-6">
            <h2 className="font-heading text-lg font-bold">Business profile</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {[
                ["name", "Business name", user.business.name],
                ["type", "Business type", user.business.type],
                ["teamSize", "Team size", user.business.teamSize],
                ["goal", "Primary goal", user.business.goal],
              ].map(([name, label, value]) => (
                <label key={name} className="text-sm font-medium text-zinc-300">
                  {label}
                  <input
                    name={name}
                    defaultValue={value}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#0e0e13] px-4 py-3 text-white outline-none focus:border-[#7C6FFF]"
                  />
                </label>
              ))}
            </div>
            <button className="mt-5 rounded-xl bg-[#7C6FFF] px-4 py-3 text-sm font-bold text-white">
              Save business profile
            </button>
          </form>

          <form action={updateProfile} className="rounded-2xl border border-white/10 bg-[#13131c] p-6">
            <h2 className="font-heading text-lg font-bold">Account</h2>
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
              Save account
            </button>
          </form>

          <ChangePasswordForm />

          {user.business.trialSubscription?.status === "TRIAL" ? (
            <CancelTrialButton
              trialEndsAt={user.business.trialSubscription.trialEndsAt.toISOString()}
              amount={user.business.trialSubscription.monthlyAmount}
            />
          ) : null}

          <section className="rounded-2xl border border-white/10 bg-[#13131c] p-6">
            <h2 className="font-heading text-lg font-bold">Notifications</h2>
            <div className="mt-5 space-y-3 text-sm text-zinc-300">
              {["Morning briefing email", "Lead alerts", "Team alerts"].map((label) => (
                <label key={label} className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="accent-[#7C6FFF]" />
                  {label}
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
            <h2 className="font-heading text-lg font-bold text-red-300">Danger zone</h2>
            <button disabled title="Contact support" className="mt-4 cursor-not-allowed rounded-xl border border-red-500/30 px-4 py-3 text-sm font-bold text-red-300 opacity-60">
              Delete account
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}
