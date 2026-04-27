import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

import {
  InternalSidebar,
  InternalTopbar,
} from "@/components/internal/bgos-internal-dashboard";
import { requireInternalOwner } from "@/lib/internal-owner";
import { prisma } from "@/lib/prisma";

async function updateSettings(formData: FormData) {
  "use server";

  const { owner, business } = await requireInternalOwner();
  const businessName = String(formData.get("businessName") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (businessName) {
    await prisma.business.update({
      where: { id: business.id },
      data: { name: businessName },
    });
  }

  if (password.length >= 8) {
    await prisma.user.update({
      where: { id: owner.id },
      data: {
        password: await bcrypt.hash(password, 12),
        defaultPassword: false,
      },
    });
  }

  redirect("/internal/settings");
}

export default async function InternalSettingsPage() {
  const { owner, business } = await requireInternalOwner();

  return (
    <div className="min-h-screen bg-[#070709] pl-[240px] text-white">
      <InternalSidebar user={owner} />
      <InternalTopbar user={owner} />
      <main className="pt-[60px]">
        <div className="max-w-3xl space-y-6 p-8">
          <div>
            <h1 className="font-heading text-2xl font-bold">Settings</h1>
            <p className="mt-2 text-sm text-zinc-500">
              This section is being set up.
            </p>
          </div>
          <form action={updateSettings} className="space-y-6 rounded-2xl border border-white/10 bg-[#13131c] p-6">
            <label className="block text-sm font-medium text-zinc-300">
              Business name
              <input name="businessName" defaultValue={business.name} className="mt-2 w-full rounded-xl border border-white/10 bg-[#0e0e13] px-4 py-3 text-white outline-none focus:border-[#7C6FFF]" />
            </label>
            <label className="block text-sm font-medium text-zinc-300">
              Owner email
              <input value={owner.email} readOnly className="mt-2 w-full rounded-xl border border-white/10 bg-[#0e0e13] px-4 py-3 text-zinc-500 outline-none" />
            </label>
            <label className="block text-sm font-medium text-zinc-300">
              Change password
              <input name="password" type="password" minLength={8} placeholder="New password" className="mt-2 w-full rounded-xl border border-white/10 bg-[#0e0e13] px-4 py-3 text-white outline-none focus:border-[#7C6FFF]" />
            </label>
            <div className="space-y-3 text-sm text-zinc-300">
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="accent-[#7C6FFF]" />
                Owner briefing notifications
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="accent-[#7C6FFF]" />
                Employee account email alerts
              </label>
            </div>
            <button className="rounded-xl bg-[#7C6FFF] px-4 py-3 text-sm font-bold text-white">Save settings</button>
          </form>
        </div>
      </main>
    </div>
  );
}
