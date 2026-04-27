import { redirect } from "next/navigation";

import { EmptyState } from "@/components/ui/EmptyState";
import auth from "@/lib/auth";
import { getDashboardMetrics } from "@/lib/dashboard/server";
import { prisma } from "@/lib/prisma";

export default async function BgosNexaPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      business: { select: { id: true, name: true, healthScore: true } },
    },
  });

  if (!user?.business) redirect("/onboarding");

  const [metrics, insights, actions] = await Promise.all([
    getDashboardMetrics(user.business.id, user.business.healthScore),
    prisma.nexaInsight.findMany({
      where: { businessId: user.business.id, read: false },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.nexaAction.findMany({
      where: { businessId: user.business.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <main className="min-h-screen bg-[#070709] p-6 text-white">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Nexa</h1>
          <p className="mt-2 text-white/60">
            AI briefing from real company activity.
          </p>
        </div>

        <section className="rounded-2xl border border-white/10 bg-[#13131c] p-6">
          <h2 className="font-heading text-lg font-bold">Nexa AI briefing</h2>
          {insights.length > 0 ? (
            <div className="mt-4 grid gap-3">
              {insights.map((insight) => (
                <div
                  key={insight.id}
                  className="rounded-xl border border-white/10 bg-[#0e0e13] p-4"
                >
                  <p className="text-sm text-white">{insight.message}</p>
                  {insight.action ? (
                    <p className="mt-2 text-xs text-zinc-500">
                      Recommended task: {insight.action}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Nexa is analyzing your business data"
              description="Check back tomorrow for insights."
            />
          )}
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Health score", `${metrics.healthScore}%`],
            ["Total leads", metrics.totalLeads],
            ["Won this month", metrics.wonThisMonth],
            ["Conversion rate", `${metrics.conversionRate}%`],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-2xl border border-white/10 bg-[#13131c] p-5"
            >
              <p className="text-xs uppercase text-zinc-500">{label}</p>
              <p className="mt-2 text-2xl font-bold">{value}</p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#13131c] p-6">
          <h2 className="font-heading text-lg font-bold">
            Performance analysis
          </h2>
          {actions.length > 0 ? (
            <div className="mt-4 space-y-3">
              {actions.map((action) => (
                <div key={action.id} className="text-sm text-zinc-300">
                  {action.description}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Nexa actions yet"
              description="Nexa will brief you once your company has activity data."
            />
          )}
        </section>
      </div>
    </main>
  );
}
