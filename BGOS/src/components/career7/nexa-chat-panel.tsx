"use client";

import { useState } from "react";
import { Brain, CornerDownLeft, Loader, Send } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

type NexaChatPanelProps = {
  messages?: Message[];
  onSendMessage?: (content: string) => Promise<void>;
  isLoading?: boolean;
};

export function NexaChatPanel({
  messages = [
    {
      id: "1",
      role: "assistant",
      content: "Hello! I am NEXA, your AI career coach. How can I help your growth journey today?",
      timestamp: new Date(),
    },
  ],
  onSendMessage = async () => {},
  isLoading = false,
}: NexaChatPanelProps) {
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    setIsSubmitting(true);
    try {
      await onSendMessage(inputValue.trim());
      setInputValue("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-full min-h-[460px] flex-col rounded-2xl border border-slate-100 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-purple-50 p-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-md">
          <Brain className="text-white" size={20} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-950">NEXA Assistant</h3>
          <p className="text-xs text-slate-600">Your AI career coach</p>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                message.role === "user"
                  ? "rounded-br-md bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                  : "rounded-bl-md bg-slate-100 text-slate-950"
              }`}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
              <p className={`mt-1 text-xs ${message.role === "user" ? "text-indigo-100" : "text-slate-500"}`}>
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100">
              <Loader className="animate-spin text-slate-600" size={16} />
            </div>
            <p className="text-sm text-slate-600">NEXA is thinking...</p>
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 bg-slate-50 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask NEXA anything..."
            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleSend}
            disabled={isSubmitting || !inputValue.trim()}
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 p-3 text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
          <CornerDownLeft size={12} />
          Press Enter to send
        </p>
      </div>
    </div>
  );
}
