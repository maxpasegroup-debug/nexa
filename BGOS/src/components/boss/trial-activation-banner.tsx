"use client";

import Link from "next/link";

import { PLANS } from "@/lib/plans";

export function TrialActivationBanner({
  trialEndsAt,
  amount,
}: {
  trialEndsAt: string;
  amount: number;
}) {
  const daysRemaining = Math.max(
    0,
    Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / 86_400_000),
  );
  const urgent = daysRemaining <= 2;
  const plan =
    Object.values(PLANS).find((item) => item.price === Math.round(amount)) ?? PLANS.GROWTH;
  const date = new Date(trialEndsAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <section
      className={`rounded-2xl border p-4 ${
        urgent
          ? "border-amber-400/30 bg-amber-400/10"
          : "border-[#2ECC8A]/25 bg-[#2ECC8A]/10"
      }`}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className={urgent ? "font-semibold text-amber-100" : "font-semibold text-emerald-100"}>
            Free trial active: {daysRemaining} day{daysRemaining === 1 ? "" : "s"} remaining
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            You are on the {plan.name} plan · {plan.priceDisplay}/month + 18% GST · Trial ends {date}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/boss/settings" className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-bold text-zinc-200">
            Cancel
          </Link>
          <Link href="/boss/settings" className="rounded-xl bg-[#2ECC8A] px-4 py-2.5 text-sm font-bold text-[#07100b]">
            Upgrade
          </Link>
        </div>
      </div>
    </section>
  );
}
