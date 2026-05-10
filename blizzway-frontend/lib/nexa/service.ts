import { BlizzwayApi } from "@/lib/api";
import type { BlizzwayNexaMessage, BlizzwayNexaRecommendation } from "@/lib/api";
import { appendNexaMessage, createNexaMessage, trimConversation } from "./conversation";
import { getPlaceholderNexaResponse } from "./placeholder";
import type {
  NexaChatRequestInput,
  NexaChatResult,
  NexaConversationMessage,
  NexaRecommendation,
} from "./types";

function toApiHistory(messages: NexaConversationMessage[]): BlizzwayNexaMessage[] {
  return trimConversation(messages)
    .filter((message) => message.role === "user" || message.role === "assistant")
    .map((message) => ({
      role: message.role === "user" ? "user" : "assistant",
      content: message.content,
    }));
}

function toRecommendation(recommendation: BlizzwayNexaRecommendation): NexaRecommendation {
  return {
    id: recommendation.id,
    title: recommendation.title,
    description: recommendation.description,
    actionLabel: recommendation.actionLabel,
    actionHref: recommendation.actionHref,
    confidence: recommendation.confidence,
    source: recommendation.source ?? "bgos",
  };
}

export async function sendNexaChatRequest({
  message,
  quickAction,
  state,
}: NexaChatRequestInput): Promise<NexaChatResult> {
  const userMessage = createNexaMessage("user", message);
  const stateWithUserMessage = appendNexaMessage(state, userMessage);

  try {
    const response = await BlizzwayApi.askNexa({
      message,
      quickAction,
      conversationId: state.conversationId,
      history: toApiHistory(stateWithUserMessage.messages),
      memory: state.memory,
      recommendations: state.recommendations,
    });
    const apiRecommendations = response.recommendations?.map(toRecommendation) ?? [];
    const reply = createNexaMessage("assistant", response.message, "bgos");

    return {
      reply,
      chips: response.chips ?? [],
      recommendations: apiRecommendations,
      state: {
        ...appendNexaMessage(stateWithUserMessage, reply),
        conversationId: response.conversationId ?? state.conversationId,
        memory: response.memory ?? state.memory,
        recommendations: apiRecommendations,
      },
      usedFallback: false,
    };
  } catch {
    const fallback = getPlaceholderNexaResponse(message, quickAction);
    const reply = createNexaMessage("assistant", fallback.message);

    return {
      reply,
      chips: fallback.chips,
      recommendations: fallback.recommendations,
      state: {
        ...appendNexaMessage(stateWithUserMessage, reply),
        recommendations: fallback.recommendations,
      },
      usedFallback: true,
    };
  }
}
