import { NextResponse } from "next/server";

import { getCrmContext } from "@/lib/leads/server";
import { analyseNotes } from "@/lib/nexa-bdm-analysis";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: {
    id: string;
  };
};

async function getLeadForCurrentBusiness(leadId: string) {
  const context = await getCrmContext();
  if (context.error) return { context, error: context.error };

  const lead = await prisma.lead.findFirst({
    where: {
      id: leadId,
      businessId: context.businessId,
    },
    select: { id: true, assignedTo: true },
  });

  if (!lead) {
    return {
      context,
      error: NextResponse.json({ error: "Lead not found." }, { status: 404 }),
    };
  }

  return { context, lead };
}

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const result = await getLeadForCurrentBusiness(params.id);
    if (result.error) return result.error;

    const notes = await prisma.leadNote.findMany({
      where: { leadId: params.id },
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json({ notes });
  } catch (error) {
    console.error("[lead-notes:get]", error);
    return NextResponse.json({ error: "Unable to fetch lead notes." }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const result = await getLeadForCurrentBusiness(params.id);
    if (result.error) return result.error;
    if (!result.lead || !result.context || "error" in result.context) {
      return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const content = typeof body.content === "string" ? body.content.trim() : "";

    if (!content) {
      return NextResponse.json({ error: "Note content is required." }, { status: 400 });
    }

    const note = await prisma.leadNote.create({
      data: {
        leadId: params.id,
        authorId: result.context.user.id,
        content,
        noteType: typeof body.noteType === "string" ? body.noteType : "call",
        callDuration:
          typeof body.callDuration === "number"
            ? body.callDuration
            : Number.isFinite(Number(body.callDuration))
              ? Number(body.callDuration)
              : undefined,
      },
      include: {
        author: {
          select: { id: true, name: true },
        },
      },
    });

    await prisma.lead.update({
      where: { id: params.id },
      data: { lastContactedAt: new Date() },
    });

    void Promise.allSettled([analyseNotes(result.lead.assignedTo ?? result.context.user.id)]);

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    console.error("[lead-notes:create]", error);
    return NextResponse.json({ error: "Unable to create lead note." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const result = await getLeadForCurrentBusiness(params.id);
    if (result.error) return result.error;
    if (!result.context || "error" in result.context) {
      return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const noteId = searchParams.get("noteId");

    if (!noteId) {
      return NextResponse.json({ error: "noteId is required." }, { status: 400 });
    }

    const note = await prisma.leadNote.findFirst({
      where: {
        id: noteId,
        leadId: params.id,
        authorId: result.context.user.id,
      },
      select: { id: true },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found." }, { status: 404 });
    }

    await prisma.leadNote.delete({ where: { id: note.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[lead-notes:delete]", error);
    return NextResponse.json({ error: "Unable to delete lead note." }, { status: 500 });
  }
}
