import { NextResponse } from "next/server";

import { getCrmContext, scoreLead } from "@/lib/leads/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function POST(_request: Request, { params }: RouteContext) {
  try {
    const context = await getCrmContext();

    if (context.error) return context.error;

    const lead = await prisma.lead.findFirst({
      where: {
        id: params.id,
        businessId: context.businessId,
      },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    }

    const result = await scoreLead(lead.id);

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Unable to score lead." },
      { status: 500 },
    );
  }
}
