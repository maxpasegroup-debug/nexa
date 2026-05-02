import { redirect } from "next/navigation";

import { MobileSDEBuilds } from "@/components/sde/mobile/mobile-sde-builds";
import { WorkspaceBuildsPage } from "@/components/sde/workspace-builds-page";
import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function companyNameFrom(value: unknown) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const name = (value as Record<string, unknown>).name;
    if (typeof name === "string" && name.trim()) return name;
  }
  return "Client workspace";
}

export default async function SdeWorkspacesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      role: true,
      business: { select: { name: true } },
    },
  });

  if (!user?.business || user.role !== "SDE") redirect("/login");

  const builds = await prisma.onboardingSession.findMany({
    where: {
      sdeId: user.id,
      status: {
        in: ["SUBMITTED", "SDE_BUILDING", "CLARIFICATION_NEEDED", "SDE_APPROVED"],
      },
    },
    include: {
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
          name: true,
          bdmAnalysis: true,
        },
      },
      employees: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const serializedBuilds = builds.map((build) => ({
    id: build.id,
    sdeId: build.sdeId,
    companyName: companyNameFrom(build.companyData),
    bdmName: build.bdm?.name ?? null,
    plan: build.selectedPlan,
    status: build.status,
    submittedAt: (build.submittedAt ?? build.updatedAt).toISOString(),
    completenessScore: build.completenessScore,
    summaryText: build.summaryText,
    summaryJson: build.summaryJson,
    callNotes: build.lead?.callNotes.map((note) => ({
      content: note.content,
      createdAt: note.createdAt.toISOString(),
      author: { name: note.author.name },
    })) ?? [],
    bdmAnalysis: build.bdm?.bdmAnalysis ?? null,
    employeeCount: build.employees.length,
    pipelineCount: Array.isArray(build.pipelineData) ? build.pipelineData.length : 0,
  }));

  return (
    <>
      <div className="show-mobile hidden">
        <MobileSDEBuilds builds={serializedBuilds} currentUserId={user.id} />
      </div>
      <div className="hide-mobile">
        <WorkspaceBuildsPage
      user={{ id: user.id, name: user.name, role: user.role, businessName: user.business.name }}
      builds={serializedBuilds}
        />
      </div>
    </>
  );
}
