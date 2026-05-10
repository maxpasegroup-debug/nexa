export type NexaRole = "user" | "assistant" | "system";

export type NexaMessageSource = "local" | "bgos";

export type NexaConversationMessage = {
  id: string;
  role: NexaRole;
  content: string;
  createdAt: string;
  source?: NexaMessageSource;
};

export type NexaMemorySnapshot = {
  profile?: Record<string, unknown>;
  goals?: string[];
  preferences?: Record<string, unknown>;
  signals?: Record<string, unknown>;
  updatedAt?: string;
};

export type NexaRecommendation = {
  id: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  confidence?: number;
  source: "placeholder" | "bgos";
};

export type NexaConversationState = {
  conversationId: string;
  messages: NexaConversationMessage[];
  memory: NexaMemorySnapshot;
  recommendations: NexaRecommendation[];
  updatedAt: string;
};

export type NexaChatRequestInput = {
  message: string;
  quickAction?: string;
  state: NexaConversationState;
};

export type NexaChatResult = {
  state: NexaConversationState;
  reply: NexaConversationMessage;
  recommendations: NexaRecommendation[];
  chips: string[];
  usedFallback: boolean;
};

export type NexaPlaceholderResponse = {
  message: string;
  chips: string[];
  recommendations: NexaRecommendation[];
};
