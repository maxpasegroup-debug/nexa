export const career7NexaQuickActions = [
  "Suggest learning for me",
  "Find job opportunities",
  "Improve my resume",
  "Plan my next 7 days",
] as const;

export type Career7NexaQuickAction = (typeof career7NexaQuickActions)[number];

export type Career7NexaMessage = {
  role: "user" | "assistant";
  content: string;
};

type Career7NexaRequest = {
  userId: string;
  businessId: string;
  message: string;
  quickAction?: string;
  history?: Career7NexaMessage[];
};

type Career7NexaResponse = {
  message: string;
  chips: string[];
};

const placeholderResponses: Record<Career7NexaQuickAction, Career7NexaResponse> = {
  "Suggest learning for me": {
    message:
      "I would start with a focused communication track: 20 minutes of spoken English practice, one resume keyword review, and one interview answer drill today. Your next best learning move is small, consistent, and easy to finish.",
    chips: ["English practice", "Interview answers", "Skill map"],
  },
  "Find job opportunities": {
    message:
      "I found a placeholder path for you: target entry-level roles that mention communication, operations, support, or sales coordination. I would shortlist 5 roles, customize your headline, and apply before the end of the day.",
    chips: ["Remote roles", "Entry level", "Apply today"],
  },
  "Improve my resume": {
    message:
      "Let us make your resume sharper: lead with measurable outcomes, keep each bullet under two lines, and mirror the keywords from the role you want. Send me one section and I will help tighten it.",
    chips: ["Rewrite summary", "Fix bullets", "ATS keywords"],
  },
  "Plan my next 7 days": {
    message:
      "Here is a placeholder 7-day rhythm: 3 learning sessions, 2 resume upgrades, 10 job applications, and one mock interview. I would keep each day under 60 minutes so you can actually sustain it.",
    chips: ["Daily plan", "Mock interview", "Application goal"],
  },
};

function genericPlaceholder(message: string): Career7NexaResponse {
  return {
    message: `I am with you. For now I am using placeholder guidance, but the future AI backend can plug in here. Based on "${message}", I would turn this into one clear next action and one small practice task for today.`,
    chips: ["Next action", "Practice task", "Review progress"],
  };
}

export async function getCareer7NexaReply({
  message,
  quickAction,
}: Career7NexaRequest): Promise<Career7NexaResponse> {
  const action = career7NexaQuickActions.find((item) => item === quickAction);

  if (action) {
    return placeholderResponses[action];
  }

  return genericPlaceholder(message);
}
