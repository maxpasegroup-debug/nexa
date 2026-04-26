import type { Email, EmailAccount, EmailLabel, Lead } from "@prisma/client";
import { google } from "googleapis";

import { createChatCompletionText } from "@/lib/openai";
import { prisma } from "@/lib/prisma";

const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.modify",
];

type EmailClassification = {
  label: EmailLabel;
  confidence: number;
  reason: string;
  isLead: boolean;
  suggestedReply: string | null;
};

function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );
}

function decodeBase64Url(value?: string | null) {
  if (!value) return "";
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(normalized, "base64").toString("utf8");
}

function getHeader(
  headers: Array<{ name?: string | null; value?: string | null }> = [],
  name: string,
) {
  return (
    headers.find((header) => header.name?.toLowerCase() === name.toLowerCase())
      ?.value ?? ""
  );
}

function parseAddress(value: string) {
  const match = value.match(/^(?:"?([^"<]+)"?\s)?<?([^<>\s]+@[^<>\s]+)>?$/);
  return {
    name: match?.[1]?.trim() || undefined,
    email: (match?.[2] ?? value).trim().toLowerCase(),
  };
}

function extractBody(payload?: {
  mimeType?: string | null;
  body?: { data?: string | null } | null;
  parts?: Array<{
    mimeType?: string | null;
    body?: { data?: string | null } | null;
    parts?: unknown;
  }> | null;
}) {
  const htmlParts: string[] = [];
  const textParts: string[] = [];

  function walk(part: typeof payload) {
    if (!part) return;

    const data = decodeBase64Url(part.body?.data);
    if (data && part.mimeType === "text/html") htmlParts.push(data);
    if (data && part.mimeType === "text/plain") textParts.push(data);

    part.parts?.forEach((child) => walk(child as typeof payload));
  }

  walk(payload);

  return htmlParts.join("\n") || textParts.join("\n") || decodeBase64Url(payload?.body?.data);
}

function toRawEmail(to: string, subject: string, body: string, threadId?: string) {
  const lines = [
    `To: ${to}`,
    `Subject: ${subject}`,
    "Content-Type: text/html; charset=utf-8",
    "MIME-Version: 1.0",
    ...(threadId ? [`References: ${threadId}`, `In-Reply-To: ${threadId}`] : []),
    "",
    body,
  ];

  return Buffer.from(lines.join("\r\n"))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function safeEmailLabel(value: unknown): EmailLabel {
  const label = String(value);
  if (
    label === "LEAD" ||
    label === "SUPPORT" ||
    label === "SPAM" ||
    label === "INTERNAL" ||
    label === "IMPORTANT" ||
    label === "UNCATEGORIZED"
  ) {
    return label;
  }

  return "UNCATEGORIZED";
}

export function getGmailAuthUrl(userId: string) {
  const oauth2Client = getOAuthClient();

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: GMAIL_SCOPES,
    state: userId,
  });
}

export async function exchangeCodeForTokens(code: string) {
  const oauth2Client = getOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });
  const profile = await gmail.users.getProfile({ userId: "me" });

  return {
    accessToken: tokens.access_token ?? "",
    refreshToken: tokens.refresh_token ?? "",
    tokenExpiry: new Date(tokens.expiry_date ?? Date.now() + 3600 * 1000),
    email: profile.data.emailAddress ?? "",
  };
}

export async function getGmailClient(emailAccount: EmailAccount) {
  const oauth2Client = getOAuthClient();
  oauth2Client.setCredentials({
    access_token: emailAccount.accessToken,
    refresh_token: emailAccount.refreshToken,
    expiry_date: emailAccount.tokenExpiry.getTime(),
  });

  const expiresWithinFiveMinutes =
    emailAccount.tokenExpiry.getTime() - Date.now() < 5 * 60 * 1000;

  if (expiresWithinFiveMinutes) {
    const { credentials } = await oauth2Client.refreshAccessToken();
    await prisma.emailAccount.update({
      where: { id: emailAccount.id },
      data: {
        accessToken: credentials.access_token ?? emailAccount.accessToken,
        refreshToken: credentials.refresh_token ?? emailAccount.refreshToken,
        tokenExpiry: new Date(
          credentials.expiry_date ?? Date.now() + 3600 * 1000,
        ),
      },
    });
    oauth2Client.setCredentials(credentials);
  }

  return google.gmail({ version: "v1", auth: oauth2Client });
}

export async function syncEmails(accountId: string, maxEmails = 50) {
  const account = await prisma.emailAccount.findUnique({
    where: { id: accountId },
  });

  if (!account) throw new Error("Email account not found.");

  const gmail = await getGmailClient(account);
  const list = await gmail.users.messages.list({
    userId: "me",
    maxResults: maxEmails,
    labelIds: ["INBOX"],
  });
  const messages = list.data.messages ?? [];
  let newCount = 0;

  for (const message of messages) {
    if (!message.id) continue;

    const exists = await prisma.email.findUnique({
      where: { gmailId: message.id },
      select: { id: true },
    });
    if (exists) continue;

    const full = await gmail.users.messages.get({
      userId: "me",
      id: message.id,
      format: "full",
    });
    const payload = full.data.payload;
    const headers = payload?.headers ?? [];
    const from = parseAddress(getHeader(headers, "From"));
    const to = parseAddress(getHeader(headers, "To"));
    const subject = getHeader(headers, "Subject") || "(No subject)";
    const body = extractBody(payload);
    const labelIds = full.data.labelIds ?? [];
    const internalDate = Number(full.data.internalDate ?? Date.now());

    await prisma.email.create({
      data: {
        accountId: account.id,
        businessId: account.businessId,
        gmailId: message.id,
        threadId: full.data.threadId ?? message.threadId ?? message.id,
        from: from.email,
        fromName: from.name,
        to: to.email || account.email,
        subject,
        snippet: full.data.snippet,
        body,
        isRead: !labelIds.includes("UNREAD"),
        isStarred: labelIds.includes("STARRED"),
        receivedAt: new Date(internalDate),
      },
    });
    newCount += 1;
  }

  await prisma.emailAccount.update({
    where: { id: account.id },
    data: { lastSyncAt: new Date() },
  });

  return newCount;
}

export async function sendEmail(
  accountId: string,
  to: string,
  subject: string,
  body: string,
  threadId?: string,
) {
  const account = await prisma.emailAccount.findUnique({
    where: { id: accountId },
  });

  if (!account) throw new Error("Email account not found.");

  const gmail = await getGmailClient(account);
  const sent = await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: toRawEmail(to, subject, body, threadId),
      threadId,
    },
  });

  return sent.data.id ?? "";
}

export async function autoLabelEmail(
  email: Email,
  businessId: string,
): Promise<EmailClassification> {
  const fallback: EmailClassification = {
    label: "UNCATEGORIZED",
    confidence: 50,
    reason: "NEXA could not confidently classify this email.",
    isLead: false,
    suggestedReply: null,
  };

  try {
    const text = await createChatCompletionText({
      maxTokens: 600,
      system:
        "You are NEXA, an AI email classifier. Classify this email and return only a JSON object with: label ('LEAD'|'SUPPORT'|'SPAM'|'INTERNAL'|'IMPORTANT'|'UNCATEGORIZED'), confidence (0-100), reason (one sentence), isLead (boolean), suggestedReply (string — a professional 3-sentence reply draft, or null if not needed). No other text.",
      messages: [
        {
          role: "user",
          content: JSON.stringify({
            businessId,
            subject: email.subject,
            from: email.from,
            snippet: email.snippet,
          }),
        },
      ],
    });
    if (!text) return fallback;

    const parsed = JSON.parse(text) as Record<string, unknown>;
    return {
      label: safeEmailLabel(parsed.label),
      confidence: Math.max(0, Math.min(100, Number(parsed.confidence) || 0)),
      reason:
        typeof parsed.reason === "string" ? parsed.reason : fallback.reason,
      isLead: Boolean(parsed.isLead),
      suggestedReply:
        typeof parsed.suggestedReply === "string"
          ? parsed.suggestedReply
          : null,
    };
  } catch {
    return fallback;
  }
}

export async function matchEmailToLead(email: Email, businessId: string) {
  const exact = await prisma.lead.findFirst({
    where: {
      businessId,
      email: { equals: email.from, mode: "insensitive" },
    },
  });

  if (exact) {
    await prisma.email.update({
      where: { id: email.id },
      data: { leadId: exact.id },
    });
    return exact;
  }

  const senderName = (email.fromName ?? email.from.split("@")[0] ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .trim();
  if (!senderName) return null;

  const leads = await prisma.lead.findMany({
    where: { businessId },
    take: 100,
  });

  let best: { lead: Lead; score: number } | null = null;
  const senderTokens = new Set(senderName.split(/\s+/).filter(Boolean));

  for (const lead of leads) {
    const leadTokens = new Set(lead.name.toLowerCase().split(/\s+/));
    const overlap = Array.from(senderTokens).filter((token) =>
      leadTokens.has(token),
    );
    const score =
      (overlap.length / Math.max(1, Math.max(senderTokens.size, leadTokens.size))) *
      100;

    if (!best || score > best.score) {
      best = { lead, score };
    }
  }

  if (best && best.score > 70) {
    await prisma.email.update({
      where: { id: email.id },
      data: { leadId: best.lead.id },
    });
    return best.lead;
  }

  return null;
}
