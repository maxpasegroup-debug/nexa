import { randomUUID } from "crypto";
import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";
import type { BlizzwayDocument, Prisma } from "@prisma/client";

import type { Career7Context } from "@/lib/career7-auth";
import { prisma } from "@/lib/prisma";

export const BLIZZWAY_DOCUMENT_MAX_BYTES = 8 * 1024 * 1024;

const storageRoot = process.env.BLIZZWAY_DOCUMENT_STORAGE_PATH || path.join(process.cwd(), ".blizzway-documents");

const allowedMimeTypes = new Map([
  ["application/pdf", "pdf"],
  ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "docx"],
  ["text/plain", "txt"],
  ["image/png", "png"],
  ["image/jpeg", "jpg"],
]);

const allowedDocumentTypes = new Set([
  "resume",
  "certificate",
  "marksheet",
  "transcript",
  "sop_draft",
  "lor_draft",
  "portfolio",
  "passport_id",
  "admission_document",
  "other",
]);

export function normalizeDocumentType(value: unknown) {
  const normalized = typeof value === "string" ? value.trim().toLowerCase().replace(/[^a-z0-9_ -]/g, "").replace(/[\s-]+/g, "_") : "";
  return allowedDocumentTypes.has(normalized) ? normalized : "other";
}

export function validateDocumentUpload(file: File) {
  if (!file.size) return "Document file is required.";
  if (file.size > BLIZZWAY_DOCUMENT_MAX_BYTES) return "Document exceeds the 8 MB beta upload limit.";
  if (!allowedMimeTypes.has(file.type)) return "Unsupported document type. Upload PDF, DOCX, TXT, PNG, or JPG.";
  return null;
}

function extensionForMime(mimeType: string) {
  return allowedMimeTypes.get(mimeType) ?? "bin";
}

function safeFilename(name: string) {
  return name.replace(/[/\\?%*:|"<>]/g, "-").replace(/\s+/g, " ").trim().slice(0, 160) || "document";
}

async function ensureStorageRoot() {
  await mkdir(storageRoot, { recursive: true });
}

export async function storeDocumentFile({
  context,
  file,
}: {
  context: Career7Context;
  file: File;
}) {
  await ensureStorageRoot();
  const extension = extensionForMime(file.type);
  const storageKey = path.join(context.businessId, context.userId, `${Date.now()}-${randomUUID()}.${extension}`);
  const absolutePath = path.join(storageRoot, storageKey);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, Buffer.from(await file.arrayBuffer()));
  return { storageKey, originalFilename: safeFilename(file.name) };
}

async function readDocumentBuffer(document: Pick<BlizzwayDocument, "storageKey">) {
  return readFile(path.join(storageRoot, document.storageKey));
}

function summarizeText(text: string, documentType: string) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return "No readable text was extracted from this document.";
  const sentences = normalized.split(/(?<=[.!?])\s+/).filter(Boolean).slice(0, 3);
  return `${documentType.replace(/_/g, " ")} summary: ${sentences.join(" ").slice(0, 700)}`;
}

function extractMetadata(text: string, document: Pick<BlizzwayDocument, "documentType" | "mimeType" | "size" | "originalFilename">) {
  const words = text ? text.trim().split(/\s+/).filter(Boolean).length : 0;
  const emails = Array.from(new Set(text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? [])).slice(0, 3);
  const phones = Array.from(new Set(text.match(/(?:\+?\d[\d\s().-]{7,}\d)/g) ?? [])).slice(0, 3);

  return {
    documentType: document.documentType,
    mimeType: document.mimeType,
    size: document.size,
    originalFilename: document.originalFilename,
    wordCount: words,
    hasEmail: emails.length > 0,
    hasPhone: phones.length > 0,
    extractedSignals: {
      emails,
      phones,
    },
    parser: "blizzway_documents_v1",
  };
}

export function serializeDocument(document: BlizzwayDocument) {
  return {
    id: document.id,
    businessModel: document.businessModel,
    documentType: document.documentType,
    originalFilename: document.originalFilename,
    mimeType: document.mimeType,
    size: document.size,
    parsedSummary: document.parsedSummary,
    extractedMetadata: document.extractedMetadata,
    privacyLevel: document.privacyLevel,
    status: document.status,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
  };
}

export async function getDocumentForUser(context: Career7Context, id: string) {
  return prisma.blizzwayDocument.findFirst({
    where: {
      id,
      businessModel: context.businessModel,
      businessId: context.businessId,
      userId: context.userId,
      status: { not: "archived" },
    },
  });
}

export async function listDocuments(context: Career7Context) {
  return prisma.blizzwayDocument.findMany({
    where: {
      businessModel: context.businessModel,
      businessId: context.businessId,
      userId: context.userId,
      status: { not: "archived" },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function parseDocument(document: BlizzwayDocument) {
  const buffer = await readDocumentBuffer(document);
  let parsedText = "";
  let parseStatus = "parsed";
  let parserNote = "";

  if (document.mimeType === "text/plain") {
    parsedText = buffer.toString("utf8").replace(/\0/g, "").trim();
  } else if (document.mimeType === "application/pdf") {
    parseStatus = "failed";
    parserNote = "PDF text extraction dependency is not installed in this beta build. File is stored privately for future parsing.";
  } else if (document.mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    parseStatus = "failed";
    parserNote = "DOCX text extraction dependency is not installed in this beta build. File is stored privately for future parsing.";
  } else if (document.mimeType.startsWith("image/")) {
    parseStatus = "uploaded";
    parserNote = "Image OCR is pending. File is stored privately and can be reviewed later.";
  }

  const parsedSummary = parsedText ? summarizeText(parsedText, document.documentType) : parserNote;
  const extractedMetadata = {
    ...extractMetadata(parsedText, document),
    parserNote,
    ocrPending: document.mimeType.startsWith("image/"),
  } satisfies Prisma.InputJsonObject;

  return prisma.blizzwayDocument.update({
    where: { id: document.id },
    data: {
      parsedText: parsedText || null,
      parsedSummary,
      extractedMetadata,
      status: parseStatus,
    },
  });
}

export async function archiveDocument(document: BlizzwayDocument) {
  await prisma.blizzwayDocument.update({
    where: { id: document.id },
    data: { status: "archived" },
  });

  try {
    await unlink(path.join(storageRoot, document.storageKey));
  } catch {
    // Keep deletion idempotent; the DB archive is the source of truth.
  }
}

export async function buildDocumentContextForCompanion(context: Career7Context, companionText: string) {
  const normalized = companionText.toLowerCase();
  const types = new Set<string>();
  if (normalized.includes("resume") || normalized.includes("cv")) types.add("resume");
  if (normalized.includes("sop")) types.add("sop_draft");
  if (normalized.includes("lor")) types.add("lor_draft");
  if (normalized.includes("portfolio")) types.add("portfolio");
  if (normalized.includes("admission") || normalized.includes("visa") || normalized.includes("scholarship")) {
    types.add("admission_document");
    types.add("transcript");
    types.add("marksheet");
    types.add("passport_id");
  }

  if (types.size === 0) return null;

  const documents = await prisma.blizzwayDocument.findMany({
    where: {
      businessModel: context.businessModel,
      businessId: context.businessId,
      userId: context.userId,
      documentType: { in: Array.from(types) },
      status: "parsed",
      parsedText: { not: null },
    },
    orderBy: { updatedAt: "desc" },
    take: 3,
  });

  if (!documents.length) return null;

  return documents.map((document) => ({
    id: document.id,
    documentType: document.documentType,
    originalFilename: document.originalFilename,
    parsedSummary: document.parsedSummary,
    textSnippet: document.parsedText?.slice(0, 1800),
  }));
}

export async function applyDocumentToBdp(context: Career7Context, document: BlizzwayDocument) {
  if (!document.parsedSummary) {
    throw new Error("DOCUMENT_NOT_PARSED");
  }

  const action = `Review ${document.documentType.replace(/_/g, " ")}: ${document.parsedSummary.slice(0, 220)}`;
  const existing = await prisma.blizzwayBdpProfile.findUnique({
    where: {
      businessModel_businessId_userId: {
        businessModel: context.businessModel,
        businessId: context.businessId,
        userId: context.userId,
      },
    },
  });
  const currentActions = Array.isArray(existing?.recommendedActions) ? existing.recommendedActions.filter((item): item is string => typeof item === "string") : [];
  const nextActions = Array.from(new Set([action, ...currentActions])).slice(0, 10);

  return prisma.blizzwayBdpProfile.upsert({
    where: {
      businessModel_businessId_userId: {
        businessModel: context.businessModel,
        businessId: context.businessId,
        userId: context.userId,
      },
    },
    create: {
      businessModel: context.businessModel,
      businessId: context.businessId,
      userId: context.userId,
      headline: "Blizzway Explorer",
      currentStageSummary: document.parsedSummary,
      strengths: [],
      readiness: {
        documents: [{ id: document.id, type: document.documentType, status: document.status }],
      },
      recommendedActions: nextActions,
      profileStrength: 45,
      source: "document_apply_v1",
    },
    update: {
      recommendedActions: nextActions,
      readiness: {
        documents: [{ id: document.id, type: document.documentType, status: document.status }],
        lastAppliedDocumentId: document.id,
      },
      profileStrength: Math.min(100, Math.max(existing?.profileStrength ?? 35, 50)),
      source: "document_apply_v1",
    },
  });
}
