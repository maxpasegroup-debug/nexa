import Link from "next/link";
import { ArrowRight, Clock, Filter, Search } from "lucide-react";

import { getNiceJobsOpportunities } from "@/lib/nicejobs/data";

export default async function NiceJobsOpportunitiesPage() {
  const opportunities = await getNiceJobsOpportunities();
  const categories = Array.from(new Set(opportunities.map((opportunity) => opportunity.category)));

  return (
    <div className="grid gap-6">
      <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-black uppercase text-[#1c7c54]">Opportunity board</p>
          <h2 className="mt-2 text-3xl font-black tracking-normal">Choose your franchise track.</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-2 rounded-md border border-[#151515]/10 bg-white px-3 py-2 text-sm font-bold text-[#555]">
            <Search size={16} /> Search ready
          </span>
          <span className="inline-flex items-center gap-2 rounded-md border border-[#151515]/10 bg-white px-3 py-2 text-sm font-bold text-[#555]">
            <Filter size={16} /> {categories.length} categories
          </span>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {opportunities.map((opportunity) => (
          <article key={opportunity.id} className="rounded-lg border border-[#151515]/10 bg-white p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <p className="text-xs font-black uppercase text-[#1c7c54]">{opportunity.category}</p>
                <h3 className="mt-2 text-2xl font-black">{opportunity.name}</h3>
              </div>
              <span className="w-fit rounded-md bg-[#f0c85a]/30 px-3 py-1.5 text-sm font-black text-[#6a4a00]">
                {opportunity.commissionPercent}% commission
              </span>
            </div>

            <p className="mt-4 min-h-[72px] text-sm leading-6 text-[#555]">{opportunity.description}</p>
            <div className="mt-5 flex flex-wrap gap-2 text-sm font-bold text-[#333]">
              <span className="rounded-md bg-[#f7f7f2] px-3 py-2">{opportunity.potentialEarnings}</span>
              <span className="inline-flex items-center gap-2 rounded-md bg-[#f7f7f2] px-3 py-2">
                <Clock size={16} /> {opportunity.trainingDurationDays} days
              </span>
            </div>

            <Link
              href={`/nicejobs/opportunities/${opportunity.slug}`}
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-[#151515] px-4 py-3 text-sm font-black text-white transition hover:bg-[#2b2b2b]"
            >
              View details <ArrowRight size={17} />
            </Link>
          </article>
        ))}
      </section>
    </div>
  );
}
