import { NextResponse } from "next/server";

import { getCareer7Context } from "@/lib/career7-auth";
import { getDocumentForUser, parseDocument, serializeDocument } from "@/lib/blizzway-documents";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const authResult = await getCareer7Context(request);
    if (authResult.response) return authResult.response;

    const document = await getDocumentForUser(authResult.context, params.id);
    if (!document) return NextResponse.json({ error: "Document not found." }, { status: 404 });

    const parsed = await parseDocument(document);
    return NextResponse.json({ document: serializeDocument(parsed) });
  } catch (error) {
    console.error("[career7:documents:parse]", error);
    return NextResponse.json({ error: "Unable to parse document." }, { status: 500 });
  }
}
