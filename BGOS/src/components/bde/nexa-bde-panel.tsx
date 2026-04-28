"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowUp, Bot, Trash2 } from "lucide-react";

import { NexaAvatar } from "@/components/nexa/nexa-avatar";

type PanelMessage = {
  id?: string;
  role: string;
  content: string;
};

type NexaBdePanelProps = {
  businessId: string;
  initialMessage?: string;
  variant?: "fixed" | "embedded";
};

const quickActions = [
  "Who should I call first today?",
  "How much will I earn this month?",
  "Which customer is at churn risk?",
];

function MessageBubble({ message }: { message: PanelMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[84%] rounded-2xl px-3 py-2 text-sm leading-5 ${
          isUser
            ? "rounded-tr-sm border border-[#22D9A0]/30 bg-[#22D9A0]/15 text-white"
            : "rounded-tl-sm border border-white/10 bg-[#13131c] text-[#F0EEF8]"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm border border-white/10 bg-[#13131c] px-4 py-3">
        <span className="nexa-bde-dot" />
        <span className="nexa-bde-dot delay-150" />
        <span className="nexa-bde-dot delay-300" />
      </div>
    </div>
  );
}

export function NexaBdePanel({
  businessId,
  initialMessage = "bde_commission_context",
  variant = "fixed",
}: NexaBdePanelProps) {
  const [messages, setMessages] = useState<PanelMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const didSendBriefing = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  async function sendMessage(message: string, visible = true) {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isTyping) return;

    if (visible) {
      setMessages((current) => [
        ...current,
        { role: "user", content: trimmedMessage },
      ]);
    }

    setIsTyping(true);
    const response = await fetch("/api/dashboard/nexa-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: trimmedMessage }),
    });
    setIsTyping(false);

    if (!response.ok) {
      setMessages((current) => [
        ...current,
        {
          role: "nexa",
          content: "I could not load your commission context. Try again in a moment.",
        },
      ]);
      return;
    }

    const data = (await response.json()) as { response: string };
    setMessages((current) => [
      ...current,
      { role: "nexa", content: data.response },
    ]);
  }

  useEffect(() => {
    async function loadHistory() {
      const response = await fetch("/api/nexa/history", { cache: "no-store" });
      if (response.ok) {
        const data = (await response.json()) as { messages: PanelMessage[] };
        setMessages(data.messages);
      }

      if (!didSendBriefing.current) {
        didSendBriefing.current = true;
        await sendMessage(initialMessage, false);
      }
    }

    if (businessId) void loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId, initialMessage]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!input.trim()) return;
    const message = input;
    setInput("");
    await sendMessage(message);
  }

  const panel = (
    <aside className="flex h-full flex-col bg-[#0e0e13] text-white">
      <header className="flex h-[60px] shrink-0 items-center gap-3 border-b border-white/10 px-4">
        <NexaAvatar size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-base font-bold">NEXA</h2>
            <span className="rounded-full border border-[#22D9A0]/30 bg-[#22D9A0]/10 px-2 py-0.5 text-[10px] font-bold text-[#22D9A0]">
              BDE coach
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
            <span className="relative flex h-2 w-2 rounded-full bg-[#22D9A0]">
              <span className="absolute inset-0 animate-ping rounded-full bg-[#22D9A0] opacity-70" />
            </span>
            Commission context live
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMessages([])}
          className="rounded-lg border border-white/10 p-2 text-zinc-500 transition hover:border-[#22D9A0]/40 hover:text-white"
          aria-label="Clear conversation"
          title="Clear conversation"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </header>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <MessageBubble
              key={message.id ?? `${message.role}-${index}-${message.content}`}
              message={message}
            />
          ))
        ) : (
          <p className="rounded-2xl border border-white/10 bg-[#13131c] px-4 py-3 text-sm text-zinc-400">
            NEXA is preparing your commission briefing.
          </p>
        )}
        {isTyping ? <TypingDots /> : null}
        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 border-t border-white/10 px-3 py-3">
        <div className="mb-3 flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <button
              key={action}
              type="button"
              onClick={() => void sendMessage(action)}
              disabled={isTyping}
              className="rounded-full border border-white/10 bg-[#13131c] px-3 py-1.5 text-[11px] text-zinc-400 transition hover:border-[#22D9A0]/40 hover:text-white disabled:opacity-50"
            >
              {action}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask NEXA about earnings..."
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#13131c] px-3 py-2 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-[#22D9A0] focus:ring-2 focus:ring-[#22D9A0]/20"
          />
          <button
            type="submit"
            disabled={isTyping || !input.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#22D9A0] text-black transition hover:bg-[#5ee0b0] disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Send message"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </form>
      </div>

      <style jsx>{`
        .nexa-bde-dot {
          width: 6px;
          height: 6px;
          border-radius: 9999px;
          background: #22d9a0;
          animation: nexaBdePulse 1s ease-in-out infinite;
        }

        .delay-150 {
          animation-delay: 0.15s;
        }

        .delay-300 {
          animation-delay: 0.3s;
        }

        @keyframes nexaBdePulse {
          0%,
          80%,
          100% {
            opacity: 0.35;
            transform: scale(0.85);
          }

          40% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </aside>
  );

  if (variant === "embedded") {
    return (
      <div className="h-[560px] overflow-hidden rounded-2xl border border-white/10 bg-[#0e0e13]">
        {panel}
      </div>
    );
  }

  return (
    <>
      <div className="fixed bottom-5 right-5 z-40 md:hidden">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#22D9A0] text-black shadow-2xl shadow-[#22D9A0]/30"
          aria-label="Open NEXA"
        >
          <Bot className="h-6 w-6" />
        </button>
      </div>

      <div className="fixed bottom-0 right-0 top-[60px] z-30 hidden w-[320px] border-l border-[rgba(255,255,255,0.07)] md:block">
        {panel}
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden">
          <button
            type="button"
            aria-label="Close NEXA"
            className="absolute inset-0"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 h-[80vh] overflow-hidden rounded-t-3xl border border-white/10">
            {panel}
          </div>
        </div>
      ) : null}
    </>
  );
}
