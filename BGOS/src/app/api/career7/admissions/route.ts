import { NextResponse } from "next/server";

import { getCareer7Context } from "@/lib/career7-auth";
import { buildBdp, starterAdmissions } from "@/lib/career7-data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authResult = await getCareer7Context(request);
    if (authResult.response) return authResult.response;

    const bdp = await buildBdp(authResult.context);

    return NextResponse.json({
      pathways: starterAdmissions,
      total: starterAdmissions.length,
      shortlist: [],
      readiness: {
        academicFit: 74,
        globalFit: 69,
        documents: bdp.documentsReadiness,
        scholarships: bdp.scholarshipReadiness,
      },
      nexaRecommendation:
        "Complete Academic Readiness and Global Readiness before finalizing admissions shortlists.",
    });
  } catch (error) {
    console.error("[career7:admissions]", error);
    return NextResponse.json({ error: "Unable to load Blizzway admissions." }, { status: 500 });
  }
}
