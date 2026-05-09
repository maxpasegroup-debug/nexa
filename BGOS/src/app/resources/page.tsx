"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const VIDEOS = [
  {
    title: "What is OpBNB?",
    url: "https://www.youtube.com/embed/QPn6BI3pM1Q",
    desc: "Understanding the blockchain behind 7Universe",
  },
  {
    title: "How SafePal Works",
    url: "https://www.youtube.com/embed/QPn6BI3pM1Q",
    desc: "Set up your wallet in minutes",
  },
  {
    title: "7 Slot Income Explained",
    url: "https://www.youtube.com/embed/_kgL1XDk0Yg",
    desc: "Visual breakdown of how earnings work",
  },
];

export default function ResourcesPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("universe_token");

    if (!token) {
      router.replace("/register");
      return;
    }

    fetch("/api/universe/me", { headers: { Authorization: `Bearer ${token}` } }).then((response) => {
      if (!response.ok) {
        localStorage.removeItem("universe_token");
        router.replace("/register");
      }
    });
  }, [router]);

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,#0d0020_0%,#000000_100%)] px-5 py-6 text-white">
      <div className="mx-auto w-full max-w-xl pb-20">
        <header className="flex items-center gap-4">
          <Link href="/journey" className="text-2xl" aria-label="Back to journey">
            ←
          </Link>
          <h1 className="font-heading text-2xl font-extrabold">Resources</h1>
        </header>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-white">Learn More</h2>
          <p className="mt-2 text-sm text-white/50">Explore these videos to understand 7Universe better.</p>
        </section>

        <section className="mt-6 space-y-5">
          {VIDEOS.map((video) => (
            <article key={video.title} className="overflow-hidden rounded-[14px] border border-white/10 bg-white/[0.03]">
              <div className="aspect-video w-full bg-black">
                <iframe
                  src={video.url}
                  title={video.title}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="p-4">
                <h3 className="font-heading text-lg font-extrabold">{video.title}</h3>
                <p className="mt-1 text-sm text-white/50">{video.desc}</p>
              </div>
            </article>
          ))}
        </section>
      </div>

      <a
        href="https://wa.me/917591929909"
        className="fixed bottom-6 right-5 z-50 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#25D366] text-2xl shadow-[0_4px_20px_rgba(37,211,102,0.4)]"
        aria-label="Chat on WhatsApp"
      >
        💬
      </a>
    </main>
  );
}
