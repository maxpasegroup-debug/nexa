"use client";

import { useMemo, useState } from "react";
import { createInitialNexaState, sendNexaChatRequest } from "@/lib/nexa";

const quickActions = [
  "Plan my next 7 days",
  "Improve my resume",
  "Suggest Learning Garden path",
  "Find Earning Universe opportunities",
];

export function NexaAssistant() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState(createInitialNexaState);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const latestNexaMessage = useMemo(
    () => [...state.messages].reverse().find((message) => message.role === "assistant")?.content,
    [state.messages],
  );

  async function handleSend(message: string, quickAction?: string) {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isSending) {
      return;
    }

    setOpen(true);
    setIsSending(true);
    setStatusMessage(null);

    const result = await sendNexaChatRequest({
      message: trimmedMessage,
      quickAction,
      state,
    });

    setState(result.state);
    setStatusMessage(result.usedFallback ? "Using beta-safe guidance while Guardian Angel AI connects to BGOS." : null);
    setIsSending(false);
  }

  function handleQuickAction(action: string) {
    void handleSend(action, action);
  }

  function handleInputSubmit() {
    const message = input;
    setInput("");
    void handleSend(message);
  }

  return (
    <div className="fixed bottom-44 right-3 z-40 flex max-w-[calc(100vw-1.5rem)] flex-col items-end gap-3 sm:right-4 sm:max-w-[calc(100vw-2rem)] md:bottom-6 md:right-6">
      {open ? (
        <section className="max-h-[calc(100svh-7rem)] w-[min(390px,calc(100vw-1.5rem))] overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-2xl shadow-slate-950/18 sm:w-[min(390px,calc(100vw-2rem))] sm:rounded-[28px]">
          <header className="c7-gradient-panel rounded-none p-4 shadow-none sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">
                  Guardian Angel AI assistant
                </p>
                <h2 className="mt-2 text-xl font-black tracking-tight sm:text-2xl">Career co-pilot</h2>
                <p className="mt-2 text-sm leading-6 text-white/72">
                  Warm guidance with integration-ready intelligence.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close Guardian Angel AI assistant"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/16 text-sm font-black text-white ring-1 ring-white/18"
              >
                X
              </button>
            </div>
          </header>

          <div className="max-h-[30svh] space-y-3 overflow-y-auto bg-slate-50 p-3 sm:max-h-[46vh] sm:p-4">
            {state.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <p
                  className={`max-w-[86%] rounded-[20px] px-4 py-3 text-sm leading-6 ${
                    message.role === "user"
                      ? "bg-slate-950 font-semibold text-white"
                      : "border border-slate-200 bg-white font-medium text-slate-700"
                  }`}
                >
                  {message.content}
                </p>
              </div>
            ))}
            {isSending ? (
              <div className="flex justify-start">
                <p className="max-w-[86%] rounded-[20px] border border-slate-200 bg-white px-4 py-3 text-sm font-medium leading-6 text-slate-500">
                  Guardian Angel AI is thinking...
                </p>
              </div>
            ) : null}
          </div>

          <div className="border-t border-slate-200 bg-white p-3 sm:p-4">
            {statusMessage ? (
              <p className="mb-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold leading-5 text-amber-800">
                {statusMessage}
              </p>
            ) : null}
            <div className="grid gap-2">
              {quickActions.map((action) => (
                <button
                  key={action}
                  type="button"
                  onClick={() => handleQuickAction(action)}
                  disabled={isSending}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-left text-sm font-black text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 sm:px-4 sm:py-3"
                >
                  {action}
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2">
              <input
                aria-label="Message Guardian Angel AI"
                placeholder="Ask Guardian Angel AI anything..."
                value={input}
                onChange={(event) => setInput(event.currentTarget.value)}
                className="min-w-0 flex-1 bg-transparent px-2 text-sm font-semibold text-slate-950 outline-none placeholder:text-slate-400"
                onKeyDown={(event) => {
                  if (event.key !== "Enter") {
                    return;
                  }
                  handleInputSubmit();
                }}
              />
              <button
                type="button"
                onClick={handleInputSubmit}
                disabled={isSending}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-black text-white"
                aria-label="Send message to Guardian Angel AI"
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
        aria-label="Open Guardian Angel AI assistant"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 text-sm font-black">
          NX
        </span>
        <span className="hidden text-left sm:block">
          <span className="block text-sm font-black">Ask Guardian Angel AI</span>
          <span className="block max-w-48 truncate text-xs font-semibold text-white/58">
            {latestNexaMessage}
          </span>
        </span>
      </button>
    </div>
  );
}
