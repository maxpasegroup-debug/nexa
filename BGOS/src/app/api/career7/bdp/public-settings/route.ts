import { NextResponse } from "next/server";

import { getCareer7Context } from "@/lib/career7-auth";
import {
  getPublicBdpSettings,
  serializePrivatePublicBdp,
  updatePublicBdpSettings,
} from "@/lib/blizzway-public-bdp";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authResult = await getCareer7Context(request);
    if (authResult.response) return authResult.response;

    const profile = await getPublicBdpSettings(authResult.context);
    return NextResponse.json({ profile: serializePrivatePublicBdp(profile) });
  } catch (error) {
    console.error("[career7:bdp:public-settings:get]", error);
    return NextResponse.json({ error: "Unable to load public BDP settings." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const authResult = await getCareer7Context(request);
    if (authResult.response) return authResult.response;

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const profile = await updatePublicBdpSettings(authResult.context, body);
    return NextResponse.json({ profile: serializePrivatePublicBdp(profile) });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("SLUG_INVALID:")) {
      return NextResponse.json({ error: error.message.replace("SLUG_INVALID:", "") }, { status: 400 });
    }

    if (error instanceof Error && error.message === "SLUG_TAKEN") {
      return NextResponse.json({ error: "That public BDP link is already taken." }, { status: 409 });
    }

    console.error("[career7:bdp:public-settings:update]", error);
    return NextResponse.json({ error: "Unable to update public BDP settings." }, { status: 500 });
  }
}
