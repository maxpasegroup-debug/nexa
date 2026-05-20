import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BadgePoundSterling, BookOpenCheck, Clock, ShieldCheck } from "lucide-react";

import { career7CommissionNotes, career7Products } from "@/lib/nicejobs/career7";
import { getNiceJobsOpportunity } from "@/lib/nicejobs/data";

export default async function NiceJobsOpportunityDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const opportunity = await getNiceJobsOpportunity(params.slug);

  if (!opportunity) notFound();
  const isCareer7 = opportunity.slug === "career7-in";

  return (
    <div className="grid gap-6">
      <section className="rounded-lg border border-[#151515]/10 bg-white p-6">
        <p className="text-sm font-black uppercase text-[#1c7c54]">{opportunity.category}</p>
        <div className="mt-3 flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
          <div>
            <h2 className="text-4xl font-black tracking-normal">{opportunity.name}</h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[#555]">{opportunity.description}</p>
          </div>
          <Link
            href={`/nicejobs/opportunities/${opportunity.slug}/apply`}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-[#1c7c54] px-5 py-3 text-sm font-black text-white transition hover:bg-[#166843]"
          >
            Apply <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Commission", value: `${opportunity.commissionPercent}%`, icon: BadgePoundSterling },
          { label: "Training", value: `${opportunity.trainingDurationDays} days`, icon: Clock },
          { label: "Eligibility", value: "MOU + training", icon: ShieldCheck },
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
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[#e2f6ed] text-[#1c7c54]">
            <BookOpenCheck size={22} />
          </span>
          <div>
            <h3 className="text-xl font-black">What happens next</h3>
            <p className="mt-2 text-sm leading-6 text-[#555]">
              Apply, sign the digital MOU, receive your referral code, and start the locked level-by-level training.
            </p>
          </div>
        </div>
      </section>

      {isCareer7 ? (
        <>
          <section className="rounded-lg border border-[#151515]/10 bg-white p-6">
            <p className="text-sm font-black uppercase text-[#1c7c54]">Career7 product ladder</p>
            <h3 className="mt-2 text-2xl font-black tracking-normal">Start with free tests, grow into paid career intelligence.</h3>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {career7Products.map((product) => (
                <article key={product.title} className="rounded-lg border border-[#151515]/10 bg-[#f7f7f2] p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-black">{product.title}</h4>
                      <p className="mt-1 text-xs font-black uppercase text-[#1c7c54]">{product.audience}</p>
                    </div>
                    <span className="rounded-md bg-white px-2.5 py-1 text-xs font-black text-[#151515]">
                      {product.commission}
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-[#555]">{product.description}</p>
                  <p className="mt-4 text-sm font-black text-[#333]">{product.price}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-[#151515]/10 bg-[#151515] p-6 text-white">
            <h3 className="text-xl font-black">Commission rules</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {career7CommissionNotes.map((note) => (
                <p key={note} className="rounded-lg bg-white/10 p-4 text-sm font-semibold leading-6 text-white/80">
                  {note}
                </p>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
