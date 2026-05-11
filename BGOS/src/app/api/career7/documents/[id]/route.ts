import { NextResponse } from "next/server";

import { getCareer7Context } from "@/lib/career7-auth";
import { archiveDocument, getDocumentForUser, serializeDocument } from "@/lib/blizzway-documents";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const authResult = await getCareer7Context(request);
  if (authResult.response) return authResult.response;

  const document = await getDocumentForUser(authResult.context, params.id);
  if (!document) return NextResponse.json({ error: "Document not found." }, { status: 404 });

  return NextResponse.json({
    document: {
      ...serializeDocument(document),
      parsedTextPreview: document.parsedText?.slice(0, 2400) ?? null,
    },
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  const authResult = await getCareer7Context(request);
  if (authResult.response) return authResult.response;

  const document = await getDocumentForUser(authResult.context, params.id);
  if (!document) return NextResponse.json({ error: "Document not found." }, { status: 404 });

  await archiveDocument(document);
  return NextResponse.json({ ok: true });
}
