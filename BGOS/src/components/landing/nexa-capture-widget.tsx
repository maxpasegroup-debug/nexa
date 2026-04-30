"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Send, X } from "lucide-react";

import { NexaAvatar } from "@/components/nexa/nexa-avatar";

type ChatMessage = {
  id: string;
  role: "nexa" | "user";
  content: string;
};

type CaptureState = {
  open: boolean;
  interacted: boolean;
  step: number;
  messages: ChatMessage[];
  fields: {
    name: string;
    company: string;
    employeeCount: string;
    challenge: string;
    email: string;
    phone: string;
    bdmName: string;
  };
  sessionToken: string;
  complete: boolean;
};

const STORAGE_KEY = "bgos:nexa-capture-widget";
const quickReplies: Record<number, string[]> = {
  2: ["Just me", "2-5", "6-15", "16-50", "50+"],
  3: [
    "Managing leads",
    "Team coordination",
    "Customer follow-up",
    "All of the above",
  ],
};

type NexaWidgetWindow = Window &
  typeof globalThis & {
    openNexaWidget?: () => void;
  };

function id() {
  return Math.random().toString(36).slice(2);
}

function newSessionToken() {
  return `nexa_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function initialMessage(): ChatMessage {
  return {
    id: id(),
    role: "nexa",
    content:
      "Hi! I am NEXA 👋 I help Indian businesses run on autopilot. What is your name?",
  };
}

function initialState(): CaptureState {
  return {
    open: false,
    interacted: false,
    step: 0,
    messages: [initialMessage()],
    fields: {
      name: "",
      company: "",
      employeeCount: "",
      challenge: "",
      email: "",
      phone: "",
      bdmName: "",
    },
    sessionToken: newSessionToken(),
    complete: false,
  };
}

function loadState(): CaptureState {
  if (typeof window === "undefined") return initialState();

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return initialState();
    return { ...initialState(), ...(JSON.parse(saved) as Partial<CaptureState>) };
  } catch {
    return initialState();
  }
}

function nextPrompt(step: number, fields: CaptureState["fields"]) {
  if (step === 1) {
    return `Great ${fields.name}! What is your company name and what does your business do?`;
  }
  if (step === 2) return "How many people are on your team?";
  if (step === 3) {
    return "What is your biggest challenge right now - leads, team management, or operations?";
  }
  if (step === 4) {
    return `What is your email address? We will send you a summary of what BGOS can do for ${fields.company}.`;
  }
  if (step === 5) {
    return `Perfect. Last thing - what is your WhatsApp number? Our Business Manager will call you within 2 hours to show you how BGOS can help ${fields.company} specifically.`;
  }
  return "";
}

function MessageBubble({
  message,
  typing,
}: {
  message: ChatMessage;
  typing?: string;
}) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm leading-5 ${
          isUser
            ? "rounded-tr-sm bg-[#22D9A0] text-black"
            : "rounded-tl-sm border border-white/10 bg-white/[0.04] text-zinc-100"
        }`}
      >
        {typing ?? message.content}
      </div>
    </div>
  );
}

export function NexaCaptureWidget() {
  const [state, setState] = useState<CaptureState>(() => initialState());
  const [input, setInput] = useState("");
  const [typingId, setTypingId] = useState<string | null>(null);
  const [typedText, setTypedText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setState(loadState());
  }, []);

  useEffect(() => {
    const nexaWindow = window as NexaWidgetWindow;
    nexaWindow.openNexaWidget = () =>
      setState((current) => ({ ...current, open: true, interacted: true }));
    return () => {
      delete nexaWindow.openNexaWidget;
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (state.interacted || state.open) return;
    const timer = window.setTimeout(() => {
      setState((current) => ({ ...current, open: true, interacted: true }));
    }, 30_000);
    return () => window.clearTimeout(timer);
  }, [state.interacted, state.open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messages, typedText, state.open]);

  useEffect(() => {
    const last = state.messages[state.messages.length - 1];
    if (!last || last.role !== "nexa") return;

    setTypingId(last.id);
    setTypedText("");
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTypedText(last.content.slice(0, index));
      if (index >= last.content.length) {
        window.clearInterval(timer);
        setTypingId(null);
      }
    }, 30);

    return () => window.clearInterval(timer);
  }, [state.messages]);

  const activeQuickReplies = useMemo(
    () => quickReplies[state.step] ?? [],
    [state.step],
  );

  function openWidget() {
    setState((current) => ({ ...current, open: true, interacted: true }));
  }

  function closeWidget() {
    setState((current) => ({ ...current, open: false, interacted: true }));
  }

  async function finish(nextFields: CaptureState["fields"]) {
    setSubmitting(true);
    const response = await fetch("/api/onboarding/landing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: nextFields.name,
        email: nextFields.email,
        phone: nextFields.phone,
        companyName: nextFields.company,
        employeeCount: nextFields.employeeCount,
        businessType: nextFields.company,
        challenge: nextFields.challenge,
        sessionToken: state.sessionToken,
      }),
    });
    setSubmitting(false);

    const data = (await response.json().catch(() => ({}))) as {
      bdmName?: string;
    };
    const bdmName = data.bdmName ?? "our Business Manager";
    const successMessage = response.ok
      ? `Thank you ${nextFields.name}! 🎉 I have notified our team. ${bdmName} will call you on ${nextFields.phone} within 2 hours. Check your email ${nextFields.email} for a confirmation.`
      : "I could not notify the team right now. Please try again in a moment.";

    setState((current) => ({
      ...current,
      step: response.ok ? 6 : current.step,
      complete: response.ok,
      fields: { ...nextFields, bdmName },
      messages: [
        ...current.messages,
        { id: id(), role: "nexa", content: successMessage },
      ],
    }));
  }

  async function handleAnswer(value: string) {
    const answer = value.trim();
    if (!answer || typingId || submitting) return;

    const nextStep = state.step + 1;
    const nextFields = { ...state.fields };
    if (state.step === 0) nextFields.name = answer;
    if (state.step === 1) nextFields.company = answer;
    if (state.step === 2) nextFields.employeeCount = answer;
    if (state.step === 3) nextFields.challenge = answer;
    if (state.step === 4) nextFields.email = answer.toLowerCase();
    if (state.step === 5) nextFields.phone = answer;

    const userMessage: ChatMessage = { id: id(), role: "user", content: answer };
    const nextMessages = [...state.messages, userMessage];

    setInput("");

    if (state.step === 5) {
      setState((current) => ({
        ...current,
        fields: nextFields,
        messages: nextMessages,
        interacted: true,
      }));
      await finish(nextFields);
      return;
    }

    const prompt = nextPrompt(nextStep, nextFields);
    setState((current) => ({
      ...current,
      step: nextStep,
      fields: nextFields,
      interacted: true,
      messages: [
        ...nextMessages,
        { id: id(), role: "nexa", content: prompt },
      ],
    }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void handleAnswer(input);
  }

  if (!state.open) {
    return (
      <button
        type="button"
        onClick={openWidget}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-full bg-[#22D9A0] px-5 py-3 text-sm font-bold text-black shadow-2xl shadow-[#22D9A0]/30 transition hover:scale-105"
      >
        <span className="relative flex h-2.5 w-2.5 rounded-full bg-black">
          <span className="absolute inset-0 animate-ping rounded-full bg-black/60" />
        </span>
        Chat with NEXA
      </button>
    );
  }

  return (
    <section className="fixed bottom-5 right-5 z-50 flex h-[480px] w-[calc(100vw-32px)] max-w-[360px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0f0f14] text-white shadow-2xl shadow-black/50">
      <header className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
        <NexaAvatar size="sm" />
        <div className="min-w-0 flex-1">
          <h2 className="font-heading text-sm font-bold">NEXA</h2>
          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-500">
            <span className="h-2 w-2 rounded-full bg-[#22D9A0]" />
            Online
          </div>
        </div>
        <button
          type="button"
          onClick={closeWidget}
          className="rounded-lg border border-white/10 p-2 text-zinc-500 transition hover:text-white"
          aria-label="Close NEXA chat"
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      {state.complete ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-8 text-center">
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle cx="24" cy="24" r="24" fill="#22D9A0" fillOpacity="0.16" />
            <path
              d="M15 24.5L21.2 30.5L33.5 17.5"
              stroke="#22D9A0"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h3 className="mt-5 font-heading text-[18px] font-bold text-white">
            Thank you, {state.fields.name}! 🎉
          </h3>
          <p className="mt-3 text-sm font-normal text-zinc-500">
            Our team will contact you shortly.
          </p>
          <p className="mt-4 font-heading text-sm font-bold text-[#22D9A0]">
            {state.fields.company}
          </p>
          <p className="mt-3 text-xs font-light text-zinc-500">
            We typically respond within 2 hours during business hours.
          </p>
        </div>
      ) : (
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {state.messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              typing={typingId === message.id ? typedText : undefined}
            />
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      {!state.complete ? (
        <div className="border-t border-white/10 px-3 py-3">
          {activeQuickReplies.length > 0 ? (
            <div className="mb-3 flex flex-wrap gap-2">
              {activeQuickReplies.map((reply) => (
                <button
                  key={reply}
                  type="button"
                  onClick={() => void handleAnswer(reply)}
                  disabled={Boolean(typingId) || submitting}
                  className="rounded-full border border-[#22D9A0]/30 bg-[#22D9A0]/10 px-3 py-1.5 text-xs font-bold text-[#22D9A0] transition hover:bg-[#22D9A0]/20 disabled:opacity-50"
                >
                  {reply}
                </button>
              ))}
            </div>
          ) : null}
          <form onSubmit={submit} className="flex items-center gap-2">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              disabled={Boolean(typingId) || submitting}
              placeholder={
                state.step === 4
                  ? "you@company.com"
                  : state.step === 5
                    ? "WhatsApp number"
                    : "Type your answer..."
              }
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#171720] px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[#22D9A0]"
            />
            <button
              type="submit"
              disabled={!input.trim() || Boolean(typingId) || submitting}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#22D9A0] text-black transition hover:bg-[#5ee0b0] disabled:opacity-50"
              aria-label="Send answer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      ) : null}
    </section>
  );
}
