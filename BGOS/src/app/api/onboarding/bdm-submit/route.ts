import { NextResponse } from "next/server";

import auth from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { findLeastLoadedSDE, getString } from "@/lib/onboarding-flow";
import { prisma } from "@/lib/prisma";

function dueTomorrow() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date;
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "BDM" || !session.user.businessId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const onboardingLeadId = getString(body.onboardingLeadId);
    const selectedPlan = getString(body.selectedPlan);

    if (!onboardingLeadId || !selectedPlan) {
      return NextResponse.json(
        { error: "onboardingLeadId and selectedPlan are required." },
        { status: 400 },
      );
    }

    const lead = await prisma.onboardingLead.findFirst({
      where: { id: onboardingLeadId, assignedBDMId: session.user.id },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    }

    const sde = await findLeastLoadedSDE(session.user.businessId);
    if (!sde) {
      return NextResponse.json(
        { error: "No SDE available for assignment." },
        { status: 503 },
      );
    }

    const bdmNotes = {
      notes: body.notes,
      products: body.products,
      teamStructure: body.teamStructure,
      salesProcess: body.salesProcess,
      mainChallenge: body.mainChallenge,
      estimatedLeadsPerMonth: body.estimatedLeadsPerMonth,
      additionalRequirements: body.additionalRequirements,
      selectedPlan,
    };
    const description = JSON.stringify(bdmNotes, null, 2);

    const [updatedLead] = await prisma.$transaction([
      prisma.onboardingLead.update({
        where: { id: lead.id },
        data: {
          status: "SDE_BUILDING",
          bdmNotes: description,
          bdmSubmittedAt: new Date(),
          selectedPlan,
          assignedSDEId: sde.id,
        },
      }),
      prisma.task.create({
        data: {
          title: `Build workspace for ${lead.companyName}`,
          description,
          priority: "HIGH",
          dueDate: dueTomorrow(),
          assignedTo: sde.id,
        },
      }),
    ]);

    const bdm = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true },
    });

    await Promise.allSettled([
      sendEmail({
        to: sde.email,
        toName: sde.name,
        subject: `New workspace to build - ${lead.companyName} ${selectedPlan}`,
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.7">
            <h2>Workspace build brief</h2>
            <p><strong>Company:</strong> ${lead.companyName}</p>
            <p><strong>Plan:</strong> ${selectedPlan}</p>
            <pre style="white-space:pre-wrap;background:#f4f4f4;padding:16px;border-radius:8px;">${description}</pre>
            <p><a href="https://iceconnect.in/sde">Open workspace builder</a></p>
          </div>
        `,
      }),
      bdm
        ? sendEmail({
            to: bdm.email,
            toName: bdm.name,
            subject: `Workspace brief submitted - ${lead.companyName}`,
            html: `<p>Your workspace brief for <strong>${lead.companyName}</strong> has been submitted to ${sde.name}.</p>`,
          })
        : Promise.resolve(false),
      prisma.nexaInsight.create({
        data: {
          businessId: session.user.businessId,
          type: "action",
          message: `${bdm?.name ?? "BDM"} submitted ${lead.companyName} brief. SDE ${sde.name} building workspace. Due in 24 hours.`,
          action: "Track build",
        },
      }),
    ]);

    return NextResponse.json({ success: true, lead: updatedLead });
  } catch {
    return NextResponse.json(
      { error: "Unable to submit BDM onboarding brief." },
      { status: 500 },
    );
  }
}
