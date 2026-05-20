import { ShieldCheck, UserRound } from "lucide-react";

import auth from "@/lib/auth";
import { getNiceJobsProfile, updateNiceJobsProfile } from "@/lib/nicejobs/profile";

export default async function NiceJobsProfilePage() {
  const session = await auth();
  const profile = session?.user?.id ? await getNiceJobsProfile(session.user.id) : null;

  return (
    <div className="mx-auto grid max-w-4xl gap-6">
      <section className="rounded-lg border border-[#151515]/10 bg-white p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-[#e2f6ed] text-[#1c7c54]">
            <UserRound size={24} />
          </span>
          <div>
            <p className="text-sm font-black uppercase text-[#1c7c54]">NICEJOBS profile</p>
            <h2 className="mt-2 text-3xl font-black tracking-normal">Partner and payout details.</h2>
            <p className="mt-3 text-sm leading-6 text-[#555]">
              Complete this before payouts are released. Sensitive account values are not displayed back in full.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-[#151515]/10 bg-white p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h3 className="text-xl font-black">Profile status</h3>
          <span className="inline-flex items-center gap-2 rounded-md bg-[#e2f6ed] px-3 py-2 text-sm font-black text-[#1c7c54]">
            <ShieldCheck size={16} /> {profile?.profileStatus?.replaceAll("_", " ") || "INCOMPLETE"}
          </span>
        </div>

        <form action={updateNiceJobsProfile} className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-black">Phone</span>
            <input name="phone" defaultValue={profile?.phone || ""} className="rounded-md border border-[#151515]/15 bg-[#f7f7f2] px-4 py-3 text-sm font-semibold outline-none focus:border-[#1c7c54]" />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-black">City</span>
            <input name="city" defaultValue={profile?.city || ""} className="rounded-md border border-[#151515]/15 bg-[#f7f7f2] px-4 py-3 text-sm font-semibold outline-none focus:border-[#1c7c54]" />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-black">Country</span>
            <input name="country" defaultValue={profile?.country || ""} className="rounded-md border border-[#151515]/15 bg-[#f7f7f2] px-4 py-3 text-sm font-semibold outline-none focus:border-[#1c7c54]" />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-black">Payout name</span>
            <input name="payoutName" defaultValue={profile?.payoutName || ""} className="rounded-md border border-[#151515]/15 bg-[#f7f7f2] px-4 py-3 text-sm font-semibold outline-none focus:border-[#1c7c54]" />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-black">Payout method</span>
            <select name="payoutMethod" defaultValue={profile?.payoutMethod || "BANK"} className="rounded-md border border-[#151515]/15 bg-[#f7f7f2] px-4 py-3 text-sm font-semibold outline-none focus:border-[#1c7c54]">
              <option value="BANK">Bank transfer</option>
              <option value="STRIPE">Stripe</option>
              <option value="RAZORPAY">Razorpay</option>
              <option value="MANUAL">Manual</option>
            </select>
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-black">Account number / ID</span>
            <input name="payoutAccount" placeholder={profile?.payoutAccountLast4 ? `Saved ending ${profile.payoutAccountLast4}` : "Enter payout account"} className="rounded-md border border-[#151515]/15 bg-[#f7f7f2] px-4 py-3 text-sm font-semibold outline-none focus:border-[#1c7c54]" />
          </label>
          <label className="grid gap-2 md:col-span-2">
            <span className="text-sm font-black">Routing / IFSC / payout note</span>
            <input name="payoutRouting" className="rounded-md border border-[#151515]/15 bg-[#f7f7f2] px-4 py-3 text-sm font-semibold outline-none focus:border-[#1c7c54]" />
          </label>
          <button className="w-fit rounded-md bg-[#1c7c54] px-5 py-3 text-sm font-black text-white">
            Save profile
          </button>
        </form>
      </section>
    </div>
  );
}
