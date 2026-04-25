import { redirect } from "next/navigation";
import { BarChart3, PhoneCall, Timer } from "lucide-react";

import { CallLogHistory } from "@/components/bdm/call-log-history";
import { MetricCard } from "@/components/boss/metric-card";
import { NexaPanel } from "@/components/boss/nexa-panel";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import auth from "@/lib/auth";
import { monthBounds, todayBounds } from "@/lib/bdm/server";
import { prisma } from "@/lib/prisma";

const answeredOutcomes = [
  "ANSWERED_INTERESTED",
  "ANSWERED_NOT_INTERESTED",
  "ANSWERED_CALLBACK",
] as const;

export default async function BdmCallsPage() {
  const session = await auth();

  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      role: true,
      businessId: true,
      business: { select: { name: true } },
    },
  });

  if (!user?.businessId || !user.business) redirect("/onboarding");

  const month = monthBounds();
  const today = todayBounds();

  const [calls, totalCallsThisMonth, callsToday, answeredCallsThisMonth] =
    await Promise.all([
      prisma.callLog.findMany({
        where: { userId: user.id },
        include: { lead: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.callLog.count({
        where: { userId: user.id, createdAt: { gte: month.start, lt: month.end } },
      }),
      prisma.callLog.count({
        where: { userId: user.id, createdAt: { gte: today.start, lt: today.end } },
      }),
      prisma.callLog.count({
        where: {
          userId: user.id,
          createdAt: { gte: month.start, lt: month.end },
          outcome: { in: [...answeredOutcomes] },
        },
      }),
    ]);

  const answerRate =
    totalCallsThisMonth > 0
      ? Math.round((answeredCallsThisMonth / totalCallsThisMonth) * 1000) / 10
      : 0;

  return (
    <div className="min-h-screen bg-[#070709] pl-[240px] text-white md:pr-[320px]">
      <Sidebar role="BDM" userName={user.name} businessName={user.business.name} />
      <Navbar title="Call Log" userName={user.name} />

      <main className="pt-[60px]">
        <div className="space-y-6 p-8">
          <section>
            <h1 className="font-heading text-2xl font-bold">Call Log</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Review your sales conversations and next actions.
            </p>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            <MetricCard
              title="Total Calls This Month"
              value={totalCallsThisMonth}
              subtitle="Logged by you"
              icon={<PhoneCall className="h-4 w-4" />}
            />
            <MetricCard
              title="Calls Today"
              value={callsToday}
              subtitle="Today's activity"
              icon={<Timer className="h-4 w-4" />}
            />
            <MetricCard
              title="Answer Rate"
              value={`${answerRate}%`}
              subtitle="Answered calls this month"
              icon={<BarChart3 className="h-4 w-4" />}
            />
          </section>

          <CallLogHistory
            callLogs={calls.map((call) => ({
              ...call,
              createdAt: call.createdAt.toISOString(),
            }))}
          />
        </div>
      </main>

      <NexaPanel businessId={user.businessId} initialMessage="bdm_morning_context" />
    </div>
  );
}
