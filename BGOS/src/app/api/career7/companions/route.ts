import { NextResponse } from "next/server";

import { getCareer7Context } from "@/lib/career7-auth";
import { getCareer7Agents, serializeAgent } from "@/lib/career7-data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authResult = await getCareer7Context(request);
    if (authResult.response) return authResult.response;

    const agents = (await getCareer7Agents()).map(serializeAgent);

    return NextResponse.json({
      companions: agents,
      total: agents.length,
      featured: agents.find((agent) => agent.isFeatured) ?? null,
    });
  } catch (error) {
    console.error("[career7:companions]", error);
    return NextResponse.json({ error: "Unable to load Blizzway companions." }, { status: 500 });
  }
}
