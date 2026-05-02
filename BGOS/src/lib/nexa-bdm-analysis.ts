import OpenAI from "openai";

import { prisma } from "@/lib/prisma";

type AnalysisPattern = {
  type?: "warning" | "tip" | "alert";
  title?: string;
  message?: string;
};

type AnalysisResult = {
  patterns?: AnalysisPattern[];
  topHooks?: string[];
  commonPains?: string[];
  noteQualityScore?: number;
  urgentAlerts?: string[];
  weekSummary?: string;
};

function companyLabel(lead: { company: string | null; name: string }) {
  return lead.company ?? lead.name;
}

function parseAnalysis(raw: string): AnalysisResult {
  return JSON.parse(raw.replace(/```json|```/g, "").trim()) as AnalysisResult;
}

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

export async function analyseNotes(userId: string): Promise<void> {
  const leads = await prisma.lead.findMany({
    where: { assignedTo: userId },
    include: {
      callNotes: {
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  if (leads.length === 0) return;

  const allNotes = leads.flatMap((lead) =>
    lead.callNotes.map((note) => ({
      company: companyLabel(lead),
      status: lead.bdmStatus,
      note: note.content,
      date: note.createdAt,
    })),
  );

  if (allNotes.length === 0) return;

  const openai = getOpenAIClient();
  if (!openai) {
    console.warn("NEXA BDM analysis skipped: OPENAI_API_KEY is not configured.");
    return;
  }

  const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const byType = {
    platform: leads.filter((lead) => lead.leadType === "PLATFORM"),
    management: leads.filter((lead) => lead.leadType === "MANAGEMENT"),
    self: leads.filter((lead) => lead.leadType === "SELF"),
  };
  const converted = {
    platform: byType.platform.filter((lead) => lead.status === "WON").length,
    management: byType.management.filter((lead) => lead.status === "WON").length,
    self: byType.self.filter((lead) => lead.status === "WON").length,
  };
  const rate = (won: number, total: number) =>
    total > 0 ? Math.round((won / total) * 1000) / 10 : 0;
  const leadStats = {
    platform: {
      total: byType.platform.length,
      converted: converted.platform,
      rate: rate(converted.platform, byType.platform.length),
    },
    management: {
      total: byType.management.length,
      converted: converted.management,
      rate: rate(converted.management, byType.management.length),
    },
    self: {
      total: byType.self.length,
      converted: converted.self,
      rate: rate(converted.self, byType.self.length),
    },
  };
  const coldLeads = leads.filter(
    (lead) =>
      lead.bdmStatus !== "LOST" &&
      lead.bdmStatus !== "ONBOARDING" &&
      lead.lastContactedAt &&
      new Date(lead.lastContactedAt) < twoDaysAgo,
  );

  const prompt = `You are NEXA, an AI sales coach. Analyse these call notes from a BDM and give intelligent coaching.

BDM's leads and notes:
${JSON.stringify(allNotes.slice(0, 30), null, 2)}

Cold leads (no contact 48+ hours): ${coldLeads.map(companyLabel).join(", ")}

LEAD TYPE PERFORMANCE:
Platform leads: ${leadStats.platform.total} total, ${leadStats.platform.converted} converted (${leadStats.platform.rate}%)
Management leads: ${leadStats.management.total} total, ${leadStats.management.converted} converted (${leadStats.management.rate}%)
Self-generated leads: ${leadStats.self.total} total, ${leadStats.self.converted} converted (${leadStats.self.rate}%)

Analyse the BDM's performance by lead type. Are they better at closing warm leads or cold leads? Are they generating enough self-leads? Give specific coaching advice based on these numbers.

Analyse and return a JSON object with exactly these fields:
{
  "patterns": [
    { "type": "warning|tip|alert", "title": "short title", "message": "detailed coaching message with specific examples from the notes" }
  ],
  "topHooks": ["The best performing opening lines found in the notes"],
  "commonPains": ["Most frequently mentioned pain points across all notes"],
  "noteQualityScore": 0-100,
  "urgentAlerts": ["Leads that need immediate action today"],
  "weekSummary": "2-3 sentence summary of this BDM's performance"
}

Be specific. Reference actual company names and exact phrases from the notes. Maximum 5 patterns. No generic advice.
Return only valid JSON. No other text.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.choices[0]?.message.content || "{}";
    const analysis = parseAnalysis(text);
    const patterns = analysis.patterns ?? [];
    const warnings = patterns.filter((pattern) => pattern.type === "warning");
    const tips = patterns.filter((pattern) => pattern.type === "tip");
    const alerts = patterns.filter((pattern) => pattern.type === "alert");
    const now = new Date();

    await prisma.nexaBDMAnalysis.upsert({
      where: { userId },
      create: {
        userId,
        weekStart: now,
        callsMade: leads.length,
        conversations: allNotes.length,
        noteQualityScore: analysis.noteQualityScore ?? 0,
        patterns,
        warnings,
        tips,
        urgentAlerts: analysis.urgentAlerts ?? alerts,
        topHooks: analysis.topHooks ?? [],
        commonPains: analysis.commonPains ?? [],
        platformLeads: leadStats.platform.total,
        managementLeads: leadStats.management.total,
        selfLeads: leadStats.self.total,
        platformConvRate: leadStats.platform.rate,
        managementConvRate: leadStats.management.rate,
        selfConvRate: leadStats.self.rate,
        lastAnalysedAt: now,
      },
      update: {
        weekStart: now,
        callsMade: leads.length,
        conversations: allNotes.length,
        noteQualityScore: analysis.noteQualityScore ?? 0,
        patterns,
        warnings,
        tips,
        urgentAlerts: analysis.urgentAlerts ?? alerts,
        topHooks: analysis.topHooks ?? [],
        commonPains: analysis.commonPains ?? [],
        platformLeads: leadStats.platform.total,
        managementLeads: leadStats.management.total,
        selfLeads: leadStats.self.total,
        platformConvRate: leadStats.platform.rate,
        managementConvRate: leadStats.management.rate,
        selfConvRate: leadStats.self.rate,
        lastAnalysedAt: now,
      },
    });
  } catch (error) {
    console.error("NEXA analysis error:", error);
  }
}

export async function checkColdLeads(userId: string) {
  const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

  return prisma.lead.findMany({
    where: {
      assignedTo: userId,
      bdmStatus: { notIn: ["LOST", "ONBOARDING"] },
      lastContactedAt: { lt: twoDaysAgo },
    },
    select: { id: true, name: true, company: true, lastContactedAt: true },
  });
}
