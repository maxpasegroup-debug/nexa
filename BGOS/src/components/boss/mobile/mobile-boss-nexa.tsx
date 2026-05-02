"use client";

import { useMemo, useState } from "react";

type MobileBossNexaProps = {
  context: {
    healthScore: number;
    totalLeads: number;
    hotLeads: number;
    teamCount: number;
    revenueThisMonth: number;
  };
};

type ChatMessage = {
  id: string;
  role: "nexa" | "user";
  text: string;
};

export function MobileBossNexa({ context }: MobileBossNexaProps) {
  const intro = useMemo(
    () =>
      `Your business health is ${context.healthScore}. You have ${context.hotLeads} hot leads and ${context.teamCount} active team members today.`,
    [context.healthScore, context.hotLeads, context.teamCount],
  );
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "intro", role: "nexa", text: intro },
  ]);
  const [input, setInput] = useState("");

  function answer(prompt: string) {
    const normalized = prompt.toLowerCase();
    let response = `I would start with the ${context.hotLeads} hot leads, then review team follow-ups.`;

    if (normalized.includes("team")) {
      response = `${context.teamCount} teammates are active. Ask BDMs to clear cold follow-ups before new outreach.`;
    } else if (normalized.includes("revenue")) {
      response = `Revenue this month is ₹${context.revenueThisMonth.toLocaleString("en-IN")}. Push proposal-stage deals today.`;
    } else if (normalized.includes("cold") || normalized.includes("attention")) {
      response = `${context.hotLeads} high-intent leads need owner attention before they cool down.`;
    }

    setMessages((current) => [
      ...current,
      { id: `u-${Date.now()}`, role: "user", text: prompt },
      { id: `n-${Date.now()}`, role: "nexa", text: response },
    ]);
    setInput("");
  }

  return (
    <main className="mobile-page flex min-h-screen flex-col bg-[var(--bg)] text-[var(--text)]">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-white/10 bg-[rgba(7,7,9,0.97)] px-4 py-3 backdrop-blur">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#7C6FFF] to-[#22D9A0] font-heading text-xs font-bold">
          N
        </div>
        <div>
          <h1 className="font-heading text-sm font-bold">NEXA</h1>
          <p className="text-[10px] text-[#22D9A0]">CEO context loaded</p>
        </div>
      </header>

      <section className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[82%] rounded-2xl px-4 py-3 text-xs leading-5 ${
                message.role === "user"
                  ? "rounded-br-md bg-[#1c1c26] text-white"
                  : "rounded-bl-md bg-[#7C6FFF] text-white"
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
      </section>

      <div className="border-t border-white/10 bg-[rgba(7,7,9,0.97)] p-3 pb-safe">
        <div className="mb-3 flex gap-2 overflow-x-auto scroll-x-hidden">
          {[
            "What needs my attention?",
            "Team performance today",
            "Revenue this month",
            "Leads going cold",
          ].map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => answer(prompt)}
              className="shrink-0 rounded-full border border-[#7C6FFF]/35 px-3 py-2 text-[11px] font-semibold text-[#c9c4ff]"
            >
              {prompt}
            </button>
          ))}
        </div>
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (input.trim()) answer(input.trim());
          }}
        >
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask NEXA..."
            className="min-w-0 flex-1 rounded-full border border-white/10 bg-[#13131c] px-4 text-sm outline-none focus:border-[#7C6FFF]/50"
          />
          <button type="submit" className="h-11 rounded-full bg-[#7C6FFF] px-5 font-heading text-xs font-bold text-white">
            Send
          </button>
        </form>
      </div>
    </main>
  );
}
