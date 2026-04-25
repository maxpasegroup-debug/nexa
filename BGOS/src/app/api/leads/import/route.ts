import { NextResponse } from "next/server";

import { getCrmContext, isLeadSource, scoreLead } from "@/lib/leads/server";
import { prisma } from "@/lib/prisma";

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"' && nextChar === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

export async function POST(request: Request) {
  try {
    const context = await getCrmContext();

    if (context.error) return context.error;

    const { csvData } = await request.json();

    if (typeof csvData !== "string") {
      return NextResponse.json(
        { error: "csvData is required." },
        { status: 400 },
      );
    }

    const rows = csvData
      .split(/\r?\n/)
      .map((row) => row.trim())
      .filter(Boolean)
      .slice(1);
    const leads = [];
    let failed = 0;

    for (const row of rows) {
      try {
        const [name, phone, email, company, source, value, notes] =
          parseCsvLine(row);

        if (!name) {
          failed += 1;
          continue;
        }

        const lead = await prisma.lead.create({
          data: {
            name,
            phone: phone || undefined,
            email: email ? email.toLowerCase() : undefined,
            company: company || undefined,
            source: isLeadSource(source) ? source : "MANUAL",
            value: Number(value || 0) || 0,
            notes: notes || undefined,
            businessId: context.businessId,
          },
        });

        leads.push(lead);
        void scoreLead(lead.id).catch(() => undefined);
      } catch {
        failed += 1;
      }
    }

    return NextResponse.json({
      imported: leads.length,
      failed,
      leads,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to import leads." },
      { status: 500 },
    );
  }
}
