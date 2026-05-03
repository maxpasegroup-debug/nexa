import OpenAI from "openai";

export const AGENT_QUESTIONS: Record<string, string[]> = {
  "sales-booster": [
    "WhatsApp Business number to connect?",
    "Instagram business account username?",
    "Facebook Page name or URL?",
    "Email address to aggregate leads from?",
    "Do you use SMS marketing? If yes, which provider?",
    "What is your typical auto-reply message when a new lead contacts you?",
  ],
  wazzup: [
    "WhatsApp number to connect NEXA to?",
    "Should NEXA respond to customer messages automatically or just notify the owner?",
    "What language should NEXA use in WhatsApp — English, Malayalam, or Hindi?",
    "What is the business owner's name so NEXA addresses them correctly?",
  ],
  taxmate: [
    "GST registration number?",
    "Business PAN number?",
    "Which accounting software are you using — Tally, Busy, or none?",
    "What are your main GST filing due dates?",
  ],
  sitesync: [
    "How many active projects are running currently?",
    "What types of projects — residential, commercial, or solar?",
    "Who are the main contractors you work with regularly?",
    "What is the typical project duration from start to handover?",
  ],
  careloop: [
    "How many doctors or practitioners are in the clinic?",
    "What is the average number of appointments per day?",
    "Do you want appointment reminders sent via WhatsApp, SMS, or both?",
    "What speciality is the clinic — general, dental, Ayurveda, or other?",
  ],
  peopledesk: [
    "How many employees total?",
    "Do you track attendance via biometric or manual?",
    "What is your salary cycle — monthly on which date?",
    "Do you need payslip generation or just tracking?",
  ],
  eduflow: [
    "How many active students currently?",
    "How many batches are running?",
    "What is the fee collection cycle — monthly, quarterly, annual?",
    "Do you want to send progress reports to parents via WhatsApp?",
  ],
  classmate: [
    "How many students in the school?",
    "How many classes and sections?",
    "Do you want homework tracking per subject?",
    "What is the school's academic year start month?",
  ],
  proppilot: [
    "How many active property listings currently?",
    "Do you work with brokers? If yes how many in your network?",
    "What types of properties — residential, commercial, or plots?",
    "What is your typical sales cycle duration?",
  ],
  stocksense: [
    "How many dealers or distributors in your network?",
    "What product categories do you distribute?",
    "What is your order processing cycle — daily, weekly?",
    "Do you want low stock alerts automatically?",
  ],
};

function asRecord(value: unknown): Record<string, string> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? Object.fromEntries(
        Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
      )
    : {};
}

function fallbackKey(question: string, index: number) {
  return (
    question
      .replace(/[—?]/g, "")
      .split(" ")
      .slice(0, 5)
      .join("_")
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "") || `answer_${index + 1}`
  );
}

export function firstAgentQuestion(agentSlug: string) {
  return AGENT_QUESTIONS[agentSlug]?.[0] ?? "What should NEXA connect for this agent?";
}

export async function generateAgentNexaResponse(
  agentSlug: string,
  sessionData: unknown,
  userMessage: string,
  questionIndex: number,
): Promise<{
  response: string;
  nextQuestionIndex: number;
  extractedData: Record<string, string>;
  isComplete: boolean;
}> {
  const questions = AGENT_QUESTIONS[agentSlug] || [];
  const currentQuestion = questions[questionIndex] ?? questions[0] ?? "What should NEXA connect?";
  const isLastQuestion = questionIndex >= questions.length - 1;

  if (!process.env.OPENAI_API_KEY) {
    return {
      response: isLastQuestion
        ? "Got it. I have the setup details and I am ready to move this to payment."
        : `Got it. ${questions[questionIndex + 1]}`,
      nextQuestionIndex: isLastQuestion ? questionIndex : questionIndex + 1,
      extractedData: { [fallbackKey(currentQuestion, questionIndex)]: userMessage },
      isComplete: isLastQuestion,
    };
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const prompt = `You are NEXA, collecting integration requirements for the ${agentSlug} agent.

You have asked ${questionIndex + 1} of ${questions.length} questions.
Current question was: "${currentQuestion}"
User's answer: "${userMessage}"

Collected so far: ${JSON.stringify(sessionData)}

${
  isLastQuestion
    ? "This was the last question. Acknowledge the answer, confirm all collected data in a brief summary, and say you are ready to set this up."
    : `Next question to ask: "${questions[questionIndex + 1]}"`
}

Rules:
1. Acknowledge what they just told you warmly
2. If the answer is unclear or missing key info — ask for clarification before moving on
3. Keep responses under 60 words
4. Sound like a helpful consultant — not a form

Return JSON only:
{
  "response": "your message",
  "extractedData": { "key": "value from their answer" },
  "isComplete": ${isLastQuestion},
  "askNextQuestion": true
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    });

    const text = completion.choices[0]?.message.content || "{}";
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim()) as {
      response?: string;
      extractedData?: unknown;
      isComplete?: boolean;
      askNextQuestion?: boolean;
    };
    const shouldAdvance = parsed.askNextQuestion !== false;

    return {
      response: parsed.response || "Got it. Could you share a little more detail?",
      nextQuestionIndex: isLastQuestion || !shouldAdvance ? questionIndex : questionIndex + 1,
      extractedData: asRecord(parsed.extractedData),
      isComplete: isLastQuestion && parsed.isComplete === true,
    };
  } catch (error) {
    console.error("[nexa-agent-session]", error);
    return {
      response: "I had a brief issue reading that. Could you repeat the answer once?",
      nextQuestionIndex: questionIndex,
      extractedData: {},
      isComplete: false,
    };
  }
}
