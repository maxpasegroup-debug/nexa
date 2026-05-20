import { CalendarClock, CheckCircle2, WalletCards } from "lucide-react";

import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function decimalToNumber(value: unknown) {
  if (typeof value === "number") return value;
  if (value && typeof value === "object" && "toNumber" in value) {
    return (value as { toNumber: () => number }).toNumber();
  }

  return Number(value || 0);
}

export default async function NiceJobsPayoutsPage() {
  const session = await auth();
  const payouts = session?.user?.id
    ? await prisma.niceJobsPayout.findMany({
        where: { userId: session.user.id },
        orderBy: [{ year: "desc" }, { month: "desc" }],
      })
    : [];

  return (
    <div className="grid gap-6">
      <section className="rounded-lg border border-[#151515]/10 bg-white p-6">
        <p className="text-sm font-black uppercase text-[#1c7c54]">Payouts</p>
        <h2 className="mt-2 text-3xl font-black tracking-normal">Monthly commission release.</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#555]">
          Approved commissions are grouped into monthly payout records. NICEJOBS payout window is the 1st to 10th.
        </p>
      </section>

      <section className="grid gap-4">
        {payouts.length ? (
          payouts.map((payout) => (
            <article key={payout.id} className="rounded-lg border border-[#151515]/10 bg-white p-5">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[#e2f6ed] text-[#1c7c54]">
                    {payout.status === "PAID" ? <CheckCircle2 size={22} /> : <CalendarClock size={22} />}
                  </span>
                  <div>
                    <h3 className="font-black">
                      {payout.month}/{payout.year} · {payout.currency} {decimalToNumber(payout.totalAmount).toLocaleString("en-GB")}
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-[#555]">
                      {payout.status} · {payout.provider}
                    </p>
                  </div>
                </div>
                <span className="rounded-md bg-[#f7f7f2] px-3 py-2 text-sm font-black text-[#151515]">
                  1st-10th
                </span>
              </div>
            </article>
          ))
        ) : (
          <section className="rounded-lg border border-[#151515]/10 bg-white p-6">
            <WalletCards size={24} className="text-[#1c7c54]" />
            <h3 className="mt-4 text-xl font-black">No payouts scheduled yet</h3>
            <p className="mt-2 text-sm leading-6 text-[#555]">
              Validated referral earnings will appear here after the monthly payout batch is generated.
            </p>
          </section>
        )}
      </section>
    </div>
  );
}
