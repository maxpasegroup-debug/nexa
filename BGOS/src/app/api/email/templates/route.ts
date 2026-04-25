import { NextRequest, NextResponse } from "next/server";

import { getCurrentBusiness } from "@/lib/dashboard/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const context = await getCurrentBusiness();

    if (context.error) return context.error;

    const templates = await prisma.emailTemplate.findMany({
      where: { businessId: context.business.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ templates });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch templates." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const context = await getCurrentBusiness();

    if (context.error) return context.error;

    const body = (await request.json()) as {
      name?: string;
      subject?: string;
      body?: string;
      category?: string;
    };

    if (!body.name || !body.subject || !body.body || !body.category) {
      return NextResponse.json(
        { error: "name, subject, body, and category are required." },
        { status: 400 },
      );
    }

    const template = await prisma.emailTemplate.create({
      data: {
        businessId: context.business.id,
        name: body.name,
        subject: body.subject,
        body: body.body,
        category: body.category,
      },
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Unable to create template." },
      { status: 500 },
    );
  }
}
