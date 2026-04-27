import Link from "next/link";
import { redirect } from "next/navigation";

import { EmptyState } from "@/components/ui/EmptyState";
import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function BgosLeadsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { businessId: true },
  });

  if (!user?.businessId) redirect("/onboarding");

  const leads = await prisma.lead.findMany({
    where: { businessId: user.businessId },
    include: { assignee: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <main className="min-h-screen bg-[#070709] p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Leads</h1>
          <p className="mt-2 text-white/60">Real leads from your workspace.</p>
        </div>

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#13131c]">
          {leads.length > 0 ? (
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-white/[0.03] text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Company</th>
                  <th>Contact</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Assigned to</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-t border-white/10">
                    <td className="px-4 py-4 font-semibold">
                      {lead.company ?? "-"}
                    </td>
                    <td>{lead.name}</td>
                    <td className="text-zinc-400">{lead.phone ?? "-"}</td>
                    <td>
                      <span className="rounded-full border border-[#7C6FFF]/30 bg-[#7C6FFF]/10 px-2 py-1 text-xs text-[#c6c1ff]">
                        {lead.status}
                      </span>
                    </td>
                    <td className="text-zinc-400">
                      {lead.assignee?.name ?? "Unassigned"}
                    </td>
                    <td className="text-zinc-400">
                      {lead.createdAt.toLocaleDateString("en-IN")}
                    </td>
                    <td className="space-x-3">
                      <Link
                        href={`/boss/leads?leadId=${lead.id}`}
                        className="text-[#7C6FFF]"
                      >
                        View
                      </Link>
                      <Link
                        href={`/boss/leads?leadId=${lead.id}`}
                        className="text-[#22D9A0]"
                      >
                        Update Status
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState
              title="No leads yet"
              description="Start by adding a lead. Real lead activity will appear here automatically."
              action={{ label: "Add a lead", href: "/boss/leads" }}
            />
          )}
        </section>
      </div>
    </main>
  );
}
