import { redirect } from "next/navigation";

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
    orderBy: { updatedAt: "desc" },
  });

  return (
    <WorkspaceBuildsPage
      user={{ name: user.name, role: user.role, businessName: user.business.name }}
      builds={builds.map((build) => ({
        id: build.id,
        companyName: companyNameFrom(build.companyData),
        plan: build.selectedPlan,
        status: build.status,
        assignedAt: (build.submittedAt ?? build.updatedAt).toISOString(),
      }))}
    />
  );
}
