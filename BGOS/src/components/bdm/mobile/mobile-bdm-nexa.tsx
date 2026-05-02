"use client";

import { FormEvent, useState } from "react";
import { Send } from "lucide-react";

type Message = { id: string; role: "nexa" | "user"; text: string };

const quickReplies = [
  "Who should I call first?",
  "How much have I earned?",
  "Which leads are going cold?",
  "What is my next slab milestone?",
];

export function MobileBDMNexa() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "hello", role: "nexa", text: "I have your commission data, cold leads, and daily brief ready. What should we work on first?" },
  ]);
  const [input, setInput] = useState("");

  function ask(text: string) {
    if (!text.trim()) return;
    setMessages((current) => [
      ...current,
      { id: `${Date.now()}-u`, role: "user", text },
      { id: `${Date.now()}-n`, role: "nexa", text: "I am checking your BDM context now. Start with the hottest follow-up and keep notes tight after each call." },
    ]);
    setInput("");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    ask(input);
  }

  return (
    <main className="mobile-page flex min-h-screen flex-col bg-[#070709] text-white">
      <header className="border-b border-white/[0.08] px-4 py-3"><h1 className="font-heading text-lg font-extrabold">NEXA</h1><p className="text-xs text-[#22D9A0]">BDM context loaded</p></header>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((message) => <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm leading-6 ${message.role === "user" ? "rounded-tr-sm bg-[#13131c]" : "rounded-tl-sm bg-[#7C6FFF]/30"}`}>{message.text}</div></div>)}
      </div>
      <div className="border-t border-white/[0.08] px-4 pb-4 pt-3">
        <div className="scroll-x-hidden mb-3 flex gap-2">{quickReplies.map((reply) => <button key={reply} type="button" onClick={() => ask(reply)} className="shrink-0 rounded-full bg-[#7C6FFF]/15 px-3 py-2 text-xs font-bold text-[#c6c1ff]">{reply}</button>)}</div>
        <form onSubmit={submit} className="flex gap-2"><input value={input} onChange={(event) => setInput(event.target.value)} className="min-w-0 flex-1 rounded-2xl border border-white/[0.08] bg-[#13131c] px-4 py-3 text-sm outline-none" placeholder="Ask NEXA..." /><button className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7C6FFF]"><Send className="h-4 w-4" /></button></form>
      </div>
    </main>
  );
}
