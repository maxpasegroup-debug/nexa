"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const SAFEPAL_REFERRAL_LINK = "https://7universe.org?ref=9067";
const SAFEPAL_VIDEO_SRC = "/video/safepal-malayalam.mp4";

const VIDEOS = [
  {
    title: "How to use SafePal",
    src: SAFEPAL_VIDEO_SRC,
    desc: "Malayalam guide for connecting SafePal with 7Universe.",
  },
];

export default function ResourcesPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("universe_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    fetch("/api/universe/me", { headers: { Authorization: `Bearer ${token}` } }).then((response) => {
      if (!response.ok) {
        localStorage.removeItem("universe_token");
        router.replace("/login");
      }
    });
  }, [router]);

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,#0d0020_0%,#000000_100%)] px-5 py-6 text-white">
      <div className="mx-auto w-full max-w-xl pb-20">
        <header className="flex items-center gap-4">
          <Link href="/journey" className="text-2xl" aria-label="Back to journey">
            Back
          </Link>
          <h1 className="font-heading text-2xl font-extrabold">Business Videos</h1>
        </header>

        <section className="mt-8 rounded-[16px] border border-[rgba(245,158,11,0.25)] bg-[rgba(245,158,11,0.08)] p-5">
          <h2 className="text-xl font-bold text-white">Watch and explain simply</h2>
          <p className="mt-2 text-sm leading-6 text-white/55">
            These are support videos. The main training still starts with the audios in your dashboard.
          </p>
          <a
            href={SAFEPAL_REFERRAL_LINK}
            target="_blank"
            rel="noreferrer"
            className="mt-4 block rounded-xl bg-[#F59E0B] px-4 py-3 text-center font-extrabold text-black"
          >
            Connect SafePal Account
          </a>
        </section>

        <section className="mt-6 space-y-5">
          {VIDEOS.map((video) => (
            <article key={video.title} className="overflow-hidden rounded-[14px] border border-white/10 bg-white/[0.03]">
              <div className="aspect-video w-full bg-black">
                <video className="h-full w-full" controls preload="metadata" src={video.src} />
              </div>
              <div className="p-4">
                <h3 className="font-heading text-lg font-extrabold">{video.title}</h3>
                <p className="mt-1 text-sm text-white/50">{video.desc}</p>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
