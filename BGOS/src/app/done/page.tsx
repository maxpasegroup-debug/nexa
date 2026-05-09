"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type UniverseUser = {
  referralCode: string;
};

export default function DonePage() {
  const router = useRouter();
  const [user, setUser] = useState<UniverseUser | null>(null);
  const [copied, setCopied] = useState(false);
  const referralLink = useMemo(
    () => `https://7universe.org/?ref=${user?.referralCode ?? ""}`,
    [user?.referralCode],
  );

  useEffect(() => {
    const token = localStorage.getItem("universe_token");

    if (!token) {
      router.replace("/register");
      return;
    }

    fetch("/api/universe/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Unauthorized");
        }

        return response.json() as Promise<{ user: UniverseUser; progress: number[] }>;
      })
      .then((data) => {
        if (data.progress.length < 5) {
          router.replace("/journey");
          return;
        }

        setUser(data.user);
      })
      .catch(() => {
        localStorage.removeItem("universe_token");
        router.replace("/register");
      });
  }, [router]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_top,#0d0020_0%,#000000_100%)] px-5 py-10 text-white">
      <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_20%_30%,rgba(245,158,11,0.25)_0_1px,transparent_2px),radial-gradient(circle_at_70%_20%,rgba(245,158,11,0.2)_0_1px,transparent_2px),radial-gradient(circle_at_45%_75%,rgba(255,255,255,0.2)_0_1px,transparent_2px)] [background-size:120px_120px,180px_180px,150px_150px]" />
      <section className="relative w-full max-w-[420px] rounded-[20px] border border-[rgba(245,158,11,0.2)] bg-[#0a0a14]/95 p-7 text-center shadow-2xl">
        <h1 className="font-heading text-[28px] font-extrabold text-[#F59E0B]">🎉 You&apos;re Activated!</h1>
        <p className="mt-3 text-sm text-white/55">Your referral link is ready. Share it to grow your team.</p>

        <div className="mt-7 rounded-xl border border-[rgba(245,158,11,0.3)] bg-[rgba(245,158,11,0.08)] p-4 text-left">
          <p className="break-all text-sm font-semibold text-white/85">{referralLink}</p>
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(referralLink);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1800);
            }}
            className="mt-4 w-full rounded-lg bg-[#F59E0B] px-4 py-3 text-sm font-extrabold text-black"
          >
            {copied ? "Copied ✓" : "Copy Link"}
          </button>
        </div>

        <a
          href="https://safepal.com/download"
          className="mt-5 block w-full rounded-xl bg-[#F59E0B] px-5 py-4 font-extrabold text-black"
        >
          📱 Download SafePal
        </a>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(`Join 7Universe with my link: ${referralLink}`)}`}
          className="mt-3 block w-full rounded-xl bg-[#25D366] px-5 py-4 font-extrabold text-white"
        >
          📤 Share on WhatsApp
        </a>
        <a href="https://wa.me/917591929909" className="mt-6 block text-sm text-white/45">
          Need help? Talk to your mentor →
        </a>
      </section>
    </main>
  );
}

