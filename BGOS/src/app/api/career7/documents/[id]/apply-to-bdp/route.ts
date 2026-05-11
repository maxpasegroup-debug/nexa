import { NextResponse } from "next/server";

import { getCareer7Context } from "@/lib/career7-auth";
import { applyDocumentToBdp, getDocumentForUser, serializeDocument } from "@/lib/blizzway-documents";

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

    const bdp = await applyDocumentToBdp(authResult.context, document);
    return NextResponse.json({
      ok: true,
      document: serializeDocument(document),
      bdp: {
        id: bdp.id,
        profileStrength: bdp.profileStrength,
        recommendedActions: bdp.recommendedActions,
        updatedAt: bdp.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "DOCUMENT_NOT_PARSED") {
      return NextResponse.json({ error: "Parse this document before applying it to BDP." }, { status: 409 });
    }

    console.error("[career7:documents:apply-to-bdp]", error);
    return NextResponse.json({ error: "Unable to apply document to BDP." }, { status: 500 });
  }
}
