"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { career7Lessons } from "@/lib/nicejobs/career7";

const defaultResources = [
  {
    title: "Opportunity audio briefing",
    description: "Listen to the partner offer, ideal customer, and first outreach script.",
    resourceType: "audio",
    resourceUrl: "/nicejobs/resources/audio-briefing",
    sortOrder: 1,
  },
  {
    title: "Promotional asset pack",
    description: "Use approved copy, images, and call talking points for referral outreach.",
    resourceType: "asset",
    resourceUrl: "/nicejobs/resources/promo-pack",
    sortOrder: 2,
  },
  {
    title: "Sales validation walkthrough",
    description: "Understand how referrals are validated before commissions move to payout.",
    resourceType: "video",
    resourceUrl: "/nicejobs/resources/validation-walkthrough",
    sortOrder: 3,
  },
  {
    title: "MOU and payout rules",
    description: "Review monthly payout timing, approved account rules, and conduct standards.",
    resourceType: "pdf",
    resourceUrl: "/nicejobs/resources/payout-rules",
    sortOrder: 4,
  },
];

async function ensureDefaultResources(franchiseId: string) {
  const franchise = await prisma.niceJobsFranchise.findUnique({
    where: { id: franchiseId },
    select: { slug: true },
  });
  const existing = await prisma.niceJobsTrainingResource.findMany({
    where: { franchiseId, status: "ACTIVE" },
    orderBy: { sortOrder: "asc" },
  });

  if (existing.length) return existing;

  if (franchise?.slug === "career7-in") {
    await prisma.niceJobsTrainingResource.createMany({
      data: career7Lessons.map((lesson) => ({
        franchiseId,
        title: lesson.titles.en,
        description: lesson.intro.en,
        resourceType: "lesson",
        resourceUrl: `/nicejobs/training/career7/${lesson.key}`,
        sortOrder: lesson.day,
        isRequired: true,
        status: "ACTIVE",
      })),
    });

    return prisma.niceJobsTrainingResource.findMany({
      where: { franchiseId, status: "ACTIVE" },
      orderBy: { sortOrder: "asc" },
    });
  }

  await prisma.niceJobsTrainingResource.createMany({
    data: defaultResources.map((resource) => ({
      ...resource,
      franchiseId,
      isRequired: true,
      status: "ACTIVE",
    })),
  });

  return prisma.niceJobsTrainingResource.findMany({
    where: { franchiseId, status: "ACTIVE" },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getNiceJobsTrainingHub(userId: string) {
  const applications = await prisma.niceJobsApplication.findMany({
    where: {
      userId,
      status: { in: ["SIGNED", "TRAINING", "PENDING_APPROVAL", "APPROVED", "ACTIVE"] },
    },
    include: {
      franchise: true,
      trainingProgress: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const tracks = [];

  for (const application of applications) {
    const resources = await ensureDefaultResources(application.franchiseId);
    const progressByResource = new Map(
      application.trainingProgress.map((progress) => [progress.resourceId, progress]),
    );
    const completedCount = resources.filter(
      (resource) => progressByResource.get(resource.id)?.status === "COMPLETED",
    ).length;

    tracks.push({
      application,
      resources,
      completedCount,
      totalCount: resources.length,
      progressByResource,
      complete: resources.length > 0 && completedCount === resources.length,
      nextUnlockedSortOrder:
        resources.find((resource) => progressByResource.get(resource.id)?.status !== "COMPLETED")
          ?.sortOrder ?? resources[resources.length - 1]?.sortOrder ?? 1,
    });
  }

  return tracks;
}

export async function completeNiceJobsResource(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?businessModel=nicejobs&callbackUrl=/nicejobs/training");
  }

  const applicationId = String(formData.get("applicationId") || "");
  const resourceId = String(formData.get("resourceId") || "");

  const application = await prisma.niceJobsApplication.findFirst({
    where: {
      id: applicationId,
      userId: session.user.id,
    },
    include: { franchise: true },
  });

  if (!application || !resourceId) {
    redirect("/nicejobs/training?error=resource");
  }

  await prisma.niceJobsTrainingProgress.upsert({
    where: {
      applicationId_resourceId: {
        applicationId,
        resourceId,
      },
    },
    create: {
      userId: session.user.id,
      applicationId,
      resourceId,
      status: "COMPLETED",
      completedAt: new Date(),
    },
    update: {
      status: "COMPLETED",
      completedAt: new Date(),
    },
  });

  const requiredResources = await prisma.niceJobsTrainingResource.findMany({
    where: { franchiseId: application.franchiseId, status: "ACTIVE", isRequired: true },
    select: { id: true },
  });
  const completed = await prisma.niceJobsTrainingProgress.count({
    where: {
      applicationId,
      resourceId: { in: requiredResources.map((resource) => resource.id) },
      status: "COMPLETED",
    },
  });

  if (requiredResources.length && completed >= requiredResources.length) {
    await prisma.niceJobsApplication.update({
      where: { id: applicationId },
      data: {
        status: application.status === "SIGNED" || application.status === "TRAINING" ? "PENDING_APPROVAL" : application.status,
      },
    });
  } else if (application.status === "SIGNED") {
    await prisma.niceJobsApplication.update({
      where: { id: applicationId },
      data: { status: "TRAINING" },
    });
  }

  revalidatePath("/nicejobs/training");
}

export async function getNiceJobsTrainingLesson(userId: string, lessonKey: string) {
  const resourceUrl = `/nicejobs/training/career7/${lessonKey}`;
  const application = await prisma.niceJobsApplication.findFirst({
    where: {
      userId,
      franchise: { slug: "career7-in" },
      status: { in: ["SIGNED", "TRAINING", "PENDING_APPROVAL", "APPROVED", "ACTIVE"] },
    },
    include: {
      franchise: true,
      trainingProgress: true,
    },
  });

  if (!application) return null;

  const resources = await ensureDefaultResources(application.franchiseId);
  const resource = resources.find((item) => item.resourceUrl === resourceUrl);

  if (!resource) return null;

  const progressByResource = new Map(
    application.trainingProgress.map((progress) => [progress.resourceId, progress]),
  );
  const firstIncomplete =
    resources.find((item) => progressByResource.get(item.id)?.status !== "COMPLETED") ??
    resources[resources.length - 1];
  const locked = resource.sortOrder > (firstIncomplete?.sortOrder ?? 1);

  return {
    application,
    resource,
    resources,
    completed: progressByResource.get(resource.id)?.status === "COMPLETED",
    locked,
  };
}
