import { NextResponse } from "next/server";

import { sendEmail } from "@/lib/email";
import { getInternalBusiness, getOptionalString, getString } from "@/lib/onboarding-flow";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { getNextBDM } from "@/lib/round-robin";

export const dynamic = "force-dynamic";

function required(value: string, label: string) {
  if (!value) throw new Error(`${label} is required.`);
  return value;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function findOriginalBDM(email: string, businessId?: string | null) {
  const onboardingLead = await prisma.onboardingLead.findFirst({
    where: {
      OR: [
        { email },
        ...(businessId ? [{ businessId }] : []),
      ],
      assignedBDMId: { not: null },
    },
    orderBy: { createdAt: "desc" },
    include: {
      assignedBDM: {
        select: { id: true, name: true, email: true, businessId: true },
      },
    },
  });

  if (onboardingLead?.assignedBDM) return onboardingLead.assignedBDM;

  if (!businessId) return null;

  const portfolio = await prisma.customerPortfolio.findFirst({
    where: { lead: { businessId } },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { id: true, name: true, email: true, businessId: true },
      },
    },
  });

  return portfolio?.user ?? null;
}

async function createPipelineLead({
  businessId,
  bdmId,
  bdmName,
  name,
  email,
  phone,
  companyName,
  notes,
}: {
  businessId: string;
  bdmId: string;
  bdmName: string;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  notes: string;
}) {
  const lead = await prisma.lead.create({
    data: {
      name,
      phone,
      email,
      company: companyName,
      source: "MARKETPLACE",
      bdmStatus: "NEW",
      notes,
      businessId,
      assignedTo: bdmId,
      createdBy: bdmId,
      lastContactedAt: new Date(),
    },
  });

  await prisma.leadNote.create({
    data: {
      leadId: lead.id,
      authorId: bdmId,
      content: `${notes}\nAssigned to ${bdmName}.`,
      noteType: "marketplace",
    },
  });

  return lead;
}

export async function POST(request: Request) {
  const limited = rateLimit(request, {
    key: "marketplace-interest",
    limit: 20,
    windowMs: 10 * 60 * 1000,
  });
  if (limited) return limited;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const internalBusiness = await getInternalBusiness();

    if (!internalBusiness) {
      return NextResponse.json(
        { error: "BGOS internal business not found." },
        { status: 500 },
      );
    }

    const name = required(getString(body.name), "Name");
    const email = required(getString(body.email).toLowerCase(), "Email");
    const phone = required(getString(body.phone), "Phone");
    const companyName = required(getString(body.companyName), "Company name");
    const agentSlug = required(getString(body.agentSlug), "Agent slug");
    const agentName = required(getString(body.agentName), "Agent name");
    const employeeCount = getOptionalString(body.employeeCount) ?? "Not provided";
    const businessType = getOptionalString(body.businessType) ?? "Not provided";
    const message = getOptionalString(body.message);
    const isExistingCustomer = body.isExistingCustomer === true;
    const existingBusinessId = getOptionalString(body.existingBusinessId);

    if (!isExistingCustomer) {
      const bdm = await getNextBDM("MARKETPLACE_BDM");
      if (!bdm) {
        return NextResponse.json(
          { error: "No BDM available for assignment." },
          { status: 503 },
        );
      }

      const lead = await prisma.onboardingLead.create({
        data: {
          name,
          email,
          phone,
          companyName,
          employeeCount,
          businessType,
          challenge: message,
          source: "marketplace",
          status: "BDM_ASSIGNED",
          assignedBDMId: bdm.id,
          bdmNotes: `Interested in ${agentName} from marketplace`,
        },
      });

      await createPipelineLead({
        businessId: bdm.businessId ?? internalBusiness.id,
        bdmId: bdm.id,
        bdmName: bdm.name,
        name,
        email,
        phone,
        companyName,
        notes: `Marketplace enquiry - interested in ${agentName}. Agent slug: ${agentSlug}.${message ? ` Message: ${message}` : ""}`,
      });

      await Promise.allSettled([
        sendEmail({
          to: bdm.email,
          toName: bdm.name,
          subject: `New marketplace lead - ${companyName} wants ${agentName}`,
          html: `
            <div style="font-family:Arial,sans-serif;line-height:1.7">
              <h2>New marketplace lead</h2>
              <p><strong>Name:</strong> ${escapeHtml(name)}</p>
              <p><strong>Company:</strong> ${escapeHtml(companyName)}</p>
              <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
              <p><strong>Email:</strong> ${escapeHtml(email)}</p>
              <p><strong>Agent:</strong> ${escapeHtml(agentName)}</p>
              <p><strong>Message:</strong> ${escapeHtml(message ?? "Not provided")}</p>
              <p><strong>Call them within 2 hours.</strong></p>
            </div>
          `,
        }),
        sendEmail({
          to: email,
          toName: name,
          subject: `We received your interest in ${agentName}`,
          fromName: "BGOS Team",
          html: `
            <div style="font-family:Arial,sans-serif;line-height:1.7">
              <p>Hi ${escapeHtml(name)},</p>
              <p>Our team has been notified. ${escapeHtml(bdm.name)} will contact you within 2 hours.</p>
            </div>
          `,
        }),
        prisma.nexaInsight.create({
          data: {
            businessId: internalBusiness.id,
            type: "marketplace",
            message: `New marketplace lead - ${companyName} interested in ${agentName}. Assigned to ${bdm.name}.`,
            action: "Call marketplace lead",
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        leadId: lead.id,
        bdmName: bdm.name,
        message: "Our team will contact you shortly",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { businessId: true },
    });
    const customerBusinessId = existingUser?.businessId ?? existingBusinessId;
    const originalBDM = await findOriginalBDM(email, customerBusinessId);
    const bdm = originalBDM ?? (await getNextBDM("MARKETPLACE_BDM"));

    if (!bdm) {
      return NextResponse.json(
        { error: "No BDM available for assignment." },
        { status: 503 },
      );
    }

    await createPipelineLead({
      businessId: bdm.businessId ?? internalBusiness.id,
      bdmId: bdm.id,
      bdmName: bdm.name,
      name,
      email,
      phone,
      companyName,
      notes: `Upsell opportunity - existing customer wants to add ${agentName}. Agent slug: ${agentSlug}.${message ? ` Message: ${message}` : ""}`,
    });

    await Promise.allSettled([
      sendEmail({
        to: bdm.email,
        toName: bdm.name,
        subject: `Upsell opportunity - ${companyName} wants to add ${agentName}`,
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.7">
            <h2>Upsell opportunity</h2>
            <p><strong>Existing customer:</strong> ${escapeHtml(companyName)}</p>
            <p><strong>Name:</strong> ${escapeHtml(name)}</p>
            <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
            <p><strong>Email:</strong> ${escapeHtml(email)}</p>
            <p><strong>Agent:</strong> ${escapeHtml(agentName)}</p>
            <p><strong>Message:</strong> ${escapeHtml(message ?? "Not provided")}</p>
            <p><strong>Call them today.</strong></p>
          </div>
        `,
      }),
      sendEmail({
        to: email,
        toName: name,
        subject: `Your request for ${agentName} has been received`,
        fromName: "BGOS Team",
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.7">
            <p>Hi ${escapeHtml(name)},</p>
            <p>Your request for ${escapeHtml(agentName)} has been received. Your account manager will be in touch shortly.</p>
          </div>
        `,
      }),
      prisma.nexaInsight.create({
        data: {
          businessId: internalBusiness.id,
          type: "marketplace",
          message: `Upsell opportunity - ${companyName} wants ${agentName}. Assigned to ${bdm.name}.`,
          action: "Call customer",
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      bdmName: bdm.name,
      message: "Your account manager will contact you shortly",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to submit marketplace interest.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
