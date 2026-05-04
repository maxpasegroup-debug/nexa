import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function EmployeeTasksPage() {
  const session = await auth();
  const tasks = await prisma.task.findMany({
    where: { assignedTo: session?.user.id ?? "" },
    orderBy: [{ status: "asc" }, { priority: "desc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      priority: true,
      dueDate: true,
      type: true,
    },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="text-2xl font-extrabold text-[#1A1A2E]">My tasks</h1>
      <div className="mt-5 grid gap-3">
        {tasks.map((task) => (
          <article key={task.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-bold text-[#1A1A2E]">{task.title}</p>
                <p className="mt-1 text-sm text-[#6B7280]">{task.description ?? task.type ?? "No description"}</p>
              </div>
              <span className="rounded-full bg-[#7C6FFF]/10 px-3 py-1 text-xs font-bold text-[#7C6FFF]">
                {task.priority}
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-[#6B7280]">
              <span>{task.status}</span>
              <span>{task.dueDate ? task.dueDate.toLocaleDateString("en-IN") : "No due date"}</span>
            </div>
          </article>
        ))}
        {!tasks.length ? <p className="rounded-2xl bg-white p-5 text-sm text-[#6B7280] shadow-sm ring-1 ring-black/5">No tasks assigned yet.</p> : null}
      </div>
    </div>
  );
}
