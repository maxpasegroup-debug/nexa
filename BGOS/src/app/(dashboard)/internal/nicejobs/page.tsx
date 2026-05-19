import {
  BadgeCheck,
  BriefcaseBusiness,
  CircleDollarSign,
  FileSignature,
  RadioTower,
  Users,
} from "lucide-react";

import { requireInternalOwner } from "@/lib/internal-owner";
import { prisma } from "@/lib/prisma";
import {
  createNiceJobsFranchise,
  updateNiceJobsApplicationStatus,
  updateNiceJobsReferralStatus,
} from "@/lib/nicejobs/admin";

function decimalToNumber(value: unknown) {
  if (typeof value === "number") return value;
  if (value && typeof value === "object" && "toNumber" in value) {
    return (value as { toNumber: () => number }).toNumber();
  }

  return Number(value || 0);
}

export default async function InternalNiceJobsPage() {
  await requireInternalOwner();

  const [franchises, applications, referrals, payouts, webhookEvents] = await Promise.all([
    prisma.niceJobsFranchise.findMany({ orderBy: { createdAt: "desc" }, take: 12 }),
    prisma.niceJobsApplication.findMany({
      include: { franchise: true, user: true, agreements: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.niceJobsReferral.findMany({
      include: { franchise: true, user: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.niceJobsPayout.findMany({
      include: { user: true },
      orderBy: [{ year: "desc" }, { month: "desc" }],
      take: 20,
    }),
    prisma.niceJobsWebhookEvent.findMany({ orderBy: { receivedAt: "desc" }, take: 10 }),
  ]);

  const totalApproved = referrals
    .filter((referral) => ["VALIDATED", "APPROVED"].includes(referral.status))
    .reduce((sum, referral) => sum + decimalToNumber(referral.earningsOwed), 0);

  return (
    <main className="min-h-screen bg-[#f7f7f2] p-5 text-[#151515] sm:p-8">
      <div className="mx-auto grid max-w-7xl gap-6">
        <section className="rounded-lg border border-[#151515]/10 bg-white p-6">
          <p className="text-sm font-black uppercase text-[#1c7c54]">Internal operations</p>
          <h1 className="mt-2 text-3xl font-black tracking-normal">NICEJOBS Admin</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#555]">
            Manage franchises, applicant approvals, referral validation, payouts, and webhook health from BGOS.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-5">
          {[
            { label: "Franchises", value: franchises.length, icon: BriefcaseBusiness },
            { label: "Applications", value: applications.length, icon: FileSignature },
            { label: "Users", value: new Set(applications.map((application) => application.userId)).size, icon: Users },
            { label: "Approved GBP", value: totalApproved.toLocaleString("en-GB"), icon: CircleDollarSign },
            { label: "Webhooks", value: webhookEvents.length, icon: RadioTower },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.label} className="rounded-lg border border-[#151515]/10 bg-white p-5">
                <Icon size={22} className="text-[#1c7c54]" />
                <p className="mt-4 text-sm font-bold text-[#555]">{item.label}</p>
                <p className="mt-1 text-2xl font-black">{item.value}</p>
              </div>
            );
          })}
        </section>

        <section className="rounded-lg border border-[#151515]/10 bg-white p-6">
          <h2 className="text-xl font-black">Create or update franchise</h2>
          <form action={createNiceJobsFranchise} className="mt-5 grid gap-3 md:grid-cols-3">
            <input name="name" required placeholder="Franchise name" className="rounded-md border border-[#151515]/15 px-3 py-3 text-sm font-semibold" />
            <input name="slug" placeholder="slug" className="rounded-md border border-[#151515]/15 px-3 py-3 text-sm font-semibold" />
            <input name="category" placeholder="Category" className="rounded-md border border-[#151515]/15 px-3 py-3 text-sm font-semibold" />
            <input name="potentialEarnings" placeholder="Potential earnings" className="rounded-md border border-[#151515]/15 px-3 py-3 text-sm font-semibold" />
            <input name="commissionPercent" required type="number" step="0.01" placeholder="Commission %" className="rounded-md border border-[#151515]/15 px-3 py-3 text-sm font-semibold" />
            <input name="trainingDurationDays" type="number" placeholder="Training days" className="rounded-md border border-[#151515]/15 px-3 py-3 text-sm font-semibold" />
            <textarea name="description" placeholder="Description" className="min-h-24 rounded-md border border-[#151515]/15 px-3 py-3 text-sm font-semibold md:col-span-3" />
            <button className="rounded-md bg-[#151515] px-4 py-3 text-sm font-black text-white md:w-fit">
              Save franchise
            </button>
          </form>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-lg border border-[#151515]/10 bg-white p-6">
            <h2 className="text-xl font-black">Applications</h2>
            <div className="mt-5 grid gap-3">
              {applications.map((application) => (
                <div key={application.id} className="rounded-lg border border-[#151515]/10 bg-[#f7f7f2] p-4">
                  <p className="font-black">{application.user.name} · {application.franchise.name}</p>
                  <p className="mt-1 text-sm font-semibold text-[#555]">
                    {application.status.replaceAll("_", " ")} · {application.agreements.length ? "MOU signed" : "MOU pending"}
                  </p>
                  <form action={updateNiceJobsApplicationStatus} className="mt-3 flex flex-wrap gap-2">
                    <input type="hidden" name="applicationId" value={application.id} />
                    {["APPROVED", "ACTIVE", "REJECTED"].map((status) => (
                      <button key={status} name="status" value={status} className="rounded-md bg-white px-3 py-2 text-xs font-black text-[#151515]">
                        {status}
                      </button>
                    ))}
                  </form>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-[#151515]/10 bg-white p-6">
            <h2 className="text-xl font-black">Referral validation</h2>
            <div className="mt-5 grid gap-3">
              {referrals.map((referral) => (
                <div key={referral.id} className="rounded-lg border border-[#151515]/10 bg-[#f7f7f2] p-4">
                  <p className="font-black">{referral.user.name} · {referral.franchise.name}</p>
                  <p className="mt-1 text-sm font-semibold text-[#555]">
                    Sale {decimalToNumber(referral.saleAmount)} {referral.currency} · Earned {decimalToNumber(referral.earningsOwed)} · {referral.status}
                  </p>
                  <form action={updateNiceJobsReferralStatus} className="mt-3 flex flex-wrap gap-2">
                    <input type="hidden" name="referralId" value={referral.id} />
                    {["VALIDATED", "APPROVED", "REJECTED"].map((status) => (
                      <button key={status} name="status" value={status} className="rounded-md bg-white px-3 py-2 text-xs font-black text-[#151515]">
                        {status}
                      </button>
                    ))}
                  </form>
                </div>
              ))}
              {!referrals.length ? <p className="text-sm leading-6 text-[#555]">No referral events yet.</p> : null}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-lg border border-[#151515]/10 bg-white p-6">
            <h2 className="text-xl font-black">Payout queue</h2>
            <div className="mt-5 grid gap-3">
              {payouts.map((payout) => (
                <div key={payout.id} className="rounded-lg border border-[#151515]/10 bg-[#f7f7f2] p-4">
                  <p className="font-black">{payout.user.name}</p>
                  <p className="mt-1 text-sm font-semibold text-[#555]">
                    {payout.month}/{payout.year} · {decimalToNumber(payout.totalAmount)} {payout.currency} · {payout.status}
                  </p>
                </div>
              ))}
              {!payouts.length ? <p className="text-sm leading-6 text-[#555]">No payout batches yet.</p> : null}
            </div>
          </div>

          <div className="rounded-lg border border-[#151515]/10 bg-white p-6">
            <h2 className="text-xl font-black">Webhook monitor</h2>
            <div className="mt-5 grid gap-3">
              {webhookEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between gap-3 rounded-lg border border-[#151515]/10 bg-[#f7f7f2] p-4">
                  <div>
                    <p className="font-black">{event.source}</p>
                    <p className="mt-1 text-sm font-semibold text-[#555]">{event.eventId}</p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-xs font-black text-[#1c7c54]">
                    <BadgeCheck size={14} /> {event.status}
                  </span>
                </div>
              ))}
              {!webhookEvents.length ? <p className="text-sm leading-6 text-[#555]">No webhook events yet.</p> : null}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
