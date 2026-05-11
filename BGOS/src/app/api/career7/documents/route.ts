import { NextResponse } from "next/server";

import { getCareer7Context } from "@/lib/career7-auth";
import { listDocuments, serializeDocument } from "@/lib/blizzway-documents";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authResult = await getCareer7Context(request);
  if (authResult.response) return authResult.response;

  const documents = await listDocuments(authResult.context);
  return NextResponse.json({
    documents: documents.map(serializeDocument),
    total: documents.length,
  });
}
