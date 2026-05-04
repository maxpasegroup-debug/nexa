"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, Check, Send, X } from "lucide-react";

type ChatMessage = { id: string; role: "nexa" | "user"; content: string };

type Fields = {
  name: string;
  company: string;
  teamSize: string;
  challenge: string;
  email: string;
  phone: string;
  bdmName: string;
};

declare global {
  interface Window {
    openMobileNexaChat?: () => void;
  }
}

const id = () => Math.random().toString(36).slice(2);
const sessionToken = () => `mobile_nexa_${Date.now()}_${Math.random().toString(36).slice(2)}`;
const initialFields = (): Fields => ({
  name: "",
  company: "",
  teamSize: "",
  challenge: "",
  email: "",
  phone: "",
  bdmName: "",
});

const proofCards = [
  { label: "Leads", value: "Auto follow-up", tone: "text-[#7C6FFF]" },
  { label: "Team", value: "Role dashboards", tone: "text-[#22D9A0]" },
  { label: "Pipeline", value: "Built for you", tone: "text-[#06B6D4]" },
  { label: "NEXA", value: "CEO brief daily", tone: "text-[#F5A623]" },
];

const quickActions = [
  { label: "Pipeline", href: "/marketplace" },
  { label: "Pricing", href: "/pricing" },
  { label: "Login", href: "/login" },
];

function nextPrompt(step: number, fields: Fields) {
  if (step === 1) return `Good to meet you, ${fields.name}. What is your company name?`;
  if (step === 2) return "How many people are on your team?";
  if (step === 3) return "What should NEXA fix first: leads, team, follow-ups, or operations?";
  if (step === 4) return "Where should we send your BGOS setup summary?";
  if (step === 5) return "Last step. What is your WhatsApp number?";
  return "";
}

function MobileLeadCapture({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: id(), role: "nexa", content: "Hi, I am NEXA. What is your name?" },
  ]);
  const [fields, setFields] = useState<Fields>(() => initialFields());
  const [step, setStep] = useState(0);
  const [input, setInput] = useState("");
  const [token] = useState(() => sessionToken());
  const [submitting, setSubmitting] = useState(false);
  const [complete, setComplete] = useState(false);

  async function finish(nextFields: Fields, currentMessages: ChatMessage[]) {
    setSubmitting(true);
    const response = await fetch("/api/onboarding/landing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: nextFields.name,
        companyName: nextFields.company,
        employeeCount: nextFields.teamSize,
        challenge: nextFields.challenge,
        email: nextFields.email,
        phone: nextFields.phone,
        sessionToken: token,
      }),
    });
    const data = (await response.json().catch(() => ({}))) as { bdmName?: string };
    setSubmitting(false);

    if (!response.ok) {
      setMessages([
        ...currentMessages,
        { id: id(), role: "nexa", content: "I could not notify the BGOS team right now. Please try again." },
      ]);
      return;
    }

    setFields({ ...nextFields, bdmName: data.bdmName ?? "our Business Manager" });
    setComplete(true);
  }

  async function answer(value: string) {
    const text = value.trim();
    if (!text || submitting) return;

    const nextFields = { ...fields };
    if (step === 0) nextFields.name = text;
    if (step === 1) nextFields.company = text;
    if (step === 2) nextFields.teamSize = text;
    if (step === 3) nextFields.challenge = text;
    if (step === 4) nextFields.email = text.toLowerCase();
    if (step === 5) nextFields.phone = text;

    const nextMessages = [...messages, { id: id(), role: "user" as const, content: text }];
    setInput("");
    setFields(nextFields);

    if (step === 5) {
      setMessages(nextMessages);
      await finish(nextFields, nextMessages);
      return;
    }

    const nextStep = step + 1;
    setStep(nextStep);
    setMessages([...nextMessages, { id: id(), role: "nexa", content: nextPrompt(nextStep, nextFields) }]);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void answer(input);
  }

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col bg-[#05050A] text-white transition-transform duration-300 ${
        open ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <header className="flex h-[60px] shrink-0 items-center gap-3 border-b border-white/10 px-4">
        <button type="button" onClick={onClose} className="rounded-xl border border-white/10 p-2" aria-label="Close">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#7C6FFF] font-heading text-sm font-bold">
          N
        </div>
        <div>
          <p className="font-heading text-sm font-bold">NEXA setup</p>
          <p className="text-xs text-[#22D9A0]">online now</p>
        </div>
      </header>

      {complete ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#22D9A0]/15 text-[#22D9A0]">
            <Check className="h-10 w-10" />
          </div>
          <h2 className="font-heading text-2xl font-extrabold">Workspace request received</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            {fields.bdmName} will call {fields.phone} and help set up BGOS for {fields.company}.
          </p>
          <button type="button" onClick={onClose} className="mt-8 rounded-2xl bg-[#7C6FFF] px-8 py-3 text-sm font-bold">
            Close
          </button>
        </div>
      ) : (
        <>
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-5">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <p
                  className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm leading-6 ${
                    message.role === "user"
                      ? "rounded-tr-sm bg-[#22D9A0] text-black"
                      : "rounded-tl-sm border border-white/10 bg-[#13131c]"
                  }`}
                >
                  {message.content}
                </p>
              </div>
            ))}
            {submitting ? <p className="text-xs text-zinc-500">Notifying BGOS...</p> : null}
          </div>
          <form onSubmit={submit} className="flex gap-2 border-t border-white/10 px-4 pb-[calc(14px+env(safe-area-inset-bottom))] pt-3">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={step === 4 ? "you@company.com" : step === 5 ? "WhatsApp number" : "Type here..."}
              className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-[#0f0f14] px-4 py-3 text-sm outline-none"
            />
            <button type="submit" disabled={!input.trim() || submitting} className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7C6FFF] disabled:opacity-50">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default function MobileLandingPage() {
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    window.openMobileNexaChat = () => setChatOpen(true);
    return () => {
      delete window.openMobileNexaChat;
    };
  }, []);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#05050A] pb-[92px] text-white">
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#05050A]/90 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <Link href="/" className="font-heading text-xl font-extrabold">
            BG<span className="text-[#7C6FFF]">OS</span>
          </Link>
          <div className="flex items-center gap-2">
            {quickActions.slice(1).map((item) => (
              <Link key={item.href} href={item.href} className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-zinc-200">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </header>

      <section className="px-4 pb-8 pt-6">
        <div className="rounded-[28px] border border-white/10 bg-[#0b0b12] p-5 shadow-2xl shadow-black/40">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full border border-[#7C6FFF]/30 bg-[#7C6FFF]/10 px-3 py-1 text-[11px] font-bold text-[#c4b5fd]">
              Powered by NEXA AI
            </span>
            <span className="text-[11px] text-zinc-500">7-day free trial</span>
          </div>

          <h1 className="mt-5 font-heading text-[34px] font-extrabold leading-[1.05] tracking-[-1px]">
            Your business, running <span className="bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] bg-clip-text text-transparent">itself.</span>
          </h1>
          <p className="mt-4 text-sm leading-6 text-zinc-400">
            NEXA runs leads, follow-ups, team tasks, and reports while you focus on growth.
          </p>

          <div className="relative mt-6 overflow-hidden rounded-[24px] bg-[#05050A]">
            <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7C6FFF]/25 blur-[50px]" />
            <Image
              src="/images/nexa.jpeg"
              alt="NEXA AI avatar"
              width={520}
              height={720}
              priority
              className="relative z-10 max-h-[360px] w-full object-cover object-top"
            />
          </div>

          <div className="mt-5 grid gap-3">
            <button type="button" onClick={() => setChatOpen(true)} className="h-13 rounded-2xl bg-[#7C3AED] px-5 py-4 text-sm font-extrabold text-white">
              Start free trial →
            </button>
            <Link href="/marketplace" className="rounded-2xl border border-white/10 px-5 py-4 text-center text-sm font-bold text-zinc-200">
              Explore AI agents
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4">
        <div className="grid grid-cols-2 gap-3">
          {proofCards.map((card) => (
            <div key={card.label} className="rounded-2xl border border-white/10 bg-[#111119] p-4">
              <p className={`font-heading text-lg font-extrabold ${card.tone}`}>{card.label}</p>
              <p className="mt-2 text-xs leading-5 text-zinc-500">{card.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-8">
        <div className="rounded-2xl border border-[#7C6FFF]/25 bg-[#7C6FFF]/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#7C6FFF] to-[#22D9A0] font-heading text-sm font-bold">
              N
            </div>
            <div>
              <h2 className="font-heading text-sm font-extrabold">NEXA CEO Brief</h2>
              <p className="text-xs text-zinc-500">A preview of your daily operating command</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-zinc-300">
            “You have 3 urgent follow-ups, 2 new leads from last night, and one team member waiting for approval.”
          </p>
        </div>
      </section>

      <section className="px-4 pb-8">
        <h2 className="font-heading text-xl font-extrabold">How it works</h2>
        <div className="mt-4 space-y-3">
          {[
            ["1", "Tell NEXA about your business"],
            ["2", "We build your workspace in 24 hours"],
            ["3", "Your team runs from one command center"],
          ].map(([num, text]) => (
            <div key={num} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#111119] p-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7C3AED] text-sm font-bold">{num}</span>
              <p className="text-sm font-semibold text-zinc-200">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#05050A]/95 px-4 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl">
        <button type="button" onClick={() => setChatOpen(true)} className="h-12 w-full rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] font-heading text-sm font-extrabold">
          Talk to NEXA →
        </button>
      </div>

      <button
        type="button"
        onClick={() => setChatOpen(false)}
        className={`fixed right-4 top-4 z-[10000] rounded-full bg-white/10 p-2 text-white backdrop-blur ${chatOpen ? "block" : "hidden"}`}
        aria-label="Close NEXA"
      >
        <X className="h-4 w-4" />
      </button>
      <MobileLeadCapture open={chatOpen} onClose={() => setChatOpen(false)} />
    </main>
  );
}
