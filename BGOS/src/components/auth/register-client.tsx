"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";

import type { AuthBusinessModel } from "@/lib/auth-business-model";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  form?: string;
};

function validateForm(
  name: string,
  email: string,
  password: string,
  confirmPassword: string,
) {
  const errors: FieldErrors = {};

  if (!name.trim()) errors.name = "Name is required.";
  if (!email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^\S+@\S+\.\S+$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!password) {
    errors.password = "Password is required.";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Confirm your password.";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

export function RegisterClient({ businessModel }: { businessModel: AuthBusinessModel }) {
  const router = useRouter();
  const isCareer7 = businessModel === "career7";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validateForm(name, email, password, confirmPassword);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, businessModel }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setErrors({ form: data?.error || "Unable to create your account." });
      setLoading(false);
      return;
    }

    const signInResult = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (signInResult?.error) {
      setErrors({ form: "Your account was created, but sign in failed. Please log in." });
      return;
    }

    router.push(isCareer7 ? "/career7/dashboard" : "/onboarding");
    router.refresh();
  }

  return (
    <main className={`flex min-h-screen items-center justify-center px-4 py-10 font-sans ${isCareer7 ? "bg-[#f8f9fd]" : "bg-[#070709]"}`}>
      <section className={`w-full max-w-md rounded-2xl border p-8 shadow-2xl ${isCareer7 ? "border-indigo-100 bg-white shadow-slate-200/60" : "border-white/10 bg-[#13131c] shadow-black/30"}`}>
        <div className="text-center font-heading text-4xl font-bold tracking-normal">
          {isCareer7 ? (
            <>
              <span className="text-[#101633]">Career</span>
              <span className="text-indigo-600">7</span>
            </>
          ) : (
            <>
              <span className="text-white">B</span>
              <span className="text-[#7C6FFF]">GOS</span>
            </>
          )}
        </div>
        <div className="mt-8 space-y-2 text-center">
          <h1 className={`font-heading text-2xl font-bold tracking-normal ${isCareer7 ? "text-[#101633]" : "text-white"}`}>
            Create your account
          </h1>
          <p className={isCareer7 ? "text-sm text-slate-500" : "text-sm text-zinc-400"}>
            {isCareer7 ? "Start your Career7 growth workspace with BGOS auth." : "Start with a boss account for your business."}
          </p>
        </div>

        {errors.form ? (
          <p className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {errors.form}
          </p>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" name="name" type="text" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} error={errors.name} />
          <Input label="Email" name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} error={errors.email} />
          <Input label="Password" name="password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} error={errors.password} />
          <Input label="Confirm password" name="confirmPassword" type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} error={errors.confirmPassword} />
          <Button type="submit" fullWidth loading={loading}>
            Create account
          </Button>
        </form>

        <p className={isCareer7 ? "mt-6 text-center text-sm text-slate-500" : "mt-6 text-center text-sm text-zinc-400"}>
          Already have an account?{" "}
          <Link href={isCareer7 ? "/login?businessModel=career7" : "/login"} className={isCareer7 ? "font-medium text-indigo-600 hover:text-indigo-500" : "font-medium text-[#7C6FFF] hover:text-[#9a91ff]"}>
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
