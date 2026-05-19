import Link from "next/link";
import { ArrowRight, FileSignature } from "lucide-react";

import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function NiceJobsApplicationsPage() {
  const session = await auth();
  const applications = session?.user?.id
    ? await prisma.niceJobsApplication.findMany({
        where: { userId: session.user.id },
        include: { franchise: true, agreements: true },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="grid gap-6">
      <section>
        <p className="text-sm font-black uppercase text-[#1c7c54]">Applications</p>
        <h2 className="mt-2 text-3xl font-black tracking-normal">Your signed franchise records.</h2>
      </section>

      <section className="grid gap-4">
        {applications.length ? (
          applications.map((application) => (
            <Link
              key={application.id}
              href={`/nicejobs/applications/${application.id}`}
              className="rounded-lg border border-[#151515]/10 bg-white p-5 transition hover:border-[#1c7c54]/50"
            >
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-start gap-4">
                  <FileSignature size={22} className="mt-1 text-[#1c7c54]" />
                  <div>
                    <h3 className="font-black">{application.franchise.name}</h3>
                    <p className="mt-1 text-sm font-semibold text-[#555]">
                      {application.status.replaceAll("_", " ")} · {application.agreements.length ? "MOU signed" : "MOU pending"}
                    </p>
                  </div>
                </div>
                <ArrowRight size={18} />
              </div>
            </Link>
          ))
        ) : (
          <div className="rounded-lg border border-[#151515]/10 bg-white p-6">
            <p className="text-sm leading-6 text-[#555]">No applications yet.</p>
            <Link
              href="/nicejobs/opportunities"
              className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#151515] px-4 py-3 text-sm font-black text-white"
            >
              Choose opportunity <ArrowRight size={17} />
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
