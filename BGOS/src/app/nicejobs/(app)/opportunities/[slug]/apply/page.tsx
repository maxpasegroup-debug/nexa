import Link from "next/link";
import { notFound } from "next/navigation";
import { FileSignature, ShieldCheck } from "lucide-react";

import { applyToNiceJobsOpportunity } from "@/lib/nicejobs/applications";
import { getNiceJobsOpportunity } from "@/lib/nicejobs/data";

export default async function NiceJobsApplyPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { error?: string };
}) {
  const opportunity = await getNiceJobsOpportunity(params.slug);

  if (!opportunity) notFound();

  return (
    <div className="mx-auto grid max-w-4xl gap-6">
      <section className="rounded-lg border border-[#151515]/10 bg-white p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-[#e2f6ed] text-[#1c7c54]">
            <FileSignature size={24} />
          </span>
          <div>
            <p className="text-sm font-black uppercase text-[#1c7c54]">Digital MOU</p>
            <h2 className="mt-2 text-3xl font-black tracking-normal">{opportunity.name}</h2>
            <p className="mt-3 text-sm leading-6 text-[#555]">
              Review the core terms, sign digitally, and NICEJOBS will create your application agreement record.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-[#151515]/10 bg-white p-6">
        <h3 className="text-xl font-black">Agreement summary</h3>
        <div className="mt-5 grid gap-3 text-sm leading-6 text-[#333]">
          <p>Partner: {opportunity.name}</p>
          <p>Commission: {opportunity.commissionPercent}% on validated sales/referrals.</p>
          <p>Payment schedule: monthly payout window between the 1st and 10th.</p>
          <p>Training: completion required before active payout eligibility.</p>
        </div>

        <form action={applyToNiceJobsOpportunity} className="mt-6 grid gap-4">
          <input type="hidden" name="slug" value={opportunity.slug} />
          <label className="grid gap-2">
            <span className="text-sm font-black">Digital signature</span>
            <input
              name="signatureText"
              required
              placeholder="Type your full name"
              className="rounded-md border border-[#151515]/15 bg-[#f7f7f2] px-4 py-3 text-sm font-semibold outline-none focus:border-[#1c7c54]"
            />
          </label>

          <label className="flex items-start gap-3 rounded-lg border border-[#151515]/10 bg-[#f7f7f2] p-4 text-sm leading-6 text-[#333]">
            <input name="accepted" type="checkbox" required className="mt-1 h-4 w-4 accent-[#1c7c54]" />
            <span>
              I accept the NICEJOBS micro-franchise MOU terms and understand that commissions become payable only after
              training completion and validated referral data.
            </span>
          </label>

          {searchParams.error ? (
            <p className="rounded-md bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              Please add your signature and accept the MOU terms.
            </p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#1c7c54] px-5 py-3 text-sm font-black text-white transition hover:bg-[#166843]"
            >
              Sign and apply <ShieldCheck size={17} />
            </button>
            <Link
              href={`/nicejobs/opportunities/${opportunity.slug}`}
              className="inline-flex items-center justify-center rounded-md border border-[#151515]/15 bg-white px-5 py-3 text-sm font-black text-[#151515]"
            >
              Review details
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}
