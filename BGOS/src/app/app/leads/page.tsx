import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function EmployeeLeadsPage() {
  const session = await auth();
  const leads = await prisma.lead.findMany({
    where: { assignedTo: session?.user.id ?? "" },
    orderBy: [{ followUpDate: "asc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      name: true,
      company: true,
      phone: true,
      email: true,
      bdmStatus: true,
      source: true,
      followUpDate: true,
      value: true,
    },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="text-2xl font-extrabold text-[#1A1A2E]">My leads</h1>
      <div className="mt-5 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
        {leads.map((lead) => (
          <div key={lead.id} className="grid gap-2 border-b border-black/5 p-4 last:border-b-0 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <div>
              <p className="font-bold text-[#1A1A2E]">{lead.name}</p>
              <p className="text-sm text-[#6B7280]">{lead.company ?? "No company"}</p>
            </div>
            <p className="text-sm text-[#6B7280]">{lead.phone ?? lead.email ?? "No contact"}</p>
            <p className="text-sm font-semibold text-[#7C6FFF]">{lead.bdmStatus}</p>
            <p className="text-sm text-[#6B7280]">{lead.followUpDate ? lead.followUpDate.toLocaleDateString("en-IN") : "No follow-up"}</p>
          </div>
        ))}
        {!leads.length ? <p className="p-5 text-sm text-[#6B7280]">No leads assigned yet.</p> : null}
      </div>
    </div>
  );
}
