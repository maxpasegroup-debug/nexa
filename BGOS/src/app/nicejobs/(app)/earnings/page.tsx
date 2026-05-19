import { BadgeCheck, CircleDollarSign, Clock3, ReceiptText } from "lucide-react";

import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function decimalToNumber(value: unknown) {
  if (typeof value === "number") return value;
  if (value && typeof value === "object" && "toNumber" in value) {
    return (value as { toNumber: () => number }).toNumber();
  }

  return Number(value || 0);
}

function money(value: number, currency = "GBP") {
  return `${currency} ${value.toLocaleString("en-GB", { maximumFractionDigits: 2 })}`;
}

export default async function NiceJobsEarningsPage() {
  const session = await auth();
  const referrals = session?.user?.id
    ? await prisma.niceJobsReferral.findMany({
        where: { userId: session.user.id },
        include: { franchise: true },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const approved = referrals
    .filter((referral) => ["VALIDATED", "APPROVED"].includes(referral.status))
    .reduce((sum, referral) => sum + decimalToNumber(referral.earningsOwed), 0);
  const pending = referrals
    .filter((referral) => referral.status === "PENDING")
    .reduce((sum, referral) => sum + decimalToNumber(referral.earningsOwed), 0);

  return (
    <div className="grid gap-6">
      <section className="rounded-lg border border-[#151515]/10 bg-white p-6">
        <p className="text-sm font-black uppercase text-[#1c7c54]">Referral earnings</p>
        <h2 className="mt-2 text-3xl font-black tracking-normal">Live sales and commission tracking.</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#555]">
          BGOS and partner apps can now push referral events into NICEJOBS through the webhook receiver.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Approved", value: money(approved), icon: BadgeCheck },
          { label: "Pending", value: money(pending), icon: Clock3 },
          { label: "Events", value: referrals.length, icon: ReceiptText },
          { label: "Next payout", value: "1st-10th", icon: CircleDollarSign },
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
        <h3 className="text-xl font-black">Referral events</h3>
        <div className="mt-5 grid gap-3">
          {referrals.length ? (
            referrals.map((referral) => (
              <div key={referral.id} className="rounded-lg border border-[#151515]/10 bg-[#f7f7f2] p-4">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <p className="font-black">{referral.franchise.name}</p>
                    <p className="mt-1 text-sm font-semibold text-[#555]">
                      Sale {money(decimalToNumber(referral.saleAmount), referral.currency)} · {referral.status}
                    </p>
                  </div>
                  <span className="rounded-md bg-white px-3 py-2 text-sm font-black text-[#1c7c54]">
                    {money(decimalToNumber(referral.earningsOwed), referral.currency)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="rounded-lg border border-[#151515]/10 bg-[#f7f7f2] p-4 text-sm leading-6 text-[#555]">
              No referral events yet. Use your referral code from the Applications page once your partner flow is active.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
