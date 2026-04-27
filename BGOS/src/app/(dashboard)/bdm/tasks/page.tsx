import { redirect } from "next/navigation";

import { DailyBrief } from "@/components/bdm/daily-brief";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { EmptyState } from "@/components/ui/EmptyState";
import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type BriefTask = {
  title: string;
  priority: "high" | "medium" | "low";
  leadId: string | null;
  leadName?: string | null;
  type: "follow_up" | "new_lead" | "demo" | "proposal" | "admin";
};

const priorities = ["high", "medium", "low"];
const taskTypes = ["follow_up", "new_lead", "demo", "proposal", "admin"];

function toBriefTasks(value: unknown): BriefTask[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is Record<string, unknown> => {
      return Boolean(item) && typeof item === "object" && !Array.isArray(item);
    })
    .map((item) => {
      const priority = String(item.priority ?? "medium");
      const type = String(item.type ?? "admin");

      return {
        title:
          typeof item.title === "string" ? item.title : "Review assigned work",
        priority: priorities.includes(priority)
          ? (priority as BriefTask["priority"])
          : "medium",
        leadId: typeof item.leadId === "string" ? item.leadId : null,
        leadName: typeof item.leadName === "string" ? item.leadName : null,
        type: taskTypes.includes(type) ? (type as BriefTask["type"]) : "admin",
      };
    });
}

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
                tasks: toBriefTasks(brief.tasks),
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
