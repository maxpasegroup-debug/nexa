import type {
  NexaConversationMessage,
  NexaConversationState,
  NexaMessageSource,
  NexaRole,
} from "./types";

const MAX_CONTEXT_MESSAGES = 20;

function createId(prefix: string) {
  if (globalThis.crypto?.randomUUID) {
    return `${prefix}_${globalThis.crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function createNexaMessage(
  role: NexaRole,
  content: string,
  source: NexaMessageSource = "local",
): NexaConversationMessage {
  return {
    id: createId("msg"),
    role,
    content,
    createdAt: new Date().toISOString(),
    source,
  };
}

export function createInitialNexaState(): NexaConversationState {
  const now = new Date().toISOString();

  return {
    conversationId: createId("nexa"),
    messages: [
      createNexaMessage(
        "assistant",
        "Hi Arun, I am Guardian Angel AI. I can help you choose the next calm, high-leverage career move.",
      ),
    ],
    memory: {},
    recommendations: [],
    updatedAt: now,
  };
}

export function appendNexaMessage(
  state: NexaConversationState,
  message: NexaConversationMessage,
): NexaConversationState {
  return {
    ...state,
    messages: trimConversation([...state.messages, message]),
    updatedAt: new Date().toISOString(),
  };
}

export function trimConversation(messages: NexaConversationMessage[]) {
  return messages.slice(-MAX_CONTEXT_MESSAGES);
}
