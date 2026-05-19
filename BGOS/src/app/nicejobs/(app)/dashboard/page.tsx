import Link from "next/link";
import { ArrowRight, BadgeCheck, CircleDollarSign, ClipboardList, Target } from "lucide-react";

import auth from "@/lib/auth";
import { getNiceJobsOpportunities, getNiceJobsUserSummary } from "@/lib/nicejobs/data";

function money(value: number) {
  return `GBP ${value.toLocaleString("en-GB", { maximumFractionDigits: 2 })}`;
}

export default async function NiceJobsDashboardPage() {
  const session = await auth();
  const userId = session?.user?.id || "";
  const [opportunities, summary] = await Promise.all([
    getNiceJobsOpportunities(),
    getNiceJobsUserSummary(userId),
  ]);

  const activeApplication = summary.applications[0];

  return (
    <div className="grid gap-6">
      <section className="rounded-lg border border-[#151515]/10 bg-white p-6">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-black uppercase text-[#1c7c54]">NICEJOBS dashboard</p>
            <h2 className="mt-2 text-3xl font-black tracking-normal">Train, refer, earn, repeat.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#555]">
              Track your franchise applications, validated sales, and payout readiness from one BGOS-powered workspace.
            </p>
          </div>
          <Link
            href="/nicejobs/opportunities"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-[#151515] px-4 py-3 text-sm font-black text-white transition hover:bg-[#2b2b2b]"
          >
            Pick opportunity <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Applications", value: summary.applications.length, icon: ClipboardList },
          { label: "Referrals", value: summary.referralsCount, icon: Target },
          { label: "Approved", value: money(summary.approvedEarnings), icon: BadgeCheck },
          { label: "Pending", value: money(summary.pendingEarnings), icon: CircleDollarSign },
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

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-lg border border-[#151515]/10 bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-xl font-black">Available opportunities</h3>
            <Link href="/nicejobs/opportunities" className="text-sm font-black text-[#1c7c54]">
              View all
            </Link>
          </div>
          <div className="mt-5 grid gap-3">
            {opportunities.slice(0, 3).map((opportunity) => (
              <Link
                key={opportunity.id}
                href={`/nicejobs/opportunities/${opportunity.slug}`}
                className="rounded-lg border border-[#151515]/10 p-4 transition hover:border-[#1c7c54]/50"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <h4 className="font-black">{opportunity.name}</h4>
                    <p className="mt-1 text-sm leading-6 text-[#555]">{opportunity.description}</p>
                  </div>
                  <span className="w-fit rounded-md bg-[#e2f6ed] px-2.5 py-1 text-xs font-black text-[#1c7c54]">
                    {opportunity.commissionPercent}%
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-[#151515]/10 bg-[#151515] p-6 text-white">
          <h3 className="text-xl font-black">Current status</h3>
          {activeApplication ? (
            <div className="mt-5">
              <p className="text-sm font-semibold text-white/55">{activeApplication.franchiseName}</p>
              <p className="mt-2 text-2xl font-black">{activeApplication.status.replaceAll("_", " ")}</p>
              <p className="mt-4 rounded-md bg-white/10 p-3 text-sm font-bold">
                Referral code: {activeApplication.referralCode}
              </p>
            </div>
          ) : (
            <div className="mt-5">
              <p className="text-sm leading-6 text-white/70">
                No active application yet. Choose an opportunity to start the MOU and training flow.
              </p>
              <Link
                href="/nicejobs/opportunities"
                className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#f0c85a] px-4 py-3 text-sm font-black text-[#151515]"
              >
                Explore <ArrowRight size={17} />
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
