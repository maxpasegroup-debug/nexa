import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpenCheck, FileText } from "lucide-react";

import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function NiceJobsApplicationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  const application = session?.user?.id
    ? await prisma.niceJobsApplication.findFirst({
        where: { id: params.id, userId: session.user.id },
        include: { franchise: true, agreements: { orderBy: { signedAt: "desc" } } },
      })
    : null;

  if (!application) notFound();

  const agreement = application.agreements[0];

  return (
    <div className="grid gap-6">
      <section className="rounded-lg border border-[#151515]/10 bg-white p-6">
        <p className="text-sm font-black uppercase text-[#1c7c54]">Application record</p>
        <h2 className="mt-2 text-3xl font-black tracking-normal">{application.franchise.name}</h2>
        <div className="mt-5 flex flex-wrap gap-2 text-sm font-bold">
          <span className="rounded-md bg-[#e2f6ed] px-3 py-2 text-[#1c7c54]">
            {application.status.replaceAll("_", " ")}
          </span>
          <span className="rounded-md bg-[#f7f7f2] px-3 py-2">Referral code: {application.referralCode}</span>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.75fr]">
        <div className="rounded-lg border border-[#151515]/10 bg-white p-6">
          <div className="flex items-center gap-3">
            <FileText size={22} className="text-[#1c7c54]" />
            <h3 className="text-xl font-black">Signed MOU</h3>
          </div>
          <pre className="mt-5 whitespace-pre-wrap rounded-lg bg-[#f7f7f2] p-5 text-sm leading-7 text-[#333]">
            {agreement?.mouDocument || "MOU is pending."}
          </pre>
        </div>

        <aside className="rounded-lg border border-[#151515]/10 bg-[#151515] p-6 text-white">
          <BookOpenCheck size={24} className="text-[#f0c85a]" />
          <h3 className="mt-4 text-xl font-black">Next step</h3>
          <p className="mt-2 text-sm leading-6 text-white/70">
            Complete the training resources for this franchise to become payout eligible.
          </p>
          <Link
            href="/nicejobs/training"
            className="mt-5 inline-flex items-center justify-center rounded-md bg-[#f0c85a] px-4 py-3 text-sm font-black text-[#151515]"
          >
            Open training
          </Link>
        </aside>
      </section>
    </div>
  );
}
