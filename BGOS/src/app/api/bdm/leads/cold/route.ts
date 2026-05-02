import { NextResponse } from "next/server";

import { getBdmContext } from "@/lib/bdm/server";
import { checkColdLeads } from "@/lib/nexa-bdm-analysis";

export const dynamic = "force-dynamic";

function daysSince(value?: Date | null) {
  if (!value) return null;
  return Math.floor((Date.now() - value.getTime()) / (24 * 60 * 60 * 1000));
}

export async function GET() {
  try {
    const context = await getBdmContext();
    if (context.error) return context.error;

    const leads = await checkColdLeads(context.user.id);

    return NextResponse.json({
      leads: leads.map((lead) => ({
        ...lead,
        companyName: lead.company ?? lead.name,
        daysSinceContact: daysSince(lead.lastContactedAt),
      })),
    });
  } catch (error) {
    console.error("[bdm-leads:cold]", error);
    return NextResponse.json({ error: "Unable to fetch cold leads." }, { status: 500 });
  }
}
