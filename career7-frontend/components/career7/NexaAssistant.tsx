"use client";

import { useMemo, useState } from "react";

type ChatMessage = {
  from: "nexa" | "user";
  text: string;
};

const quickActions = [
  "Plan my next 7 days",
  "Improve my resume",
  "Suggest learning path",
  "Find earning opportunities",
];

const placeholderResponses: Record<string, string> = {
  "Plan my next 7 days":
    "Here is a focused 7-day sprint: polish your resume, complete one proof task, run two interview drills, and review three high-fit roles before the weekend.",
  "Improve my resume":
    "Start with proof. I would tighten each role into impact bullets, add measurable outcomes, and align the top summary to your target job.",
  "Suggest learning path":
    "Your learning path should pair communication practice with portfolio proof: English fluency, role-specific projects, then weekly mock interviews.",
  "Find earning opportunities":
    "I would scan for fast-fit freelance tasks, entry consulting gigs, and roles where your current proof can create a quick application advantage.",
};

export function NexaAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      from: "nexa",
      text: "Hi Arun, I am NEXA. I can help you choose the next calm, high-leverage career move.",
    },
  ]);

  const latestNexaMessage = useMemo(
    () => [...messages].reverse().find((message) => message.from === "nexa")?.text,
    [messages],
  );

  function handleQuickAction(action: string) {
    setOpen(true);
    setMessages((current) => [
      ...current,
      { from: "user", text: action },
      {
        from: "nexa",
        text:
          placeholderResponses[action] ??
          "I can help with that. For now, this is a placeholder response until the real AI backend is connected.",
      },
    ]);
  }

  return (
    <div className="fixed bottom-44 right-3 z-40 flex max-w-[calc(100vw-1.5rem)] flex-col items-end gap-3 sm:right-4 sm:max-w-[calc(100vw-2rem)] md:bottom-6 md:right-6">
      {open ? (
        <section className="max-h-[calc(100svh-7rem)] w-[min(390px,calc(100vw-1.5rem))] overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-2xl shadow-slate-950/18 sm:w-[min(390px,calc(100vw-2rem))] sm:rounded-[28px]">
          <header className="c7-gradient-panel rounded-none p-4 shadow-none sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">
                  NEXA assistant
                </p>
                <h2 className="mt-2 text-xl font-black tracking-tight sm:text-2xl">Career co-pilot</h2>
                <p className="mt-2 text-sm leading-6 text-white/72">
                  Warm guidance with placeholder intelligence.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close NEXA assistant"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/16 text-sm font-black text-white ring-1 ring-white/18"
              >
                X
              </button>
            </div>
          </header>

          <div className="max-h-[30svh] space-y-3 overflow-y-auto bg-slate-50 p-3 sm:max-h-[46vh] sm:p-4">
            {messages.map((message, index) => (
              <div
                key={`${message.from}-${index}`}
                className={`flex ${message.from === "user" ? "justify-end" : "justify-start"}`}
              >
                <p
                  className={`max-w-[86%] rounded-[20px] px-4 py-3 text-sm leading-6 ${
                    message.from === "user"
                      ? "bg-slate-950 font-semibold text-white"
                      : "border border-slate-200 bg-white font-medium text-slate-700"
                  }`}
                >
                  {message.text}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 bg-white p-3 sm:p-4">
            <div className="grid gap-2">
              {quickActions.map((action) => (
                <button
                  key={action}
                  type="button"
                  onClick={() => handleQuickAction(action)}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-left text-sm font-black text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 sm:px-4 sm:py-3"
                >
                  {action}
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2">
              <input
                aria-label="Message NEXA"
                placeholder="Ask NEXA anything..."
                className="min-w-0 flex-1 bg-transparent px-2 text-sm font-semibold text-slate-950 outline-none placeholder:text-slate-400"
                onKeyDown={(event) => {
                  if (event.key !== "Enter") {
                    return;
                  }
                  const value = event.currentTarget.value.trim();
                  if (!value) {
                    return;
                  }
                  event.currentTarget.value = "";
                  setMessages((current) => [
                    ...current,
                    { from: "user", text: value },
                    {
                      from: "nexa",
                      text: "That is a smart question. I would turn it into one clear next action, then review your Growth Board before choosing the best agent.",
                    },
                  ]);
                }}
              />
              <button
                type="button"
                onClick={() => handleQuickAction("Plan my next 7 days")}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-black text-white"
                aria-label="Send placeholder message to NEXA"
              >
                Go
              </button>
            </div>
          </div>
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="group flex items-center gap-3 rounded-full bg-slate-950 px-3 py-3 text-white shadow-2xl shadow-indigo-500/25 ring-1 ring-white/20 transition hover:-translate-y-0.5 hover:bg-slate-900 sm:px-4"
        aria-label="Open NEXA assistant"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 text-sm font-black">
          NX
        </span>
        <span className="hidden text-left sm:block">
          <span className="block text-sm font-black">Ask NEXA</span>
          <span className="block max-w-48 truncate text-xs font-semibold text-white/58">
            {latestNexaMessage}
          </span>
        </span>
      </button>
    </div>
  );
}
