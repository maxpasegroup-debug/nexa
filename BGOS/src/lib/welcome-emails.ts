import { hash } from "bcryptjs";
import { Prisma } from "@prisma/client";

import { sendEmail } from "@/lib/email";
import { randomPassword } from "@/lib/onboarding-flow";
import { prisma } from "@/lib/prisma";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function roleParagraph(role: string) {
  const normalized = role.toLowerCase();
  if (normalized.includes("manager") || normalized.includes("lead") || normalized.includes("boss")) {
    return "You can see all team activity, all pipelines, and your team's performance in one place. NEXA will send you daily reports.";
  }
  if (normalized.includes("tech") || normalized.includes("developer") || normalized.includes("engineer") || normalized.includes("sde")) {
    return "Your task board, bug tracker, and sprint tools are ready. NEXA will alert you to urgent issues so nothing falls through.";
  }
  return "Your leads, your pipeline, and your daily tasks are all set up for you. NEXA will send you a morning briefing every day at 8am so you know exactly what to focus on.";
}

function asStringList(value: Prisma.JsonValue | unknown) {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

export async function sendEmployeeWelcomeEmails(businessId: string) {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: {
      users: {
        where: { active: true, role: { not: "BOSS" } },
        orderBy: { name: "asc" },
      },
      onboardingLead: {
        include: { workspaceConfig: true },
      },
    },
  });

  if (!business) {
    throw new Error("Business not found.");
  }

  const template = await prisma.workspaceTemplate.findFirst({
    where: { name: { startsWith: business.name } },
    orderBy: { createdAt: "desc" },
    select: { createdFrom: true },
  });

  const onboardingEmployees = template?.createdFrom
    ? await prisma.onboardingEmployee.findMany({
        where: { sessionId: template.createdFrom },
      })
    : [];
  const employeeByEmail = new Map(
    onboardingEmployees.map((employee) => [employee.email.toLowerCase(), employee]),
  );

  const results = await Promise.allSettled(
    business.users.map(async (user) => {
      const onboardingEmployee = employeeByEmail.get(user.email.toLowerCase());
      const tempPassword = randomPassword();
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: await hash(tempPassword, 12),
          defaultPassword: true,
          active: true,
        },
      });

      const safeCompany = escapeHtml(business.name);
      const safeName = escapeHtml(user.name);
      const safeEmail = escapeHtml(user.email);
      const safePassword = escapeHtml(tempPassword);
      const safePipelines = escapeHtml(
        asStringList(onboardingEmployee?.assignedPipelines).join(", ") || "Your assigned pipelines",
      );
      const safeProcedures = escapeHtml(
        onboardingEmployee?.operatingProcedures || "Your operating procedures are already configured inside the workspace.",
      );

      return sendEmail({
        to: user.email,
        toName: user.name,
        fromName: `${business.name} Team`,
        subject: `Welcome to ${business.name}'s new workspace, ${user.name}`,
        html: `
          <div style="font-family:Arial,sans-serif;background:#f6f7fb;padding:24px;color:#18181b">
            <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;border:1px solid #e5e7eb">
              <h1 style="font-family:Syne,Arial,sans-serif;font-size:32px;margin:0;color:#111827">${safeCompany}</h1>
              <h2 style="font-size:20px;margin:18px 0 8px">Your workspace is ready, ${safeName}</h2>
              <p style="line-height:1.7;color:#3f3f46">${escapeHtml(roleParagraph(`${user.role} ${onboardingEmployee?.title ?? ""}`))}</p>
              <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:18px;margin:24px 0">
                <p style="margin:0 0 8px"><strong>Portal:</strong> https://iceconnect.in/login</p>
                <p style="margin:0 0 8px"><strong>Email:</strong> ${safeEmail}</p>
                <p style="margin:0"><strong>Temporary password:</strong> ${safePassword}</p>
                <p style="margin:10px 0 0;color:#166534;font-size:13px">Please change this password immediately after logging in.</p>
              </div>
              <div style="background:#fafafa;border-radius:12px;padding:16px;margin-bottom:24px">
                <p style="margin:0 0 8px"><strong>Assigned pipelines:</strong> ${safePipelines}</p>
                <p style="margin:0;line-height:1.6">${safeProcedures}</p>
              </div>
              <a href="https://iceconnect.in/login" style="display:inline-block;background:#22D9A0;color:#07100b;padding:13px 18px;border-radius:10px;text-decoration:none;font-weight:700">Log in to your workspace -></a>
              <p style="margin-top:32px;color:#71717a;font-size:12px">${safeCompany} | Powered by BGOS</p>
            </div>
          </div>
        `,
      });
    }),
  );

  const sentCount = results.filter((result) => result.status === "fulfilled" && result.value).length;
  const boss = await prisma.user.findFirst({
    where: { businessId, role: "BOSS" },
    select: { id: true },
  });

  await prisma.nexaInsight.create({
    data: {
      businessId,
      type: "team",
      message: `All ${sentCount} team members have been sent their login details. They should be active within the hour.`,
      action: boss ? "Review team access" : "Check team access",
    },
  });

  return { sentCount, attemptedCount: business.users.length };
}
