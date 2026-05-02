import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Bot, CheckCircle2, Layers, Settings } from "lucide-react";

import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { marketplaceStatusClass, marketplaceStatusLabel } from "@/lib/marketplace-status";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";

export const dynamic = "force-dynamic";

function typeLabel(type: string) {
  return type === "UI" ? "UI app" : "Background agent";
}

function formatDate(value?: Date | null) {
  if (!value) return "Not available yet";

  return value.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function featuresFor(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string").slice(0, 6)
    : [];
}

export default async function BossAgentDetailPage({
  params,
}: {
  params: { installationId: string };
}) {
  const session = await auth();

  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "BOSS") redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      role: true,
      businessId: true,
      business: { select: { id: true, name: true } },
    },
  });

  if (!user?.businessId || !user.business) redirect("/onboarding");

  const installation = await prisma.agentInstallation.findFirst({
    where: {
      id: params.installationId,
      businessId: user.businessId,
    },
    include: {
      agent: true,
    },
  });

  if (!installation) notFound();

  const isUiAgent = installation.agent.type === "UI";
  const features = featuresFor(installation.agent.features);

  return (
    <div className="min-h-screen bg-[#070709] pl-[240px] text-white">
      <Sidebar role={user.role} userName={user.name} businessName={user.business.name} />
      <Navbar title={installation.agent.name} userName={user.name} role={user.role} />

      <main className="pt-[60px]">
        <div className="space-y-8 p-8">
          <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <Link
                href="/boss/apps"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#7C6FFF] transition hover:text-[#9f97ff]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to apps
              </Link>
              <div className="mt-5 flex items-start gap-4">
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/[0.04] text-3xl"
                  style={{ color: installation.agent.colorPrimary }}
                >
                  {installation.agent.icon || <Bot className="h-6 w-6" />}
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#7C6FFF]">
                    {typeLabel(installation.agent.type)}
                  </p>
                  <h1 className="mt-2 font-heading text-3xl font-extrabold text-white">
                    {installation.agent.name}
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                    {installation.agent.tagline}
                  </p>
                </div>
              </div>
            </div>
            <span
              className={`w-fit rounded-full border px-3 py-1.5 text-xs font-bold uppercase ${marketplaceStatusClass(
                installation.status,
              )}`}
            >
              {marketplaceStatusLabel(installation.status)}
            </span>
          </section>

          <section
            className="rounded-2xl border border-white/10 p-6"
            style={{ background: installation.agent.gradient }}
          >
            <div className="max-w-3xl">
              <h2 className="font-heading text-xl font-extrabold text-white">
                Description
              </h2>
              <p className="mt-3 text-sm leading-7 text-zinc-300">
                {installation.agent.description}
              </p>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-white/10 bg-[#13131c] p-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-[#22D9A0]" />
                <h2 className="font-heading text-lg font-extrabold text-white">
                  What it does
                </h2>
              </div>
              {features.length > 0 ? (
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {features.map((feature) => (
                    <div
                      key={feature}
                      className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-zinc-300"
                    >
                      {feature}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm leading-6 text-zinc-400">
                  This agent is configured around your workspace requirements. Detailed capabilities will appear here as setup is completed.
                </p>
              )}
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-white/10 bg-[#13131c] p-6">
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-[#7C6FFF]" />
                  <h2 className="font-heading text-lg font-extrabold text-white">
                    Activity
                  </h2>
                </div>
                <div className="mt-5 rounded-xl border border-white/10 bg-[#0e0e13] p-4 text-sm text-zinc-400">
                  No detailed activity timeline yet.
                </div>
                <p className="mt-3 text-xs leading-5 text-zinc-500">
                  Last updated: {formatDate(installation.updatedAt)}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#13131c] p-6">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-[#F5A623]" />
                  <h2 className="font-heading text-lg font-extrabold text-white">
                    Basic settings
                  </h2>
                </div>
                <div className="mt-5 space-y-3 text-sm text-zinc-400">
                  <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#0e0e13] px-4 py-3">
                    <span>Installed</span>
                    <span className="text-zinc-300">{formatDate(installation.installedAt)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#0e0e13] px-4 py-3">
                    <span>Active from</span>
                    <span className="text-zinc-300">{formatDate(installation.activeFrom)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#0e0e13] px-4 py-3">
                    <span>Mode</span>
                    <span className="text-zinc-300">{typeLabel(installation.agent.type)}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#13131c] p-6">
            {isUiAgent ? (
              <div>
                <h2 className="font-heading text-lg font-extrabold text-white">
                  Agent workspace
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
                  This is the main interaction page for {installation.agent.name}. Controls and live workflows will appear here as the agent module matures.
                </p>
              </div>
            ) : (
              <div>
                <h2 className="font-heading text-lg font-extrabold text-white">
                  Runs automatically
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
                  {installation.agent.name} runs in the background once setup is complete. You do not need to keep this page open for it to work.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
