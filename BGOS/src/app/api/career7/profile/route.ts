import { NextResponse } from "next/server";

import { getCareer7Context } from "@/lib/career7-auth";
import { getCareer7User } from "@/lib/career7-data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authResult = await getCareer7Context(request);
    if (authResult.response) return authResult.response;

    const user = await getCareer7User(authResult.context);

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      businessId: user.businessId,
      businessModel: authResult.context.businessModel,
      business: user.business,
      joinedAt: user.createdAt,
    });
  } catch (error) {
    console.error("[career7:profile]", error);
    return NextResponse.json({ error: "Unable to load Blizzway profile." }, { status: 500 });
  }
}
