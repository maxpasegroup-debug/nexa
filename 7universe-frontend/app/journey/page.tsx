"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const STEPS = [
  {
    id: 1,
    file: "7A1.mp3",
    title: "Welcome and Vision",
    desc: "Listen first. Understand why this business exists.",
  },
  {
    id: 2,
    file: "7A2.mp3",
    title: "Understand the System",
    desc: "Simple explanation of the 7-slot structure.",
  },
  {
    id: 3,
    file: "7A3.mp3",
    title: "Your 7 Slots",
    desc: "Know your place and how the slots fill.",
  },
  {
    id: 4,
    file: "7A4.mp3",
    title: "Income Structure",
    desc: "Learn how earnings move through the system.",
  },
  {
    id: 5,
    file: "7A5.mp3",
    title: "SafePal and Activation",
    desc: "Set up wallet, activate, and start sharing.",
  },
];

const SAFEPAL_REFERRAL_LINK = "https://7universe.org?ref=9067";
const SAFEPAL_VIDEO_SOURCES = [
  { src: "/api/video/safepal-malayalam", type: "video/mp4" },
];

const BUSINESS_LINKS = [
  {
    title: "Connect SafePal account",
    desc: "Open the 7Universe SafePal connection link and keep your wallet ready before activation.",
    href: SAFEPAL_REFERRAL_LINK,
    cta: "Connect",
  },
];

type UniverseUser = {
  name: string;
};

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) {
    return "0:00";
  }

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, "0");

  return `${mins}:${secs}`;
}

export default function JourneyPage() {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [token, setToken] = useState("");
  const [user, setUser] = useState<UniverseUser | null>(null);
  const [progress, setProgress] = useState<number[]>([]);
  const [playingStep, setPlayingStep] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem("universe_token");

    if (!stored) {
      router.replace("/login");
      return;
    }

    setToken(stored);
    fetch("/api/universe/me", { headers: { Authorization: `Bearer ${stored}` } })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Unauthorized");
        }

        return response.json() as Promise<{ user: UniverseUser; progress: number[] }>;
      })
      .then((data) => {
        setUser(data.user);
        setProgress(data.progress);
      })
      .catch(() => {
        localStorage.removeItem("universe_token");
        router.replace("/login");
      });
  }, [router]);

  async function startStep(stepNumber: number, file: string) {
    setPlayingStep(stepNumber);
    setCurrentTime(0);
    setDuration(0);

    window.setTimeout(async () => {
      if (!audioRef.current) {
        return;
      }

      audioRef.current.src = `/audio/${file}`;
      audioRef.current.currentTime = 0;
      await audioRef.current.play();
      setIsPlaying(true);
    }, 50);
  }

  async function completeStep(stepNumber: number) {
    const response = await fetch("/api/universe/progress", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ stepNumber }),
    });

    if (response.ok) {
      const data = (await response.json()) as { progress: number[] };
      setProgress(data.progress);
      setPlayingStep(null);
      setIsPlaying(false);
    }
  }

  function logout() {
    localStorage.removeItem("universe_token");
    router.replace("/login");
  }

  const completedCount = progress.length;
  const nextStepNumber = Math.min(completedCount + 1, STEPS.length);
  const nextStep = STEPS.find((step) => step.id === nextStepNumber) ?? STEPS[0];
  const currentStep = STEPS.find((step) => step.id === playingStep);
  const allCompleted = progress.includes(5);

  return (
    <main className="min-h-screen bg-[#050509] text-white">
      <div className="mx-auto min-h-screen w-full max-w-md bg-[radial-gradient(ellipse_at_top,#16002f_0%,#050509_62%)] px-4 pb-24 pt-5 shadow-2xl">
        <header className="sticky top-0 z-10 -mx-4 flex items-center justify-between bg-[#08070d]/90 px-4 py-3 backdrop-blur">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F59E0B]">7Universe</p>
            <h1 className="text-lg font-extrabold">My Business Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://wa.me/917591929909"
              className="rounded-full bg-[#25D366] px-3 py-2 text-xs font-extrabold text-white"
              aria-label="WhatsApp mentor"
            >
              Help
            </a>
            <button
              type="button"
              onClick={logout}
              className="rounded-full border border-white/10 px-3 py-2 text-xs font-bold text-white/70"
            >
              Logout
            </button>
          </div>
        </header>

        <section className="mt-5 rounded-[18px] border border-[rgba(245,158,11,0.25)] bg-[rgba(245,158,11,0.08)] p-5">
          <p className="text-sm font-semibold text-white/70">Hello {user?.name ?? "there"}</p>
          <h2 className="mt-2 font-heading text-2xl font-extrabold leading-tight text-white">
            First listen. Then act.
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/58">
            Complete each audio in order. After the final audio, connect SafePal and share your referral link.
          </p>
          <div className="mt-5 grid grid-cols-5 gap-2">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`h-2 rounded-full ${progress.includes(step.id) ? "bg-[#F59E0B]" : "bg-white/10"}`}
              />
            ))}
          </div>
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-[#F59E0B]">
            {completedCount} of {STEPS.length} audios completed
          </p>
        </section>

        {!allCompleted ? (
          <section className="mt-5 rounded-[18px] border border-white/10 bg-white/[0.04] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F59E0B]">Next audio</p>
            <div className="mt-3 flex items-start justify-between gap-4">
              <div>
                <h2 className="font-heading text-xl font-extrabold">{nextStep.title}</h2>
                <p className="mt-1 text-sm leading-6 text-white/55">{nextStep.desc}</p>
              </div>
              {playingStep !== nextStep.id ? (
                <button
                  type="button"
                  onClick={() => startStep(nextStep.id, nextStep.file)}
                  className="shrink-0 rounded-xl bg-[#F59E0B] px-4 py-3 text-sm font-extrabold text-black"
                >
                  Play
                </button>
              ) : null}
            </div>
          </section>
        ) : (
          <section className="mt-5 rounded-[18px] border border-[rgba(245,158,11,0.35)] bg-[rgba(245,158,11,0.1)] p-5">
            <h2 className="font-heading text-xl font-extrabold text-[#F59E0B]">Training complete</h2>
            <p className="mt-2 text-sm leading-6 text-white/60">
              Your referral link is ready. Activate now and share it with people who can listen and follow the same steps.
            </p>
            <Link href="/done" className="mt-4 block rounded-xl bg-[#F59E0B] px-4 py-3 text-center font-extrabold text-black">
              Activate and Get Referral Link
            </Link>
          </section>
        )}

        {currentStep ? (
          <section className="mt-5 rounded-[18px] border border-[rgba(245,158,11,0.35)] bg-white/[0.04] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F59E0B]">
              Playing audio {currentStep.id}
            </p>
            <h2 className="mt-2 font-heading text-xl font-extrabold">{currentStep.title}</h2>
            <audio
              ref={audioRef}
              onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
              onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
              onEnded={() => completeStep(currentStep.id)}
              onSeeking={(event) => {
                if (event.currentTarget.currentTime > currentTime + 1) {
                  event.currentTarget.currentTime = currentTime;
                }
              }}
            />
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[#F59E0B] transition-all"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-white/50">
              <span>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
              <button
                type="button"
                onClick={async () => {
                  if (!audioRef.current) {
                    return;
                  }

                  if (audioRef.current.paused) {
                    await audioRef.current.play();
                    setIsPlaying(true);
                  } else {
                    audioRef.current.pause();
                    setIsPlaying(false);
                  }
                }}
                className="rounded-lg border border-[rgba(245,158,11,0.35)] px-4 py-2 text-sm font-bold text-[#F59E0B]"
              >
                {isPlaying ? "Pause" : "Play"}
              </button>
            </div>
          </section>
        ) : null}

        <section className="mt-5">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-extrabold">Step by step audios</h2>
            <span className="text-xs text-white/40">Replay anytime</span>
          </div>
          <div className="mt-3 space-y-3">
            {STEPS.map((step) => {
              const completed = progress.includes(step.id);
              const unlocked = step.id === 1 || progress.includes(step.id - 1);
              const active = playingStep === step.id;

              return (
                <article
                  key={step.id}
                  className={`rounded-[14px] border p-4 ${
                    completed
                      ? "border-emerald-400/20 bg-emerald-400/[0.04]"
                      : unlocked
                        ? "border-white/10 bg-white/[0.04]"
                        : "border-white/10 bg-white/[0.02] opacity-45"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#F59E0B]">Audio {step.id}</p>
                      <h3 className="mt-1 truncate font-heading font-extrabold">{step.title}</h3>
                      <p className="mt-1 text-sm text-white/45">
                        {completed ? "Completed" : unlocked ? step.desc : "Complete previous audio first"}
                      </p>
                    </div>
                    {unlocked && !active ? (
                      <button
                        type="button"
                        onClick={() => startStep(step.id, step.file)}
                        className="shrink-0 rounded-lg border border-[rgba(245,158,11,0.45)] px-3 py-2 text-xs font-extrabold text-[#F59E0B]"
                      >
                        {completed ? "Replay" : "Play"}
                      </button>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-6">
          <h2 className="font-heading text-lg font-extrabold">SafePal Malayalam video</h2>
          <article className="mt-3 overflow-hidden rounded-[14px] border border-white/10 bg-white/[0.04]">
            <video className="aspect-video w-full bg-black" controls preload="metadata" playsInline>
              {SAFEPAL_VIDEO_SOURCES.map((source) => (
                <source key={source.src} src={source.src} type={source.type} />
              ))}
              Your browser does not support the video tag.
            </video>
            <div className="p-4">
              <h3 className="font-heading font-extrabold">How to use SafePal</h3>
              <p className="mt-1 text-sm leading-5 text-white/50">
                Watch this after the audio lessons to connect SafePal with 7Universe.
              </p>
            </div>
          </article>
        </section>

        <section className="mt-6">
          <h2 className="font-heading text-lg font-extrabold">SafePal and business links</h2>
          <div className="mt-3 space-y-3">
            {BUSINESS_LINKS.map((item) => (
              <a
                key={item.title}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="block rounded-[14px] border border-white/10 bg-white/[0.04] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-heading font-extrabold">{item.title}</h3>
                    <p className="mt-1 text-sm leading-5 text-white/50">{item.desc}</p>
                    <p className="mt-2 break-all text-xs text-white/35">{item.href}</p>
                  </div>
                  <span className="shrink-0 rounded-lg bg-white/10 px-3 py-2 text-xs font-extrabold text-[#F59E0B]">
                    {item.cta}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>

        <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto grid max-w-md grid-cols-3 border-t border-white/10 bg-[#08070d]/95 px-4 py-3 text-center text-xs font-bold text-white/65 backdrop-blur">
          <Link href="/journey" className="text-[#F59E0B]">
            Home
          </Link>
          <Link href="/resources">Videos</Link>
          <a href="https://wa.me/917591929909">Mentor</a>
        </nav>
      </div>
    </main>
  );
}
