"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, Send } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
};

type AgentSessionView = {
  id: string;
  agentSlug: string;
  questionIndex: number;
  isComplete: boolean;
  messages: Message[];
  business: { id: string; name: string };
  agent: {
    name: string;
    icon: string;
    colorPrimary: string;
    colorSecondary: string;
    onboardingFee: number;
    monthlyFee: number;
  };
  bossName: string;
  questionCount: number;
};

type ChatResponse = {
  response?: string;
  questionIndex?: number;
  isComplete?: boolean;
  readyForPayment?: boolean;
  error?: string;
};

type PaymentResponse = {
  paymentUrl?: string | null;
  total?: number;
  error?: string;
};

function totalWithGst(agent: AgentSessionView["agent"]) {
  return Math.round((agent.onboardingFee + agent.monthlyFee) * 1.18);
}

function money(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

export function AgentOnboardingSession({ session }: { session: AgentSessionView }) {
  const [messages, setMessages] = useState<Message[]>(session.messages);
  const [input, setInput] = useState("");
  const [questionIndex, setQuestionIndex] = useState(session.questionIndex);
  const [complete, setComplete] = useState(session.isComplete);
  const [loading, setLoading] = useState<"chat" | "payment" | "">("");
  const [error, setError] = useState("");
  const [paymentUrl, setPaymentUrl] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const total = totalWithGst(session.agent);
  const visibleQuestion = Math.min(questionIndex + 1, session.questionCount);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, complete]);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!text || loading || complete) return;

    setInput("");
    setError("");
    setLoading("chat");
    setMessages((current) => [...current, { role: "user", content: text }]);

    const response = await fetch(`/api/onboarding/agent-session/${session.id}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });
    const data = (await response.json().catch(() => ({}))) as ChatResponse;
    setLoading("");

    if (!response.ok || !data.response) {
      setError(data.error ?? "NEXA could not process that answer.");
      return;
    }

    setMessages((current) => [...current, { role: "assistant", content: data.response || "" }]);
    setQuestionIndex(data.questionIndex ?? questionIndex);
    setComplete(Boolean(data.isComplete || data.readyForPayment));
  }

  async function sendPaymentLink() {
    setError("");
    setLoading("payment");
    const response = await fetch("/api/marketplace/install/send-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessId: session.business.id,
        agentSlug: session.agentSlug,
        sessionId: session.id,
      }),
    });
    const data = (await response.json().catch(() => ({}))) as PaymentResponse;
    setLoading("");

    if (!response.ok) {
      setError(data.error ?? "Could not send payment link.");
      return;
    }

    setPaymentUrl(data.paymentUrl ?? "");
  }

  return (
    <div className="flex h-screen flex-col bg-[#070709] text-white">
      <header className="border-b border-white/10 bg-[#0d0d12] px-4 py-4 lg:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
              style={{
                background: `linear-gradient(135deg, ${session.agent.colorPrimary}33, ${session.agent.colorSecondary}22)`,
                border: `1px solid ${session.agent.colorPrimary}55`,
              }}
            >
              {session.agent.icon}
            </div>
            <div>
              <h1 className="font-heading text-xl font-bold">{session.agent.name}</h1>
              <p className="mt-1 text-sm text-zinc-500">Integration session · {session.business.name}</p>
            </div>
          </div>
          <div className="min-w-[160px]">
            <p className="text-right text-xs font-bold text-zinc-400">
              Question {visibleQuestion} of {session.questionCount}
            </p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (visibleQuestion / session.questionCount) * 100)}%`,
                  background: session.agent.colorPrimary,
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {error ? <div className="border-b border-red-500/20 bg-red-500/10 px-6 py-3 text-sm text-red-100">{error}</div> : null}

      <main className="mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col">
        <section className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-5 lg:px-6">
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[82%] ${message.role === "assistant" ? "flex gap-3" : ""}`}>
                {message.role === "assistant" ? (
                  <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#7C6FFF] text-sm">
                    N
                  </div>
                ) : null}
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
                    message.role === "assistant" ? "bg-[#13131c] text-zinc-100" : "bg-[#22D9A0] text-black"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            </div>
          ))}
          {loading === "chat" ? (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-[#13131c] px-4 py-3 text-sm text-zinc-300">NEXA is thinking...</div>
            </div>
          ) : null}

          {complete ? (
            <section className="rounded-2xl border border-[#22D9A0]/30 bg-[#22D9A0]/10 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#22D9A0] text-black">
                  <Check className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-heading text-lg font-bold text-white">
                    All set! NEXA has collected everything needed to set up {session.agent.name}.
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-zinc-300">
                    Next step: Send payment link to {session.bossName}. They pay {money(total)} (setup + first month + GST) and we start the integration.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => void sendPaymentLink()}
                      disabled={loading === "payment" || Boolean(paymentUrl)}
                      className="rounded-xl bg-[#22D9A0] px-5 py-3 text-sm font-extrabold text-black disabled:opacity-60"
                    >
                      {paymentUrl ? "Payment link sent" : loading === "payment" ? "Sending..." : "Send payment link →"}
                    </button>
                    {paymentUrl ? (
                      <a href={paymentUrl} target="_blank" rel="noreferrer" className="rounded-xl border border-white/10 px-5 py-3 text-sm font-bold text-zinc-200">
                        Open link
                      </a>
                    ) : null}
                    <Link href="/bdm/leads" className="rounded-xl border border-white/10 px-5 py-3 text-sm font-bold text-zinc-300">
                      Back to leads
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          ) : null}
          <div ref={scrollRef} />
        </section>

        <form onSubmit={(event) => void sendMessage(event)} className="border-t border-white/10 p-4">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              disabled={complete}
              placeholder={complete ? "Session complete" : "Type the customer's answer..."}
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#13131c] px-4 py-3 text-sm outline-none focus:border-[#22D9A0] disabled:opacity-50"
            />
            <button type="submit" disabled={loading === "chat" || complete} className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#22D9A0] text-black disabled:opacity-50">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
