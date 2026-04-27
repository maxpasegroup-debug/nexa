import { EmptyState } from "@/components/ui/EmptyState";
import {
  InternalSidebar,
  InternalTopbar,
} from "@/components/internal/bgos-internal-dashboard";
import { customerBusinessWhere, requireInternalOwner } from "@/lib/internal-owner";
import { prisma } from "@/lib/prisma";

export default async function InternalCustomersPage() {
  const { owner, business } = await requireInternalOwner();
  const customers = await prisma.business.findMany({
    where: customerBusinessWhere(business.id),
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      name: true,
      type: true,
      teamSize: true,
      healthScore: true,
      createdAt: true,
      _count: { select: { users: true, leads: true } },
    },
  });

  return (
    <div className="min-h-screen bg-[#070709] pl-[240px] text-white">
      <InternalSidebar user={owner} />
      <InternalTopbar user={owner} />
      <main className="pt-[60px]">
        <div className="space-y-6 p-8">
          <div>
            <h1 className="font-heading text-2xl font-bold">
              Customer Management
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              This section is being set up.
            </p>
          </div>
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#13131c]">
            {customers.length > 0 ? (
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="text-xs uppercase text-zinc-500">
                  <tr className="border-b border-white/10">
                    <th className="px-4 py-3">Business</th>
                    <th>Type</th>
                    <th>Team Size</th>
                    <th>Users</th>
                    <th>Leads</th>
                    <th>Health</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id} className="border-b border-white/5">
                      <td className="px-4 py-4 font-semibold">{customer.name}</td>
                      <td className="text-zinc-400">{customer.type}</td>
                      <td className="text-zinc-400">{customer.teamSize}</td>
                      <td>{customer._count.users}</td>
                      <td>{customer._count.leads}</td>
                      <td>{customer.healthScore}</td>
                      <td className="text-zinc-400">
                        {customer.createdAt.toLocaleDateString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState
                title="No customer businesses yet"
                description="Coming soon - customer management will appear here once real customers exist."
              />
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
