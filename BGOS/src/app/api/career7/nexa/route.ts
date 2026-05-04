import { NextResponse } from "next/server";

import auth from "@/lib/auth";
import {
  type Career7NexaMessage,
  getCareer7NexaReply,
} from "@/lib/career7-nexa";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!session.user.businessId) {
    return NextResponse.json(
      { error: "Career7 requires a business workspace." },
      { status: 400 },
    );
  }

  const body = (await request.json()) as {
    message?: string;
    quickAction?: string;
    history?: Career7NexaMessage[];
  };

  const message = body.message?.trim() || body.quickAction?.trim();
  if (!message) {
    return NextResponse.json({ error: "message is required." }, { status: 400 });
  }

  const reply = await getCareer7NexaReply({
    userId: session.user.id,
    businessId: session.user.businessId,
    message,
    quickAction: body.quickAction,
    history: body.history,
  });

  return NextResponse.json(reply);
}
