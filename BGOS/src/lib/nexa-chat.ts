import { createChatCompletionText } from "@/lib/openai";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const SYSTEM_PROMPT = `When the BDM sends 'start', greet them warmly and ask for the company name first. Do not say 'start' back to them.

You are NEXA, an intelligent AI onboarding assistant for BGOS.
Your job is to gather business information from a BDM who is onboarding a client.

Gather this information through natural conversation:
- Company name and type (service / manufacturing / trading)
- What products or services they offer
- Who their customers are
- How they get leads (WhatsApp, calls, referrals, social media etc)
- Their sales process from first contact to closing
- Team members (name, role, email for each person)
- Team size
- Any special requirements or challenges

Rules:
- Ask ONE question at a time
- Keep messages short and friendly
- If they skip something say "No problem, we can add that later"
- When you have enough to build a workspace (company name + at least one employee + basic sales info) say exactly:
  "I think I have everything I need to build your workspace. Ready to submit?"
- Never ask for information already given
- Sound like a smart colleague, not a form
- Respond in the same language the BDM uses (English or Malayalam)`;

export async function nexaChat(messages: ChatMessage[], newMessage: string): Promise<string> {
  const conversation = [...messages, { role: "user" as const, content: newMessage }];

  const response = await createChatCompletionText({
    system: SYSTEM_PROMPT,
    messages: conversation,
    maxTokens: 300,
  });

  return response || "Sorry, I didn't catch that. Can you say that again?";
}

export async function generateSummary(
  messages: { role: string; content: string }[],
  clientId: string,
): Promise<{ text: string; json: Record<string, unknown> }> {
  const conversation = messages
    .map((message) => `${message.role === "user" ? "BDM" : "NEXA"}: ${message.content}`)
    .join("\n");

  const raw = await createChatCompletionText({
    system: "Return only valid JSON. No markdown.",
    maxTokens: 1500,
    messages: [
      {
        role: "user",
        content: `Based on this onboarding conversation, extract all business information and generate a structured summary.

CONVERSATION:
${conversation}

Return a JSON object with this structure:
{
  "clientId": "${clientId}",
  "companyName": "",
  "businessType": "",
  "description": "",
  "products": [],
  "targetCustomers": [],
  "leadSources": [],
  "salesPipeline": [],
  "employees": [{ "name": "", "role": "", "email": "" }],
  "teamSize": "",
  "plan": "",
  "challenges": "",
  "futureNeeds": "",
  "summaryText": ""
}

Return ONLY valid JSON. No markdown.`,
      },
    ],
  });

  const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim()) as Record<string, unknown>;

  return {
    text: typeof parsed.summaryText === "string" ? parsed.summaryText : JSON.stringify(parsed, null, 2),
    json: parsed,
  };
}
