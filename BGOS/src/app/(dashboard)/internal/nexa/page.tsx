import { EmptyState } from "@/components/ui/EmptyState";
import {
  InternalSidebar,
  InternalTopbar,
} from "@/components/internal/bgos-internal-dashboard";
import { requireInternalOwner } from "@/lib/internal-owner";
import { prisma } from "@/lib/prisma";

export default async function InternalNexaPage() {
  const { owner, business } = await requireInternalOwner();
  const [insights, actions, memories] = await Promise.all([
    prisma.nexaInsight.findMany({
      where: { businessId: business.id, read: false },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.nexaAction.findMany({
      where: { businessId: business.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.nexaMemory.findMany({
      where: { businessId: business.id },
      orderBy: { updatedAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <div className="min-h-screen bg-[#070709] pl-[240px] text-white">
      <InternalSidebar user={owner} />
      <InternalTopbar user={owner} />
      <main className="pt-[60px]">
        <div className="grid gap-6 p-8 xl:grid-cols-3">
          <section className="rounded-2xl border border-white/10 bg-[#13131c] p-6">
            <h1 className="font-heading text-2xl font-bold">NEXA</h1>
            <p className="mt-2 text-sm text-zinc-500">
              This section is being set up.
            </p>
            <div className="mt-6 space-y-3">
              {insights.length > 0 ? (
                insights.map((insight) => (
                  <div key={insight.id} className="rounded-xl border border-white/10 bg-[#0e0e13] p-4">
                    <p className="text-xs uppercase text-zinc-500">{insight.type}</p>
                    <p className="mt-2 text-sm">{insight.message}</p>
                    {insight.action ? <p className="mt-2 text-xs text-zinc-500">{insight.action}</p> : null}
                  </div>
                ))
              ) : (
                <EmptyState title="No NEXA insights yet" description="NEXA insights for the BGOS business will appear here." />
              )}
            </div>
          </section>
          <section className="rounded-2xl border border-white/10 bg-[#13131c] p-6">
            <h2 className="font-heading text-lg font-bold">Actions log</h2>
            <div className="mt-5 space-y-3">
              {actions.length > 0 ? actions.map((action) => (
                <div key={action.id} className="rounded-xl border border-white/10 bg-[#0e0e13] p-4 text-sm">
                  <p className="font-semibold">{action.description}</p>
                  <p className="mt-1 text-xs text-zinc-500">{action.type} - {action.status}</p>
                </div>
              )) : <EmptyState title="No NEXA actions yet" description="NEXA actions for BGOS will appear here." />}
            </div>
          </section>
          <section className="rounded-2xl border border-white/10 bg-[#13131c] p-6">
            <h2 className="font-heading text-lg font-bold">Memory</h2>
            <div className="mt-5 space-y-3">
              {memories.length > 0 ? memories.map((memory) => (
                <div key={memory.id} className="rounded-xl border border-white/10 bg-[#0e0e13] p-4 text-sm">
                  <p className="font-semibold">{memory.key}</p>
                  <pre className="mt-2 overflow-auto text-xs text-zinc-500">{JSON.stringify(memory.value, null, 2)}</pre>
                </div>
              )) : <EmptyState title="No NEXA memory yet" description="Stored NEXA memory for BGOS will appear here." />}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
