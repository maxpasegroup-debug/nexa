"use client";

import { useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  Bot,
  BriefcaseBusiness,
  CalendarDays,
  FileText,
  GraduationCap,
  Loader2,
  MessageCircle,
  Minimize2,
  Send,
  Sparkles,
  X,
} from "lucide-react";

import {
  type Career7NexaMessage,
  career7NexaQuickActions,
} from "@/lib/career7-nexa";

type GuideMessage = Career7NexaMessage & {
  id: string;
  chips?: string[];
};

const actionIcons = {
  "Suggest learning for me": GraduationCap,
  "Find job opportunities": BriefcaseBusiness,
  "Improve my resume": FileText,
  "Plan my next 7 days": CalendarDays,
};

function createMessage(role: GuideMessage["role"], content: string, chips?: string[]) {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    chips,
  };
}

export function NexaGuide({ userName }: { userName: string }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<GuideMessage[]>([
    createMessage(
      "assistant",
      `Hi ${userName.split(" ")[0] || "there"}, I am NEXA. I will stay close while you learn, apply, and build momentum.`,
      ["Start with learning", "Check jobs", "Plan week"],
    ),
  ]);
  const inputRef = useRef<HTMLInputElement>(null);

  const history = useMemo(
    () => messages.map(({ role, content }) => ({ role, content })),
    [messages],
  );

  async function sendMessage(content: string, quickAction?: string) {
    const trimmed = content.trim();
    if (!trimmed || busy) return;

    setOpen(true);
    setInput("");
    setBusy(true);
    setMessages((current) => [...current, createMessage("user", trimmed)]);

    try {
      const response = await fetch("/api/career7/nexa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          quickAction,
          history,
        }),
      });
      const payload = (await response.json()) as {
        message?: string;
        chips?: string[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "NEXA is unavailable right now.");
      }

      setMessages((current) => [
        ...current,
        createMessage(
          "assistant",
          payload.message ?? "I am here. Let us turn this into your next step.",
          payload.chips,
        ),
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        createMessage(
          "assistant",
          error instanceof Error
            ? error.message
            : "NEXA is unavailable right now.",
        ),
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex max-w-[calc(100vw-2.5rem)] flex-col items-end gap-3">
      {open && (
        <section className="flex h-[min(680px,calc(100vh-7rem))] w-[min(420px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.24)]">
          <div className="bg-[#071329] px-4 py-4 text-white">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-cyan-300 text-slate-950 shadow-[0_0_36px_rgba(103,232,249,0.35)]">
                  <Bot size={23} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold">NEXA</h2>
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-100">
                      Career7 Guide
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-300">
                    Friendly strategy, clear next steps.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-lg text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Minimize NEXA"
                >
                  <Minimize2 size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setMessages((current) => current.slice(0, 1));
                  }}
                  className="grid h-8 w-8 place-items-center rounded-lg text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Close NEXA"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {career7NexaQuickActions.map((action) => {
                const Icon = actionIcons[action];
                return (
                  <button
                    key={action}
                    type="button"
                    onClick={() => sendMessage(action, action)}
                    disabled={busy}
                    className="flex min-h-12 items-center gap-2 rounded-xl border border-white/10 bg-white/7 px-3 py-2 text-left text-xs font-semibold text-white transition-colors hover:bg-white/12 disabled:opacity-50"
                  >
                    <Icon size={15} className="shrink-0 text-cyan-200" />
                    <span>{action}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 px-4 py-5">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[86%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    message.role === "user"
                      ? "rounded-br-md bg-violet-600 text-white"
                      : "rounded-bl-md border border-slate-200 bg-white text-slate-800"
                  }`}
                >
                  <p>{message.content}</p>
                  {message.chips && message.chips.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {message.chips.map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => sendMessage(chip)}
                          className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600 transition-colors hover:border-cyan-200 hover:bg-cyan-50 hover:text-slate-900"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {busy && (
              <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-500 shadow-sm">
                <Loader2 size={14} className="animate-spin text-cyan-500" />
                NEXA is thinking
              </div>
            )}
          </div>

          <form
            className="border-t border-slate-200 bg-white p-3"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage(input);
            }}
          >
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 focus-within:border-violet-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-violet-100">
              <input
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask NEXA about your next move"
                className="min-w-0 flex-1 bg-transparent px-2 text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-slate-950 text-white transition-opacity disabled:opacity-45"
                aria-label="Send to NEXA"
              >
                <Send size={17} />
              </button>
            </div>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => {
          setOpen((current) => !current);
          window.setTimeout(() => inputRef.current?.focus(), 100);
        }}
        className="group flex items-center gap-3 rounded-2xl bg-slate-950 px-4 py-3 text-white shadow-[0_20px_55px_rgba(15,23,42,0.28)] transition-transform hover:-translate-y-0.5"
        aria-expanded={open}
      >
        <span className="relative grid h-11 w-11 place-items-center rounded-xl bg-cyan-300 text-slate-950">
          <Sparkles size={20} />
          <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-slate-950 bg-emerald-400" />
        </span>
        <span className="hidden text-left sm:block">
          <span className="block text-sm font-bold">Ask NEXA</span>
          <span className="flex items-center gap-1 text-xs text-slate-300">
            Career guide
            <ArrowUpRight size={12} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </span>
        <MessageCircle size={20} className="sm:hidden" />
      </button>
    </div>
  );
}
