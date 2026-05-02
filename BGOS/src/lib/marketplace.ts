import crypto from "crypto";

import type { AgentCategory, AgentType, MarketplaceAgent, Role } from "@prisma/client";
import { NextResponse } from "next/server";

import { requireAuth, requireRole } from "@/lib/api-auth";
import { sendEmail } from "@/lib/email";
import { findLeastLoadedSDE, getInternalBusiness } from "@/lib/onboarding-flow";
import { prisma } from "@/lib/prisma";

export const agentCategories: AgentCategory[] = [
  "UNIVERSAL",
  "HEALTHCARE",
  "EDUCATION",
  "REAL_ESTATE",
  "CONSTRUCTION",
  "RETAIL",
  "FINANCE",
];

export const agentTypes: AgentType[] = ["UI", "BACKGROUND"];

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function getNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

export function getBool(value: unknown) {
  return typeof value === "boolean" ? value : undefined;
}

export function getDate(value: unknown) {
  const text = getString(value);
  if (!text) return undefined;

  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function isAgentCategory(value: unknown): value is AgentCategory {
  return typeof value === "string" && agentCategories.includes(value as AgentCategory);
}

export function isAgentType(value: unknown): value is AgentType {
  return typeof value === "string" && agentTypes.includes(value as AgentType);
}

export function getAgentType(value: unknown) {
  return isAgentType(value) ? value : undefined;
}

export function dueInHours(hours: number) {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function requireSession(roles?: Role[]) {
  const authResult = roles ? await requireRole(roles) : await requireAuth();

  if (authResult.response) {
    return { error: authResult.response };
  }

  return { session: authResult.session };
}

export async function requireBusinessAccess(businessId: string, roles: Role[]) {
  const authResult = await requireSession(roles);
  if ("error" in authResult) return authResult;

  const { session } = authResult;
  if (session.user.role !== "OWNER" && session.user.businessId !== businessId) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { session };
}

function razorpayAuthHeader() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials are not configured.");
  }

  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
}

async function razorpayRequest<T>(path: string, body: Record<string, unknown>) {
  const response = await fetch(`https://api.razorpay.com/v1${path}`, {
    method: "POST",
    headers: {
      Authorization: razorpayAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = (await response.json().catch(() => ({}))) as T & { error?: { description?: string } };

  if (!response.ok) {
    throw new Error(data.error?.description ?? `Razorpay request failed: ${path}`);
  }

  return data as T;
}

export type RazorpayOrder = {
  id: string;
  amount: number;
  currency: string;
  receipt?: string;
  status?: string;
};

export type RazorpaySubscription = {
  id: string;
  status?: string;
  short_url?: string;
};

export async function createRazorpayOrder({
  amount,
  receipt,
  notes,
}: {
  amount: number;
  receipt: string;
  notes: Record<string, string>;
}) {
  return razorpayRequest<RazorpayOrder>("/orders", {
    amount: Math.round(amount * 100),
    currency: "INR",
    receipt,
    notes,
  });
}

export function verifyRazorpaySignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) throw new Error("Razorpay credentials are not configured.");

  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  if (expected.length !== signature.length) return false;

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export function verifyRazorpayWebhookSignature(body: string, signature: string) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) throw new Error("Razorpay webhook secret is not configured.");

  const expected = crypto
    .createHmac("sha256", webhookSecret)
    .update(body)
    .digest("hex");

  if (expected.length !== signature.length) return false;

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export async function createRazorpaySubscription({
  agent,
  businessName,
}: {
  agent: Pick<MarketplaceAgent, "id" | "name" | "monthlyFee">;
  businessName: string;
}) {
  const plan = await razorpayRequest<{ id: string }>("/plans", {
    period: "monthly",
    interval: 1,
    item: {
      name: `${agent.name} monthly fee`,
      amount: Math.round(agent.monthlyFee * 100),
      currency: "INR",
      description: `Monthly marketplace agent fee for ${businessName}`,
    },
    notes: {
      agentId: agent.id,
      businessName,
    },
  });

  return razorpayRequest<RazorpaySubscription>("/subscriptions", {
    plan_id: plan.id,
    total_count: 120,
    quantity: 1,
    customer_notify: 1,
    notes: {
      agentId: agent.id,
      businessName,
    },
  });
}

export async function findBossForBusiness(businessId: string) {
  return prisma.user.findFirst({
    where: {
      businessId,
      role: { in: ["BOSS", "OWNER"] },
      active: true,
    },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    select: { id: true, name: true, email: true },
  });
}

export async function settleMarketplaceOnboardingPayment(installationId: string) {
  const installation = await prisma.agentInstallation.findUnique({
    where: { id: installationId },
    include: {
      agent: true,
      business: true,
      sdeAssignee: { select: { id: true, name: true, email: true } },
    },
  });

  if (!installation) {
    throw new Error("Installation not found.");
  }

  if (installation.onboardingFeePaid && installation.status !== "PENDING") {
    return { installation, settled: false };
  }

  const internalBusiness = await getInternalBusiness();
  if (!internalBusiness) {
    throw new Error("BGOS internal business not found.");
  }

  const sde =
    installation.sdeAssignee ?? (await findLeastLoadedSDE(internalBusiness.id));
  if (!sde) {
    throw new Error("No SDE available for assignment.");
  }

  const description = JSON.stringify(
    {
      business: {
        id: installation.business.id,
        name: installation.business.name,
        type: installation.business.type,
        teamSize: installation.business.teamSize,
        goal: installation.business.goal,
      },
      agent: {
        id: installation.agent.id,
        name: installation.agent.name,
        category: installation.agent.category,
        features: installation.agent.features,
        onboardingFee: installation.agent.onboardingFee,
        monthlyFee: installation.agent.monthlyFee,
      },
      requirements:
        "Configure workspace integrations, validate agent access, and activate within 24 hours.",
    },
    null,
    2,
  );

  const [updated] = await prisma.$transaction([
    prisma.agentInstallation.update({
      where: { id: installation.id },
      data: {
        onboardingFeePaid: true,
        monthlyFeePaid: false,
        status: "PAYMENT_DONE",
        sdeAssignedId: sde.id,
      },
    }),
    prisma.task.create({
      data: {
        title: `Install ${installation.agent.name} for ${installation.business.name}`,
        priority: "HIGH",
        description,
        dueDate: dueInHours(24),
        assignedTo: sde.id,
      },
    }),
    prisma.nexaInsight.create({
      data: {
        businessId: internalBusiness.id,
        type: "marketplace",
        message: `New agent installation - ${installation.agent.name} for ${installation.business.name}. SDE ${sde.name} assigned.`,
        action: "Track marketplace install",
      },
    }),
  ]);

  const boss = await findBossForBusiness(installation.businessId);
  await Promise.allSettled([
    sendEmail({
      to: sde.email,
      toName: sde.name,
      subject: `Install ${installation.agent.name} for ${installation.business.name}`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.7">
          <h2>Marketplace installation brief</h2>
          <p><strong>Agent:</strong> ${escapeHtml(installation.agent.name)}</p>
          <p><strong>Business:</strong> ${escapeHtml(installation.business.name)}</p>
          <pre style="white-space:pre-wrap;background:#f4f4f4;padding:16px;border-radius:8px;">${escapeHtml(description)}</pre>
          <p><a href="https://iceconnect.in/sde">Open SDE workspace</a></p>
        </div>
      `,
    }),
    boss
      ? sendEmail({
          to: boss.email,
          toName: boss.name,
          subject: `${installation.agent.name} payment confirmed`,
          html: `<p>Payment confirmed. Our team is setting up <strong>${escapeHtml(installation.agent.name)}</strong> for your business. Active within 24 hours.</p>`,
        })
      : Promise.resolve(false),
  ]);

  return { installation: updated, settled: true };
}
