import { NextResponse } from "next/server";

import { getCrmContext } from "@/lib/leads/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function POST(request: Request, { params }: RouteContext) {
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

    const { type, note } = await request.json();

    if (typeof type !== "string" || typeof note !== "string") {
      return NextResponse.json(
        { error: "Type and note are required." },
        { status: 400 },
      );
    }

    const activity = await prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        userId: context.user.id,
        type,
        note,
      },
      include: {
        user: {
          select: {
            name: true,
            role: true,
          },
        },
      },
    });

    await prisma.lead.update({
      where: { id: lead.id },
      data: { lastContactAt: new Date() },
    });

    return NextResponse.json({ activity }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Unable to add lead activity." },
      { status: 500 },
    );
  }
}
