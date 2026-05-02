import { redirect } from "next/navigation";

import { DailyBrief } from "@/components/bdm/daily-brief";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { EmptyState } from "@/components/ui/EmptyState";
import auth from "@/lib/auth";
import { filterBriefTasksForBdm } from "@/lib/bdm/brief-safety";
import { prisma } from "@/lib/prisma";

function toStrings(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export default async function BdmTasksPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      business: { select: { name: true } },
      dailyBriefs: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  if (!user?.business) redirect("/onboarding");

  const brief = user.dailyBriefs[0];
  const safeTasks = brief ? await filterBriefTasksForBdm(user.id, brief.tasks) : [];

  return (
    <div className="min-h-screen bg-[#070709] pl-[240px] text-white md:pr-[320px]">
      <Sidebar role="BDM" userName={user.name} businessName={user.business.name} />
      <Navbar title="Tasks" userName={user.name} />
      <main className="pt-[60px]">
        <div className="space-y-6 p-8">
          <h1 className="font-heading text-2xl font-bold">Tasks</h1>
          {brief ? (
            <DailyBrief
              brief={{
                greeting: brief.greeting,
                tasks: safeTasks,
                insights: toStrings(brief.insights),
              }}
              loading={false}
            />
          ) : (
            <EmptyState
              title="No tasks yet"
              description="Nexa will brief you once your company has activity data."
            />
          )}
        </div>
      </main>
    </div>
  );
}
