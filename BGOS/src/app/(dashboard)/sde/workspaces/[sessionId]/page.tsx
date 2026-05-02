import { redirect } from "next/navigation";

import { BuildDashboard } from "@/components/sde/build-dashboard";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function asRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export default async function SdeBuildDashboardPage({
  params,
}: {
  params: { sessionId: string };
}) {
  const authSession = await auth();
  if (!authSession?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: authSession.user.id },
    select: { id: true, name: true, role: true, business: { select: { name: true } } },
  });

  if (!user?.business || user.role !== "SDE") redirect("/login");

  const session = await prisma.onboardingSession.findFirst({
    where: { id: params.sessionId, sdeId: user.id },
    include: {
      employees: true,
      lead: {
        include: {
          callNotes: {
            orderBy: { createdAt: "desc" },
            include: { author: { select: { name: true } } },
          },
        },
      },
      bdm: {
        select: {
          bdmAnalysis: true,
        },
      },
      clarifications: {
        include: {
          raiser: { select: { name: true, email: true } },
          answerer: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!session) redirect("/sde/workspaces");

  return (
    <div className="min-h-screen bg-[#070709] pl-[240px] text-white">
      <Sidebar role="SDE" userName={user.name} businessName={user.business.name} />
      <Navbar title="Build dashboard" userName={user.name} role={user.role} />
      <main className="pt-[60px]">
        <div className="p-8">
          <BuildDashboard
            session={{
              id: session.id,
              status: session.status,
              summaryText: session.summaryText,
              summaryJson: session.summaryJson,
              selectedPlan: session.selectedPlan,
              callNotes: session.lead?.callNotes.map((note) => ({
                content: note.content,
                createdAt: note.createdAt.toISOString(),
                author: { name: note.author.name },
              })) ?? [],
              bdmAnalysis: session.bdm?.bdmAnalysis ?? null,
              companyData: asRecord(session.companyData),
              pipelineData: asArray(session.pipelineData),
              employees: session.employees.map((employee) => ({
                ...employee,
                createdAt: employee.createdAt.toISOString(),
              })),
              clarifications: session.clarifications.map((item) => ({
                ...item,
                createdAt: item.createdAt.toISOString(),
                notifiedAt: item.notifiedAt?.toISOString() ?? null,
                answeredAt: item.answeredAt?.toISOString() ?? null,
              })),
            }}
          />
        </div>
      </main>
    </div>
  );
}
