"use client";

import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import { Eye, EyeOff, HelpCircle } from "lucide-react";
import { getSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

import { MobileSheet } from "@/components/mobile/mobile-sheet";
import { getRedirectForRole, isBossRole, isEmployeeRole } from "@/lib/domain";

export default function MobileIceLanding() {
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);
  const loginRef = useRef<HTMLFormElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      setLoading(false);
      setError("Invalid email or password.");
      return;
    }

    const session = await getSession();
    const role = session?.user?.role as string | undefined;
    if (role && isBossRole(role)) {
      await signOut({ redirect: false });
      setLoading(false);
      setError("This portal is for employees. Please use bgos.online.");
      return;
    }
    if (role && isEmployeeRole(role)) {
      router.push(getRedirectForRole(role));
      router.refresh();
      return;
    }
    setLoading(false);
    setError("Unable to verify your workspace access. Please try again.");
  }

  function focusLogin() {
    loginRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => emailRef.current?.focus(), 350);
  }

  return (
    <main className="min-h-screen bg-[#070709] pb-[88px] text-[#F0EEF8]">
      <header className="sticky top-0 z-40 flex h-[52px] items-center justify-between border-b border-white/[0.07] bg-[#070709]/95 px-4 backdrop-blur-xl">
        <Link href="/" className="font-heading text-xl font-extrabold">
          <span className="text-white">ice</span>
          <span className="text-[#22D9A0]">connect</span>
        </Link>
        <button type="button" onClick={() => setHelpOpen(true)} className="touch-target flex items-center justify-center rounded-xl text-[#6B6878]" aria-label="Help">
          <HelpCircle className="h-5 w-5" />
        </button>
      </header>

      <section className="px-4 pb-8 pt-9" style={{ background: "radial-gradient(ellipse at top right, rgba(34,217,160,0.08), transparent 62%)" }}>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#22D9A0]/80">Employee workspace · BGOS</p>
        <h1 className="mt-4 font-heading text-[32px] font-extrabold leading-[1.08] tracking-[-1px]">
          Your workspace, <span className="text-[#22D9A0]">always ready.</span>
        </h1>
        <p className="mt-3 text-sm font-light leading-6 text-[#6B6878]">
          Your leads, tasks, and daily brief — in one place.
        </p>

        <form ref={loginRef} onSubmit={handleSubmit} className="mt-6 rounded-[20px] border border-white/[0.08] bg-[#13131c] p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#6B6878]">Sign in to your workspace</p>
          {error ? <p className="mt-4 rounded-xl border border-[#FF6B6B]/30 bg-[#FF6B6B]/10 px-3 py-2 text-sm text-[#FF6B6B]">{error}</p> : null}
          <div className="mt-4 space-y-3">
            <input ref={emailRef} type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="your.email@company.com" autoComplete="email" required className="w-full rounded-xl border border-white/[0.08] bg-[#0f0f14] px-[14px] py-[13px] text-[15px] outline-none placeholder:text-[#6B6878] focus:border-[#22D9A0]/40" />
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Your password" autoComplete="current-password" required className="w-full rounded-xl border border-white/[0.08] bg-[#0f0f14] px-[14px] py-[13px] pr-12 text-[15px] outline-none placeholder:text-[#6B6878] focus:border-[#22D9A0]/40" />
              <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center text-[#6B6878]" aria-label="Toggle password visibility">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="mt-4 h-[50px] w-full rounded-xl bg-[#22D9A0] font-heading text-[15px] font-extrabold text-[#070709] disabled:opacity-60">
            {loading ? "Signing in..." : "Sign in →"}
          </button>
          <Link href="/forgot-password" className="mt-4 block text-center text-xs text-[#6B6878]">Forgot password?</Link>
        </form>

        <section className="mt-7">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#6B6878]">Your workspace</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-[#22D9A0]/20 bg-[#13131c] p-4">
              <p className="text-xl">📞</p>
              <h2 className="mt-3 font-heading text-[13px] font-extrabold text-[#22D9A0]">Sales Team</h2>
              <p className="mt-1 text-[11px] leading-5 text-[#6B6878]">Leads · Pipeline · Earnings · Targets</p>
            </div>
            <div className="rounded-2xl border border-[#7C6FFF]/20 bg-[#13131c] p-4">
              <p className="text-xl">💻</p>
              <h2 className="mt-3 font-heading text-[13px] font-extrabold text-[#7C6FFF]">Tech Team</h2>
              <p className="mt-1 text-[11px] leading-5 text-[#6B6878]">Tasks · Bugs · Sprints · Builds</p>
            </div>
          </div>
        </section>

        <p className="mt-7 text-center text-xs text-[#6B6878]">
          Not an employee? <a href="https://bgos.online" className="font-bold text-[#7C6FFF]">Visit bgos.online →</a>
        </p>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-[#070709]/95 px-4 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl">
        <button type="button" onClick={focusLogin} className="h-12 w-full rounded-[14px] bg-gradient-to-br from-[#22D9A0] to-[#63F2BF] font-heading text-sm font-extrabold text-[#070709]">
          Sign in to your workspace →
        </button>
      </div>

      <MobileSheet isOpen={helpOpen} onClose={() => setHelpOpen(false)} title="Help" height="auto">
        <div className="space-y-4 text-sm leading-6 text-[#6B6878]">
          <p><span className="font-bold text-white">Who can sign in?</span><br />Only employees invited by their company admin.</p>
          <p><span className="font-bold text-white">Forgot your password?</span><br />Use the forgot password link or ask your manager to reset it.</p>
          <p><span className="font-bold text-white">Need support?</span><br />Email support@iceconnect.in.</p>
        </div>
      </MobileSheet>
    </main>
  );
}
