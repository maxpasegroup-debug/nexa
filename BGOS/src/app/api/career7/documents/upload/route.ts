import { NextResponse } from "next/server";

import { getCareer7Context } from "@/lib/career7-auth";
import {
  normalizeDocumentType,
  serializeDocument,
  storeDocumentFile,
  validateDocumentUpload,
} from "@/lib/blizzway-documents";
import { getString } from "@/lib/marketplace";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const authResult = await getCareer7Context(request);
    if (authResult.response) return authResult.response;

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Document file is required." }, { status: 400 });
    }

    const validationError = validateDocumentUpload(file);
    if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

    const documentType = normalizeDocumentType(getString(formData.get("documentType")));
    const stored = await storeDocumentFile({ context: authResult.context, file });
    const document = await prisma.blizzwayDocument.create({
      data: {
        businessModel: authResult.context.businessModel,
        businessId: authResult.context.businessId,
        userId: authResult.context.userId,
        documentType,
        originalFilename: stored.originalFilename,
        mimeType: file.type,
        size: file.size,
        storageKey: stored.storageKey,
        privacyLevel: "private",
        status: "uploaded",
      },
    });

    return NextResponse.json({ document: serializeDocument(document) }, { status: 201 });
  } catch (error) {
    console.error("[career7:documents:upload]", error);
    return NextResponse.json({ error: "Unable to upload document." }, { status: 500 });
  }
}
