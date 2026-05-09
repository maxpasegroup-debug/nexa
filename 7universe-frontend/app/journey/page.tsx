"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const STEPS = [
  {
    id: 1,
    file: "7A1.mp3",
    title: "Welcome & Vision",
    desc: "Understand what 7Universe is and why it matters.",
  },
  {
    id: 2,
    file: "7A2.mp3",
    title: "Understanding the System",
    desc: "How the 7-slot structure works.",
  },
  {
    id: 3,
    file: "7A3.mp3",
    title: "7 Slot Explanation",
    desc: "Your position and how slots fill.",
  },
  {
    id: 4,
    file: "7A4.mp3",
    title: "Income Structure",
    desc: "How earnings flow through the system.",
  },
  {
    id: 5,
    file: "7A5.mp3",
    title: "SafePal + Activation",
    desc: "Set up your wallet and activate your referral.",
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
      router.replace("/register");
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
        router.replace("/register");
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
    router.replace("/register");
  }

  const completedCount = progress.length;
  const nextStep = Math.min(completedCount + 1, 5);

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,#0d0020_0%,#000000_100%)] px-5 py-5 text-white">
      <div className="mx-auto w-full max-w-xl pb-12">
        <header className="flex items-center justify-between">
          <div className="font-heading text-lg font-extrabold text-[#F59E0B]">7Universe</div>
          <div className="flex items-center gap-3">
            <a href="https://wa.me/917591929909" className="text-xl" aria-label="WhatsApp mentor">
              💬
            </a>
            <button type="button" onClick={logout} className="text-xl" aria-label="Logout">
              ⎋
            </button>
          </div>
        </header>

        <section className="mt-8">
          <p className="text-lg font-semibold">Hello {user?.name ?? "there"} 👋</p>
          <div className="mt-5 grid grid-cols-5 gap-2">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`h-2 rounded-full ${progress.includes(step.id) ? "bg-[#F59E0B]" : "bg-white/10"}`}
              />
            ))}
          </div>
          <p className="mt-3 text-sm text-white/50">Step {nextStep} of 5</p>
        </section>

        <section className="mt-7 space-y-4">
          {STEPS.map((step) => {
            const completed = progress.includes(step.id);
            const unlocked = step.id === 1 || progress.includes(step.id - 1);
            const playing = playingStep === step.id;

            return (
              <article
                key={step.id}
                className={`rounded-[14px] border p-4 transition-all duration-300 ${
                  completed
                    ? "border-white/10 bg-white/[0.03]"
                    : unlocked
                      ? "border-[rgba(245,158,11,0.5)] bg-white/[0.03] shadow-[0_0_30px_rgba(245,158,11,0.08)]"
                      : "border-white/10 bg-white/[0.03] opacity-40"
                }`}
              >
                {!unlocked ? (
                  <div className="flex items-center gap-3">
                    <span className="text-[#F59E0B]">🔒</span>
                    <div>
                      <h2 className="font-heading font-bold text-white/60">{step.title}</h2>
                      <p className="text-sm text-white/40">Complete previous step first</p>
                    </div>
                  </div>
                ) : completed ? (
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="font-heading font-bold text-white/60 line-through decoration-white/20">
                        {step.title}
                      </h2>
                      <p className="mt-1 text-sm text-white/40">{step.desc}</p>
                    </div>
                    <div className="text-right text-[11px] font-extrabold uppercase tracking-wide text-emerald-400">
                      ✅<br />Completed
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold text-[#F59E0B]">Step {step.id}</p>
                        <h2 className="mt-1 font-heading text-lg font-extrabold">{step.title}</h2>
                        <p className="mt-1 text-sm text-white/50">{step.desc}</p>
                      </div>
                      {!playing ? (
                        <button
                          type="button"
                          onClick={() => startStep(step.id, step.file)}
                          className="shrink-0 rounded-lg bg-[#F59E0B] px-4 py-2 text-sm font-extrabold text-black"
                        >
                          ▶ Play
                        </button>
                      ) : null}
                    </div>

                    {playing ? (
                      <div className="mt-5">
                        <audio
                          ref={audioRef}
                          onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
                          onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
                          onEnded={() => completeStep(step.id)}
                          onSeeking={(event) => {
                            if (event.currentTarget.currentTime > currentTime + 1) {
                              event.currentTarget.currentTime = currentTime;
                            }
                          }}
                        />
                        <div className="h-2 overflow-hidden rounded-full bg-white/10">
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
                      </div>
                    ) : null}
                  </div>
                )}
              </article>
            );
          })}
        </section>

        {progress.includes(5) ? (
          <section className="mt-6 rounded-[14px] border border-[rgba(245,158,11,0.3)] bg-[rgba(245,158,11,0.08)] p-5">
            <h2 className="font-heading text-xl font-extrabold text-[#F59E0B]">🎉 You&apos;re ready to activate!</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Link href="/resources" className="rounded-xl border border-[rgba(245,158,11,0.3)] px-4 py-3 text-center font-bold text-[#F59E0B]">
                Go to Resources →
              </Link>
              <Link href="/done" className="rounded-xl bg-[#F59E0B] px-4 py-3 text-center font-extrabold text-black">
                Activate Now →
              </Link>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}

