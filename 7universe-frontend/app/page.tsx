import Link from "next/link";

const steps = [
  "Create account in 30 seconds",
  "Listen to the 5 guided audios",
  "Connect SafePal and start sharing",
];

export default function UniverseLandingPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,#0d0020_0%,#000000_100%)] px-5 text-white">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between py-6">
        <div className="font-heading text-xl font-extrabold text-[#F59E0B]">7Universe</div>
        <Link
          href="/login"
          className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white/85 transition hover:border-[#F59E0B] hover:text-[#F59E0B]"
        >
          Login
        </Link>
      </header>

      <section className="mx-auto flex min-h-[calc(100vh-92px)] w-full max-w-xl flex-col items-center justify-center pb-20 text-center">
        <div className="mb-6 rounded-[20px] border border-[rgba(245,158,11,0.3)] bg-[rgba(245,158,11,0.08)] px-[14px] py-1 text-[11px] font-bold text-[#F59E0B]">
          Powered by OpBNB
        </div>
        <h1 className="whitespace-pre-line font-heading text-[40px] font-extrabold leading-[1.1] text-white md:text-6xl">
          {"Your 7-slot income system.\nStarts here."}
        </h1>
        <p className="mt-5 max-w-[340px] text-base text-white/55">
          Create your account, listen to the audios, connect SafePal, and start sharing.
        </p>

        <div className="mt-9 grid w-full max-w-[320px] gap-3">
          <Link
            href="/register"
            className="rounded-xl border-0 bg-[linear-gradient(135deg,#F59E0B,#D97706)] px-10 py-4 text-base font-extrabold text-black shadow-[0_8px_32px_rgba(245,158,11,0.3)] transition hover:-translate-y-0.5"
          >
            Create Account
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-white/15 px-10 py-4 text-base font-extrabold text-white transition hover:border-[#F59E0B] hover:text-[#F59E0B]"
          >
            Login Again
          </Link>
        </div>

        <div className="mt-16 grid w-full gap-5">
          {steps.map((step, index) => (
            <div key={step} className="flex flex-col items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F59E0B] text-sm font-extrabold text-black">
                {index + 1}
              </div>
              <p className="text-base font-semibold text-white/85">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <a
        href="https://wa.me/917591929909"
        className="fixed bottom-6 right-5 z-50 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#25D366] text-sm font-extrabold shadow-[0_4px_20px_rgba(37,211,102,0.4)]"
        aria-label="Chat on WhatsApp"
      >
        WA
      </a>
    </main>
  );
}
