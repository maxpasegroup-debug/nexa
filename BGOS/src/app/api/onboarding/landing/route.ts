import { NextResponse } from "next/server";

import { sendEmail } from "@/lib/email";
import {
  findLeastLoadedBDM,
  getInternalBusiness,
  getOptionalString,
  getString,
} from "@/lib/onboarding-flow";
import { prisma } from "@/lib/prisma";

function required(value: string, label: string) {
  if (!value) throw new Error(`${label} is required.`);
  return value;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const internalBusiness = await getInternalBusiness();

    if (!internalBusiness) {
      return NextResponse.json(
        { error: "BGOS internal business not found." },
        { status: 500 },
      );
    }

    const bdm = await findLeastLoadedBDM(internalBusiness.id);
    if (!bdm) {
      return NextResponse.json(
        { error: "No BDM available for assignment." },
        { status: 503 },
      );
    }

    const lead = await prisma.onboardingLead.create({
      data: {
        name: required(getString(body.name), "Name"),
        email: required(getString(body.email).toLowerCase(), "Email"),
        phone: required(getString(body.phone), "Phone"),
        companyName: required(getString(body.companyName), "Company name"),
        employeeCount: required(getString(body.employeeCount), "Employee count"),
        businessType: required(getString(body.businessType), "Business type"),
        challenge: getOptionalString(body.challenge),
        source: getOptionalString(body.source) ?? "landing_page",
        status: "BDM_ASSIGNED",
        assignedBDMId: bdm.id,
        nexaSessionId: getOptionalString(body.sessionToken),
      },
    });

    await Promise.allSettled([
      sendEmail({
        to: lead.email,
        toName: lead.name,
        subject: "Welcome to BGOS - we will call you shortly",
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.7">
            <p>Hi ${lead.name},</p>
            <p>Thank you for your interest in BGOS. Your dedicated Business Manager <strong>${bdm.name}</strong> will call you within 2 hours to understand your business and set everything up for you.</p>
            <p>Your enquiry reference: <strong>${lead.id}</strong>.</p>
          </div>
        `,
      }),
      sendEmail({
        to: bdm.email,
        toName: bdm.name,
        subject: `New lead assigned - ${lead.companyName}`,
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.7">
            <h2>New landing page lead</h2>
            <p><strong>Name:</strong> ${lead.name}</p>
            <p><strong>Company:</strong> ${lead.companyName}</p>
            <p><strong>Phone:</strong> ${lead.phone}</p>
            <p><strong>Email:</strong> ${lead.email}</p>
            <p><strong>Business type:</strong> ${lead.businessType}</p>
            <p><strong>Employee count:</strong> ${lead.employeeCount}</p>
            <p><strong>Challenge:</strong> ${lead.challenge ?? "Not provided"}</p>
            <p><strong>Call them within 2 hours.</strong></p>
            <p>Their best time to call: ${getOptionalString(body.bestTimeToCall) ?? "Not provided"}.</p>
            <p><a href="https://iceconnect.in/bdm">Open BGOS dashboard</a></p>
          </div>
        `,
      }),
      prisma.nexaInsight.create({
        data: {
          businessId: internalBusiness.id,
          type: "opportunity",
          message: `New landing page lead - ${lead.companyName}. Assigned to ${bdm.name}. Call within 2 hours.`,
          action: "Call lead",
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      bdmName: bdm.name,
      estimatedCallTime: "within 2 hours",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create lead.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
