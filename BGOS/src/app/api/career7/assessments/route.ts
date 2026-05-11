import { NextResponse } from "next/server";

import { getCareer7Context } from "@/lib/career7-auth";
import { buildBdp, starterAssessments } from "@/lib/career7-data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authResult = await getCareer7Context(request);
    if (authResult.response) return authResult.response;

    const bdp = await buildBdp(authResult.context);

    return NextResponse.json({
      assessments: starterAssessments,
      total: starterAssessments.length,
      completed: [],
      recommended: starterAssessments.filter((assessment) => assessment.status === "recommended"),
      bdpImpact: {
        profileStrength: bdp.profileStrength,
        admissionsReadiness: bdp.metrics.admissionsReadiness,
        message: "Assessment results are structured to improve BDP and admissions recommendations when scoring is connected.",
      },
    });
  } catch (error) {
    console.error("[career7:assessments]", error);
    return NextResponse.json({ error: "Unable to load Blizzway assessments." }, { status: 500 });
  }
}
