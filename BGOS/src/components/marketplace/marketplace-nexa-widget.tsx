"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Check, RotateCcw, Send, X } from "lucide-react";

type MarketplaceNexaWidgetProps = {
  agentSlug: string;
  agentName: string;
  agentColor: string;
};

type ChatMessage = {
  id: string;
  role: "nexa" | "user";
  content: string;
};

type CustomerType = "new" | "existing" | null;

type WidgetFields = {
  customerType: CustomerType;
  name: string;
  company: string;
  employeeCount: string;
  email: string;
  phone: string;
  bdmName: string;
};

type PersistedSession = {
  step: number;
  fields: WidgetFields;
  messages: ChatMessage[];
  complete: boolean;
  successMessage: string;
};

type QuickReply = {
  label: string;
  value: string;
};

declare global {
  interface Window {
    openMarketplaceWidget?: () => void;
  }
}

function id() {
  return Math.random().toString(36).slice(2);
}

function storageKey(agentSlug: string) {
  return `bgos:marketplace-nexa:${agentSlug}`;
}

function agentIcon(agentSlug: string, agentName: string) {
  if (agentSlug === "sales-booster") return "📈";
  if (agentSlug === "wazzup") return "💬";
  return agentName.trim().slice(0, 1).toUpperCase() || "N";
}

function initialFields(): WidgetFields {
  return {
    customerType: null,
    name: "",
    company: "",
    employeeCount: "",
    email: "",
    phone: "",
    bdmName: "",
  };
}

function loadSession(agentSlug: string): PersistedSession | null {
  if (typeof window === "undefined") return null;

  try {
    const saved = window.sessionStorage.getItem(storageKey(agentSlug));
    return saved ? (JSON.parse(saved) as PersistedSession) : null;
  } catch {
    return null;
  }
}

function saveSession(agentSlug: string, session: PersistedSession) {
  window.sessionStorage.setItem(storageKey(agentSlug), JSON.stringify(session));
}

function clearSession(agentSlug: string) {
  window.sessionStorage.removeItem(storageKey(agentSlug));
}

function nexaMessage(content: string): ChatMessage {
  return { id: id(), role: "nexa", content };
}

function userMessage(content: string): ChatMessage {
  return { id: id(), role: "user", content };
}

function newCustomerSuccess(agentSlug: string, agentName: string, name: string, phone: string, company: string) {
  if (agentSlug === "sales-booster") {
    return `Perfect ${name}! Sales Booster will connect all your leads from WhatsApp, Instagram and Facebook into one place. Our team will call you on ${phone} within 2 hours.`;
  }
  if (agentSlug === "wazzup") {
    return `Perfect ${name}! Wazzup will bring NEXA right into your WhatsApp. Our team will call you on ${phone} within 2 hours.`;
  }
  return `Perfect ${name}! Our team will call you on ${phone} within 2 hours to set up ${agentName} for ${company}.`;
}

function MessageBubble({
  message,
  typing,
  agentColor,
}: {
  message: ChatMessage;
  typing?: string;
  agentColor: string;
}) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm leading-5 ${
          isUser
            ? "rounded-tr-sm border border-white/10 bg-[#171720] text-white"
            : "rounded-tl-sm border border-white/10 bg-white/[0.05] text-zinc-100"
        }`}
        style={isUser ? { boxShadow: `inset 0 0 0 1px ${agentColor}33` } : undefined}
      >
        {typing ?? message.content}
      </div>
    </div>
  );
}

export function MarketplaceNexaWidget({
  agentSlug,
  agentName,
  agentColor,
}: MarketplaceNexaWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [fields, setFields] = useState<WidgetFields>(() => initialFields());
  const [step, setStep] = useState(0);
  const [input, setInput] = useState("");
  const [typingId, setTypingId] = useState<string | null>(null);
  const [typedText, setTypedText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [complete, setComplete] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [resumeSession, setResumeSession] = useState<PersistedSession | null>(null);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [hasOpenedConversation, setHasOpenedConversation] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const icon = useMemo(() => agentIcon(agentSlug, agentName), [agentName, agentSlug]);

  useEffect(() => {
    const saved = loadSession(agentSlug);
    setResumeSession(saved);
  }, [agentSlug]);

  useEffect(() => {
    window.openMarketplaceWidget = () => setIsOpen(true);
    return () => {
      delete window.openMarketplaceWidget;
    };
  }, []);

  useEffect(() => {
    if (!isOpen || hasOpenedConversation) return;

    if (resumeSession && resumeSession.messages.length > 0) {
      setMessages([
        nexaMessage(`Welcome back. Do you want to continue your ${agentName} request or start over?`),
      ]);
      setShowResumePrompt(true);
      setHasOpenedConversation(true);
      return;
    }

    const timer = window.setTimeout(() => {
      setMessages([
        nexaMessage(
          "Hi! I am NEXA 👋 Are you already using BGOS or is this your first time?",
        ),
      ]);
      setStep(0);
      setHasOpenedConversation(true);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [agentName, hasOpenedConversation, isOpen, resumeSession]);

  useEffect(() => {
    if (!hasOpenedConversation || showResumePrompt) return;

    saveSession(agentSlug, {
      step,
      fields,
      messages,
      complete,
      successMessage,
    });
  }, [agentSlug, complete, fields, hasOpenedConversation, messages, showResumePrompt, step, successMessage]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [isOpen, messages, typedText]);

  useEffect(() => {
    const last = messages[messages.length - 1];
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
    }, 25);

    return () => window.clearInterval(timer);
  }, [messages]);

  const quickReplies = useMemo<QuickReply[]>(() => {
    if (showResumePrompt) {
      return [
        { label: "Continue", value: "continue" },
        { label: "Start over", value: "start_over" },
      ];
    }
    if (step === 0) {
      return [
        { label: "I am a new customer", value: "new" },
        { label: "I already use BGOS", value: "existing" },
      ];
    }
    if (fields.customerType === "new" && step === 3) {
      return ["Just me", "2-5", "6-15", "15+"].map((value) => ({
        label: value,
        value,
      }));
    }
    return [];
  }, [fields.customerType, showResumePrompt, step]);

  function resetConversation() {
    clearSession(agentSlug);
    setMessages([
      nexaMessage(
        "Hi! I am NEXA 👋 Are you already using BGOS or is this your first time?",
      ),
    ]);
    setFields(initialFields());
    setStep(0);
    setInput("");
    setComplete(false);
    setSuccessMessage("");
    setShowResumePrompt(false);
    setResumeSession(null);
    setHasOpenedConversation(true);
  }

  function continueConversation() {
    if (!resumeSession) {
      resetConversation();
      return;
    }

    setStep(resumeSession.step);
    setFields(resumeSession.fields);
    setMessages(resumeSession.messages);
    setComplete(resumeSession.complete);
    setSuccessMessage(resumeSession.successMessage);
    setShowResumePrompt(false);
  }

  function closeWidget() {
    setIsOpen(false);
  }

  async function submitInterest(nextFields: WidgetFields, nextMessages: ChatMessage[]) {
    setSubmitting(true);
    const isExistingCustomer = nextFields.customerType === "existing";
    const companyName = isExistingCustomer
      ? "Existing BGOS customer"
      : nextFields.company;
    const name = isExistingCustomer
      ? nextFields.email.split("@")[0] || "BGOS customer"
      : nextFields.name;

    const response = await fetch("/api/marketplace/interest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email: nextFields.email,
        phone: nextFields.phone,
        companyName,
        employeeCount: nextFields.employeeCount,
        businessType: nextFields.company,
        agentSlug,
        agentName,
        isExistingCustomer,
      }),
    });
    const data = (await response.json().catch(() => ({}))) as {
      bdmName?: string;
      message?: string;
      error?: string;
    };
    setSubmitting(false);

    if (!response.ok) {
      setMessages([
        ...nextMessages,
        nexaMessage(data.error ?? "I could not notify the team right now. Please try again in a moment."),
      ]);
      return;
    }

    const finalFields = { ...nextFields, bdmName: data.bdmName ?? "our team" };
    setFields(finalFields);
    setSuccessMessage(
      isExistingCustomer
        ? "Your account manager has been notified. They will call you shortly."
        : `${finalFields.bdmName} will call ${finalFields.phone} within 2 hours`,
    );
    setComplete(true);
    setStep(isExistingCustomer ? 3 : 6);
    setMessages(nextMessages);
  }

  async function handleAnswer(value: string) {
    const answer = value.trim();
    if (!answer || typingId || submitting) return;

    if (showResumePrompt) {
      if (answer === "continue") continueConversation();
      if (answer === "start_over") resetConversation();
      return;
    }

    const nextFields = { ...fields };
    const nextMessages = [...messages, userMessage(answer)];
    let prompt = "";
    let nextStep = step;

    if (step === 0) {
      nextFields.customerType = answer === "existing" ? "existing" : "new";
      nextStep = 1;
      prompt =
        nextFields.customerType === "existing"
          ? "Welcome back! What is the email address you use to log into BGOS?"
          : `Great! I will get ${agentName} set up for you. What is your name?`;
    } else if (nextFields.customerType === "new") {
      if (step === 1) {
        nextFields.name = answer;
        nextStep = 2;
        prompt = `Hi ${answer}! What is your company name and what does your business do?`;
      } else if (step === 2) {
        nextFields.company = answer;
        nextStep = 3;
        prompt = "How many people are on your team?";
      } else if (step === 3) {
        nextFields.employeeCount = answer;
        nextStep = 4;
        prompt = `What is your WhatsApp number? Our team will call you within 2 hours to set up ${agentName} for your business.`;
      } else if (step === 4) {
        nextFields.phone = answer;
        nextStep = 5;
        prompt = "Last thing - your email address?";
      } else if (step === 5) {
        nextFields.email = answer.toLowerCase();
        nextStep = 6;
        const finalMessage = newCustomerSuccess(
          agentSlug,
          agentName,
          nextFields.name,
          nextFields.phone,
          nextFields.company,
        );
        const finalMessages = [...nextMessages, nexaMessage(finalMessage)];
        setInput("");
        setFields(nextFields);
        setStep(nextStep);
        setMessages(finalMessages);
        await submitInterest(nextFields, finalMessages);
        return;
      }
    } else if (nextFields.customerType === "existing") {
      if (step === 1) {
        nextFields.email = answer.toLowerCase();
        nextStep = 2;
        prompt = "Got it. What is your WhatsApp number so your account manager can call you?";
      } else if (step === 2) {
        nextFields.phone = answer;
        nextStep = 3;
        const finalMessages = [
          ...nextMessages,
          nexaMessage(
            `You are all set! Your account manager will call you within 2 hours to add ${agentName} to your workspace.`,
          ),
        ];
        setInput("");
        setFields(nextFields);
        setStep(nextStep);
        setMessages(finalMessages);
        await submitInterest(nextFields, finalMessages);
        return;
      }
    }

    setInput("");
    setFields(nextFields);
    setStep(nextStep);
    setMessages(prompt ? [...nextMessages, nexaMessage(prompt)] : nextMessages);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void handleAnswer(input);
  }

  function placeholder() {
    if (fields.customerType === "existing") {
      return step === 1 ? "you@company.com" : "WhatsApp number";
    }
    if (step === 1) return "Your name";
    if (step === 2) return "Company and business type";
    if (step === 4) return "WhatsApp number";
    if (step === 5) return "you@company.com";
    return "Type your answer...";
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-full px-5 py-3 text-sm font-extrabold text-black shadow-2xl transition hover:scale-105"
        style={{
          backgroundColor: agentColor,
          boxShadow: `0 0 28px ${agentColor}66`,
        }}
      >
        <span className="relative flex h-2.5 w-2.5 rounded-full bg-black">
          <span className="absolute inset-0 animate-ping rounded-full bg-black/60" />
        </span>
        Get {agentName} →
      </button>
    );
  }

  return (
    <section className="fixed bottom-5 right-5 z-50 flex h-[500px] w-[calc(100vw-32px)] max-w-[360px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d12] text-white shadow-2xl shadow-black/60">
      <header className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-extrabold text-black"
          style={{ backgroundColor: agentColor }}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-heading text-sm font-extrabold">{agentName}</h2>
          <p className="text-xs text-zinc-500">Get started</p>
        </div>
        <button
          type="button"
          onClick={resetConversation}
          className="rounded-lg border border-white/10 p-2 text-zinc-500 transition hover:text-white"
          aria-label="Start over"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={closeWidget}
          className="rounded-lg border border-white/10 p-2 text-zinc-500 transition hover:text-white"
          aria-label="Close marketplace chat"
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      {complete ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-8 text-center">
          <div className="relative">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-extrabold text-black"
              style={{ backgroundColor: agentColor }}
            >
              {icon}
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-7 w-7 animate-bounce items-center justify-center rounded-full bg-[#22D9A0] text-black">
              <Check className="h-4 w-4" />
            </span>
          </div>
          <h3 className="mt-6 font-heading text-xl font-extrabold text-white">
            {fields.customerType === "existing"
              ? "Your account manager has been notified."
              : "Our team will contact you shortly 🎉"}
          </h3>
          <p className="mt-3 text-sm leading-6 text-zinc-400">{successMessage}</p>
        </div>
      ) : (
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              typing={typingId === message.id ? typedText : undefined}
              agentColor={agentColor}
            />
          ))}
          {submitting ? (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-tl-sm border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-zinc-400">
                Notifying the team...
              </div>
            </div>
          ) : null}
          <div ref={bottomRef} />
        </div>
      )}

      {!complete ? (
        <div className="border-t border-white/10 px-3 py-3">
          {quickReplies.length > 0 ? (
            <div className="mb-3 flex flex-wrap gap-2">
              {quickReplies.map((reply) => (
                <button
                  key={reply.value}
                  type="button"
                  onClick={() => void handleAnswer(reply.value)}
                  disabled={Boolean(typingId) || submitting}
                  className="rounded-full px-3 py-2 text-xs font-extrabold text-black transition hover:brightness-110 disabled:opacity-50"
                  style={{ backgroundColor: agentColor }}
                >
                  {reply.label}
                </button>
              ))}
            </div>
          ) : null}
          {quickReplies.length === 0 ? (
            <form onSubmit={submit} className="flex items-center gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                disabled={Boolean(typingId) || submitting}
                placeholder={placeholder()}
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#171720] px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-600"
                style={{ borderColor: input ? `${agentColor}66` : undefined }}
              />
              <button
                type="submit"
                disabled={!input.trim() || Boolean(typingId) || submitting}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-black transition hover:brightness-110 disabled:opacity-50"
                style={{ backgroundColor: agentColor }}
                aria-label="Send answer"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
