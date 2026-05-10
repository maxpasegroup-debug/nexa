"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

type Mode = "checking" | "login" | "register";

function PinBoxes({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const digits = value.padEnd(4, " ").slice(0, 4).split("");

  return (
    <label className="block">
      <span className="mb-3 block text-sm font-semibold text-white/80">{label}</span>
      <button
        type="button"
        onClick={() => inputRef.current?.focus()}
        className="grid w-full grid-cols-4 gap-3"
        aria-label={label}
      >
        {digits.map((digit, index) => (
          <span
            key={index}
            className="flex h-14 items-center justify-center rounded-xl border border-white/10 bg-black/30 text-2xl font-extrabold text-white"
          >
            {digit.trim() ? "*" : ""}
          </span>
        ))}
      </button>
      <input
        ref={inputRef}
        value={value}
        onChange={(event) => onChange(event.target.value.replace(/\D/g, "").slice(0, 4))}
        inputMode="numeric"
        autoComplete="one-time-code"
        className="sr-only"
        maxLength={4}
      />
    </label>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref") ?? "";
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [mode, setMode] = useState<Mode>("register");
  const [knownName, setKnownName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const normalizedPhone = useMemo(() => `${countryCode}${phone.replace(/\D/g, "")}`, [countryCode, phone]);

  useEffect(() => {
    const digits = phone.replace(/\D/g, "");

    if (digits.length < 10) {
      setMode("register");
      setKnownName("");
      return;
    }

    const timeout = window.setTimeout(async () => {
      setMode("checking");
      try {
        const response = await fetch("/api/universe/me", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: normalizedPhone }),
        });
        const data = (await response.json()) as { exists: boolean; user?: { name?: string } };

        setMode(data.exists ? "login" : "register");
        setKnownName(data.user?.name ?? "");
      } catch {
        setMode("register");
      }
    }, 450);

    return () => window.clearTimeout(timeout);
  }, [normalizedPhone, phone]);

  async function submit() {
    setMessage("");
    setLoading(true);

    try {
      const isLogin = mode === "login";

      if (!isLogin && (!name.trim() || pin !== confirmPin)) {
        setMessage(pin !== confirmPin ? "PIN confirmation does not match." : "Enter your name.");
        return;
      }

      if (!/^\d{4}$/.test(pin)) {
        setMessage("Enter a 4-digit PIN.");
        return;
      }

      const response = await fetch(isLogin ? "/api/universe/login" : "/api/universe/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: normalizedPhone,
          pin,
          name,
          referredBy: ref,
          language: "ml",
        }),
      });
      const data = (await response.json()) as { token?: string; error?: string };

      if (!response.ok || !data.token) {
        setMessage(data.error ?? "Something went wrong.");
        return;
      }

      localStorage.setItem("universe_token", data.token);
      router.push("/journey");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,#0d0020_0%,#000000_100%)] px-5 py-10 text-white">
      <section className="w-full max-w-[400px] rounded-[20px] border border-[rgba(245,158,11,0.15)] bg-[#0a0a14] p-8 shadow-2xl">
        <div className="mb-7 text-center">
          <h1 className="font-heading text-3xl font-extrabold text-[#F59E0B]">Join 7Universe</h1>
          <p className="mt-2 text-sm text-white/50">Phone number, name, and one simple 4-digit PIN.</p>
        </div>

        <div className="mb-5 flex overflow-hidden rounded-xl border border-white/10 bg-black/20">
          <select
            value={countryCode}
            onChange={(event) => setCountryCode(event.target.value)}
            className="w-[118px] border-r border-white/10 bg-transparent px-3 py-4 text-sm font-bold outline-none"
          >
            <option className="bg-[#0a0a14]" value="+91">
              India +91
            </option>
          </select>
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))}
            inputMode="tel"
            placeholder="Phone number"
            className="min-w-0 flex-1 bg-transparent px-4 py-4 text-base outline-none placeholder:text-white/30"
          />
        </div>

        {mode === "checking" ? (
          <p className="text-center text-sm text-white/50">Checking number...</p>
        ) : mode === "login" ? (
          <div className="space-y-5">
            <p className="text-sm text-white/70">Welcome back{knownName ? `, ${knownName}` : ""}. Enter your PIN.</p>
            <PinBoxes label="Welcome back. Enter your PIN." value={pin} onChange={setPin} />
          </div>
        ) : (
          <div className="space-y-5">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Name"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-4 outline-none placeholder:text-white/30"
            />
            <PinBoxes label="Create a 4-digit PIN" value={pin} onChange={setPin} />
            <PinBoxes label="Confirm PIN" value={confirmPin} onChange={setConfirmPin} />
            <p className="text-xs text-white/45">Your number is your identity. We never share it.</p>
          </div>
        )}

        {message ? <p className="mt-5 text-sm text-amber-300">{message}</p> : null}

        <button
          type="button"
          onClick={submit}
          disabled={loading || mode === "checking" || phone.length < 10}
          className="mt-7 w-full rounded-xl bg-[linear-gradient(135deg,#F59E0B,#D97706)] px-5 py-4 text-base font-extrabold text-black shadow-[0_8px_32px_rgba(245,158,11,0.25)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Please wait..." : mode === "login" ? "Continue" : "Create Account"}
        </button>

        <p className="mt-6 text-center text-sm text-white/45">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-[#F59E0B]">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,#0d0020_0%,#000000_100%)] px-5 py-10 text-white">
          <section className="w-full max-w-[400px] rounded-[20px] border border-[rgba(245,158,11,0.15)] bg-[#0a0a14] p-8 text-center">
            <h1 className="font-heading text-3xl font-extrabold text-[#F59E0B]">Join 7Universe</h1>
          </section>
        </main>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
