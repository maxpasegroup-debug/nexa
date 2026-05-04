import Link from "next/link";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function dateText(value?: Date | null) {
  if (!value) return "No date";
  return value.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

export default async function EmployeeAppHome() {
  const session = await auth();
  const userId = session?.user.id ?? "";
  const today = new Date();

  const [leadCount, followUps, openTasks, latestLeads, latestTasks] = await Promise.all([
    prisma.lead.count({ where: { assignedTo: userId } }),
    prisma.lead.count({ where: { assignedTo: userId, followUpDate: { lte: today } } }),
    prisma.task.count({ where: { assignedTo: userId, status: { not: "DONE" } } }),
    prisma.lead.findMany({
      where: { assignedTo: userId },
      orderBy: { updatedAt: "desc" },
      take: 4,
      select: { id: true, name: true, company: true, bdmStatus: true, followUpDate: true },
    }),
    prisma.task.findMany({
      where: { assignedTo: userId, status: { not: "DONE" } },
      orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
      take: 4,
      select: { id: true, title: true, status: true, priority: true, dueDate: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <header className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#7C6FFF]">NEXA today</p>
        <h1 className="mt-2 text-2xl font-extrabold text-[#1A1A2E]">Good day, {session?.user.name ?? "team member"}.</h1>
        <p className="mt-2 text-sm leading-6 text-[#6B7280]">
          Focus on due follow-ups first, then clear open tasks. NEXA will keep your work tight and visible.
        </p>
      </header>

      <section className="mt-5 grid gap-3 sm:grid-cols-3">
        {[["Assigned leads", leadCount], ["Follow-ups due", followUps], ["Open tasks", openTasks]].map(([label, value]) => (
          <div key={label} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5">
            <p className="text-xs font-semibold text-[#6B7280]">{label}</p>
            <p className="mt-2 text-3xl font-black text-[#1A1A2E]">{value}</p>
          </div>
        ))}
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-[#1A1A2E]">Leads</h2>
            <Link href="/app/leads" className="text-sm font-bold text-[#7C6FFF]">View all</Link>
          </div>
          <div className="mt-4 space-y-3">
            {latestLeads.map((lead) => (
              <div key={lead.id} className="rounded-xl bg-[#F5F5F5] p-3">
                <p className="font-semibold text-[#1A1A2E]">{lead.name}</p>
                <p className="mt-1 text-xs text-[#6B7280]">{lead.company ?? "No company"} · {lead.bdmStatus} · {dateText(lead.followUpDate)}</p>
              </div>
            ))}
            {!latestLeads.length ? <p className="text-sm text-[#6B7280]">No leads assigned yet.</p> : null}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-[#1A1A2E]">Tasks</h2>
            <Link href="/app/tasks" className="text-sm font-bold text-[#7C6FFF]">View all</Link>
          </div>
          <div className="mt-4 space-y-3">
            {latestTasks.map((task) => (
              <div key={task.id} className="rounded-xl bg-[#F5F5F5] p-3">
                <p className="font-semibold text-[#1A1A2E]">{task.title}</p>
                <p className="mt-1 text-xs text-[#6B7280]">{task.priority} · {task.status} · {dateText(task.dueDate)}</p>
              </div>
            ))}
            {!latestTasks.length ? <p className="text-sm text-[#6B7280]">No open tasks. Nice and clear.</p> : null}
          </div>
        </div>
      </section>
    </div>
  );
}
