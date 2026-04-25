"use client";

import { Check, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FormEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Button } from "@/components/ui/button";
import { NexaAvatar } from "@/components/nexa/nexa-avatar";
import { NexaChat, type NexaMessage } from "@/components/nexa/nexa-chat";

const placeholders = [
  "Tell me about your business...",
  "How many people are in your team?",
  "What is your biggest challenge?",
  "Which city are you based in?",
  "NEXA is wrapping up",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [stage, setStage] = useState<"intro" | "chat" | "complete">("intro");
  const [messages, setMessages] = useState<NexaMessage[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answer, setAnswer] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState("");
  const [isCompleting, setIsCompleting] = useState(false);
  const hasLoadedOpeningMessage = useRef(false);

  const inputDisabled = isTyping || currentStep >= 4;
  const stepLabel = useMemo(
    () => `Step ${Math.min(currentStep + 1, 5)} of 5`,
    [currentStep],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setStage("chat");
    }, 2000);

    return () => window.clearTimeout(timer);
  }, []);

  const sendAnswer = useCallback(async (value: string) => {
    setError("");
    setIsTyping(true);

    if (value.trim()) {
      setMessages((previousMessages) => [
        ...previousMessages,
        { role: "user", content: value.trim() },
      ]);
    }

    const response = await fetch("/api/onboarding/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        step: currentStep,
        answer: value,
      }),
    });

    setIsTyping(false);

    if (!response.ok) {
      setError("NEXA could not respond right now. Please try again.");
      return;
    }

    const data = (await response.json()) as {
      nextMessage: string;
      nextStep: number;
      completed: boolean;
    };

    setMessages((previousMessages) => [
      ...previousMessages,
      { role: "nexa", content: data.nextMessage },
    ]);
    setCurrentStep(data.nextStep);

    if (data.completed || data.nextStep >= 5) {
      setStage("complete");
    }
  }, [currentStep]);

  useEffect(() => {
    if (stage !== "chat" || hasLoadedOpeningMessage.current) {
      return;
    }

    hasLoadedOpeningMessage.current = true;
    void sendAnswer("");
  }, [sendAnswer, stage]);

  async function handleSubmit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    if (!answer.trim() || inputDisabled) {
      return;
    }

    const submittedAnswer = answer;
    setAnswer("");
    await sendAnswer(submittedAnswer);
  }

  async function handleComplete() {
    setIsCompleting(true);

    const response = await fetch("/api/onboarding/complete", {
      method: "POST",
    });

    setIsCompleting(false);

    if (!response.ok) {
      setError("Your HQ is ready, but we could not save it. Please try again.");
      return;
    }

    router.push("/boss");
    router.refresh();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSubmit();
    }
  }

  if (stage === "intro") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#070709] px-6 text-white">
        <section className="animate-[introFade_2s_ease-in-out_both] text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full shadow-[0_0_70px_rgba(124,111,255,0.55)]">
            <div className="[&>div]:h-20 [&>div]:w-20 [&>div]:text-3xl">
              <NexaAvatar />
            </div>
          </div>
          <h1 className="mt-8 font-heading text-[32px] font-bold tracking-normal text-white">
            Hi, I&apos;m NEXA
          </h1>
          <p className="mt-3 text-base text-zinc-400">
            I&apos;ll set up your business in 3 minutes.
          </p>
        </section>
        <style jsx>{`
          @keyframes introFade {
            0% {
              opacity: 0;
              transform: translateY(8px);
            }

            15%,
            75% {
              opacity: 1;
              transform: translateY(0);
            }

            100% {
              opacity: 0;
              transform: translateY(-8px);
            }
          }
        `}</style>
      </main>
    );
  }

  if (stage === "complete") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#070709] px-6 text-white">
        <Link
          href="/boss"
          className="absolute right-6 top-6 text-sm font-medium text-zinc-400 transition hover:text-white"
        >
          Skip onboarding
        </Link>
        <section className="animate-[completionFade_0.4s_ease-out_both] text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#22D9A0]/15 text-[#22D9A0] ring-1 ring-[#22D9A0]/35">
            <Check className="h-12 w-12" />
          </div>
          <h1 className="mt-8 font-heading text-[32px] font-bold tracking-normal text-white">
            Your business HQ is ready.
          </h1>
          <p className="mt-3 text-base text-zinc-400">
            NEXA is now managing your operations.
          </p>
          {error ? <p className="mt-5 text-sm text-red-400">{error}</p> : null}
          <Button
            type="button"
            className="mt-8 px-6"
            loading={isCompleting}
            onClick={handleComplete}
          >
            Enter your dashboard →
          </Button>
        </section>
        <style jsx>{`
          @keyframes completionFade {
            from {
              opacity: 0;
              transform: translateY(10px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col overflow-hidden bg-[#070709] text-white">
      <header className="flex h-16 shrink-0 items-center justify-between px-6">
        <div className="font-heading text-xl font-bold tracking-normal">
          <span className="text-white">B</span>
          <span className="text-[#7C6FFF]">GOS</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="rounded-full border border-white/10 bg-[#13131c] px-3 py-1 text-sm text-zinc-300">
            {stepLabel}
          </span>
          <Link
            href="/boss"
            className="text-sm font-medium text-zinc-400 transition hover:text-white"
          >
            Skip onboarding
          </Link>
        </div>
      </header>

      <section className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col px-4 pb-28 pt-4">
        <NexaChat
          messages={messages}
          isTyping={isTyping}
          className="rounded-3xl border border-white/10 bg-[#0b0b10]/70 shadow-2xl shadow-black/30"
        />
        {error ? (
          <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        ) : null}
      </section>

      <div className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-[#070709]/80 px-4 py-4 backdrop-blur-xl">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-3xl items-center gap-3"
        >
          <input
            value={answer}
            disabled={inputDisabled}
            onChange={(event) => setAnswer(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholders[Math.min(currentStep, 4)]}
            className="h-12 min-w-0 flex-1 rounded-2xl border border-white/10 bg-[#13131c] px-4 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-[#7C6FFF] focus:ring-2 focus:ring-[#7C6FFF]/20 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={inputDisabled || !answer.trim()}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#7C6FFF] text-white transition hover:bg-[#6b60e8] disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Send message"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </main>
  );
}
