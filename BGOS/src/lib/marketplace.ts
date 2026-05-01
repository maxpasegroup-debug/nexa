import crypto from "crypto";

import type { AgentCategory, MarketplaceAgent, Role } from "@prisma/client";
import { NextResponse } from "next/server";

import auth from "@/lib/auth";
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
  const session = await auth();

  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (roles && !roles.includes(session.user.role)) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { session };
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
