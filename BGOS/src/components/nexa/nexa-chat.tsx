"use client";

import { useEffect, useRef } from "react";
import { clsx } from "clsx";

import { NexaAvatar } from "@/components/nexa/nexa-avatar";

type NexaMessage = {
  role: "nexa" | "user";
  content: string;
};

type NexaChatProps = {
  messages: NexaMessage[];
  isTyping: boolean;
  className?: string;
};

export function NexaChat({ messages, isTyping, className }: NexaChatProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div
      className={clsx(
        "nexa-chat flex h-full min-h-0 flex-col overflow-hidden",
        className,
      )}
    >
      <div className="flex-1 space-y-5 overflow-y-auto px-4 py-6">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}-${message.content}`}
            className={clsx(
              "nexa-message flex",
              message.role === "user" ? "justify-end" : "justify-start",
            )}
          >
            {message.role === "nexa" ? (
              <div className="flex max-w-[82%] items-start gap-3">
                <NexaAvatar size="sm" />
                <div className="rounded-2xl rounded-tl-sm border border-white/10 bg-[#13131c] px-4 py-3 text-sm leading-6 text-[#F0EEF8] shadow-lg shadow-black/20">
                  {message.content}
                </div>
              </div>
            ) : (
              <div className="max-w-[82%] rounded-2xl rounded-tr-sm border border-[rgba(124,111,255,0.3)] bg-[rgba(124,111,255,0.15)] px-4 py-3 text-sm leading-6 text-white shadow-lg shadow-black/20">
                {message.content}
              </div>
            )}
          </div>
        ))}

        {isTyping ? (
          <div className="nexa-message flex justify-start">
            <div className="flex items-start gap-3">
              <NexaAvatar size="sm" />
              <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm border border-white/10 bg-[#13131c] px-4 py-4">
                <span className="typing-dot" />
                <span className="typing-dot animation-delay-150" />
                <span className="typing-dot animation-delay-300" />
              </div>
            </div>
          </div>
        ) : null}
        <div ref={bottomRef} />
      </div>

      <style jsx>{`
        .nexa-message {
          animation: nexaFadeIn 0.3s ease-out both;
        }

        .typing-dot {
          width: 6px;
          height: 6px;
          border-radius: 9999px;
          background: #7c6fff;
          animation: nexaPulse 1s ease-in-out infinite;
        }

        .animation-delay-150 {
          animation-delay: 0.15s;
        }

        .animation-delay-300 {
          animation-delay: 0.3s;
        }

        @keyframes nexaFadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes nexaPulse {
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
    </div>
  );
}

export type { NexaMessage };
