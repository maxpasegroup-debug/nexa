import Link from "next/link";

import { EmptyState } from "@/components/ui/EmptyState";
import {
  InternalSidebar,
  InternalTopbar,
} from "@/components/internal/bgos-internal-dashboard";
import { requireInternalOwner } from "@/lib/internal-owner";
import { prisma } from "@/lib/prisma";

export default async function InternalLeadsPage() {
  const { owner, business } = await requireInternalOwner();
  const leads = await prisma.lead.findMany({
    where: { businessId: business.id },
    include: { assignee: { select: { name: true } } },
    orderBy: [{ score: "desc" }, { updatedAt: "desc" }],
    take: 100,
  });

  return (
    <div className="min-h-screen bg-[#070709] pl-[240px] text-white">
      <InternalSidebar user={owner} />
      <InternalTopbar user={owner} />
      <main className="pt-[60px]">
        <div className="space-y-6 p-8">
          <div>
            <h1 className="font-heading text-2xl font-bold">BGOS Leads</h1>
            <p className="mt-2 text-sm text-zinc-500">
              Internal BGOS sales pipeline for prospects BGOS is selling to.
            </p>
          </div>
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#13131c]">
            {leads.length > 0 ? (
              <table className="w-full min-w-[960px] text-left text-sm">
                <thead className="text-xs uppercase text-zinc-500">
                  <tr className="border-b border-white/10">
                    <th className="px-4 py-3">Company</th>
                    <th>Contact</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Score</th>
                    <th>Assigned to</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-b border-white/5">
                      <td className="px-4 py-4 font-semibold">
                        {lead.company ?? "-"}
                      </td>
                      <td>{lead.name}</td>
                      <td className="text-zinc-400">{lead.phone ?? "-"}</td>
                      <td>{lead.status}</td>
                      <td>{lead.score}</td>
                      <td className="text-zinc-400">
                        {lead.assignee?.name ?? "Unassigned"}
                      </td>
                      <td>
                        <Link href="/boss/leads" className="text-[#7C6FFF]">
                          Open CRM
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState
                title="No BGOS leads yet"
                description="This section is being set up. Internal BGOS prospects will appear here when added to the BGOS business pipeline."
                action={{ label: "Open CRM", href: "/boss/leads" }}
              />
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
