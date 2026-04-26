import OpenAI from "openai";

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

let client: OpenAI | null = null;

function getOpenAIClient() {
  client ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

export async function createChatCompletionText({
  system,
  messages,
  maxTokens,
}: {
  system: string;
  messages: ChatMessage[];
  maxTokens: number;
}) {
  const response = await getOpenAIClient().chat.completions.create({
    model: "gpt-4o",
    max_tokens: maxTokens,
    messages: [{ role: "system", content: system }, ...messages],
  });

  return response.choices[0]?.message?.content ?? "";
}
