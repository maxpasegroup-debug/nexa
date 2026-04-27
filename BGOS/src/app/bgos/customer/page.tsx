import { redirect } from "next/navigation";

import { EmptyState } from "@/components/ui/EmptyState";
import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function CustomerPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, businessId: true },
  });

  const customers =
    user?.role === "ADMIN" || user?.role === "OWNER"
      ? await prisma.business.findMany({
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
        })
      : user?.businessId
        ? await prisma.business.findMany({
            where: { id: user.businessId },
            select: {
              id: true,
              name: true,
              type: true,
              teamSize: true,
              healthScore: true,
              createdAt: true,
              _count: { select: { users: true, leads: true } },
            },
          })
        : [];

  return (
    <main className="min-h-screen bg-[#070709] p-6 text-white">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Customers</h1>
          <p className="mt-2 text-white/60">Customer management module</p>
        </div>

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#13131c]">
          {customers.length > 0 ? (
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-white/[0.03] text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Company</th>
                  <th>Type</th>
                  <th>Team size</th>
                  <th>Users</th>
                  <th>Leads</th>
                  <th>Health</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-t border-white/10">
                    <td className="px-4 py-4 font-semibold">{customer.name}</td>
                    <td className="text-zinc-400">{customer.type}</td>
                    <td className="text-zinc-400">{customer.teamSize}</td>
                    <td>{customer._count.users}</td>
                    <td>{customer._count.leads}</td>
                    <td>{customer.healthScore}%</td>
                    <td className="text-zinc-400">
                      {customer.createdAt.toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState
              title="No customers yet"
              description="Customer records will appear here when real workspaces are created."
            />
          )}
        </section>
      </div>
    </main>
  );
}
