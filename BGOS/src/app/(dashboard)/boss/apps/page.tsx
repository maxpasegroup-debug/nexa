import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Bot, Layers } from "lucide-react";

import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { marketplaceStatusClass, marketplaceStatusLabel } from "@/lib/marketplace-status";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";

export const dynamic = "force-dynamic";

function typeLabel(type: string) {
  return type === "UI" ? "UI app" : "Background agent";
}

function lastActivityLabel(value?: Date | null) {
  if (!value) return "No activity yet";

  return `Updated ${value.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}`;
}

export default async function BossAppsPage() {
  const session = await auth();

  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "BOSS") redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      businessId: true,
      business: { select: { id: true, name: true } },
    },
  });

  if (!user?.businessId || !user.business) redirect("/onboarding");

  const installations = await prisma.agentInstallation.findMany({
    where: { businessId: user.businessId },
    include: {
      agent: {
        select: {
          slug: true,
          name: true,
          tagline: true,
          description: true,
          icon: true,
          type: true,
          colorPrimary: true,
        },
      },
    },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
  });

  return (
    <div className="min-h-screen bg-[#070709] pl-[240px] text-white">
      <Sidebar role={user.role} userName={user.name} businessName={user.business.name} />
      <Navbar title="Apps" userName={user.name} role={user.role} />

      <main className="pt-[60px]">
        <div className="space-y-8 p-8">
          <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#7C6FFF]">
                Apps / Agents
              </p>
              <h1 className="mt-2 font-heading text-2xl font-extrabold text-white">
                Installed agents
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                Track active and pending marketplace agents connected to your BGOS workspace.
              </p>
            </div>
            <Link
              href="/boss/marketplace"
              className="inline-flex items-center gap-2 rounded-xl bg-[#7C6FFF] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#9186FF]"
            >
              Browse marketplace <ArrowRight className="h-4 w-4" />
            </Link>
          </section>

          {installations.length > 0 ? (
            <section className="grid gap-4 xl:grid-cols-2">
              {installations.map((installation) => {
                const isUiAgent = installation.agent.type === "UI";
                const href = `/boss/agents/${installation.id}`;

                return (
                  <article
                    key={installation.id}
                    className="rounded-2xl border border-white/10 bg-[#13131c] p-5"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="flex min-w-0 gap-4">
                        <div
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/[0.04] text-2xl"
                          style={{ color: installation.agent.colorPrimary }}
                        >
                          {installation.agent.icon || <Bot className="h-5 w-5" />}
                        </div>
                        <div className="min-w-0">
                          <h2 className="font-heading text-lg font-extrabold text-white">
                            {installation.agent.name}
                          </h2>
                          <p className="mt-1 text-sm font-semibold text-[#A5A1B3]">
                            {installation.agent.tagline}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-2">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${marketplaceStatusClass(
                            installation.status,
                          )}`}
                        >
                          {marketplaceStatusLabel(installation.status)}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-bold uppercase text-zinc-300">
                          {typeLabel(installation.agent.type)}
                        </span>
                      </div>
                    </div>

                    <p className="mt-5 line-clamp-2 text-sm leading-6 text-zinc-400">
                      {installation.agent.description}
                    </p>

                    <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <Layers className="h-4 w-4" />
                        {lastActivityLabel(
                          installation.activeFrom ??
                            installation.sdeCompletedAt ??
                            installation.updatedAt,
                        )}
                      </div>
                      <Link
                        href={href}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#7C6FFF]/40 px-4 py-2 text-sm font-bold text-[#b8b2ff] transition hover:border-[#7C6FFF] hover:text-white"
                      >
                        {isUiAgent ? "Open" : "View details"}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </section>
          ) : (
            <section className="rounded-2xl border border-white/10 bg-[#13131c] p-8 text-center">
              <Bot className="mx-auto h-10 w-10 text-[#7C6FFF]" />
              <h2 className="mt-4 font-heading text-xl font-extrabold text-white">
                No agents installed yet
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-400">
                Install your first marketplace agent to extend BGOS with focused business workflows.
              </p>
              <Link
                href="/boss/marketplace"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#7C6FFF] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#9186FF]"
              >
                Browse marketplace <ArrowRight className="h-4 w-4" />
              </Link>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
