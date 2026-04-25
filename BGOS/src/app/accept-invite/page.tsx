"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormEvent, Suspense, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type InviteDetails = {
  name: string;
  email: string;
  role: "BDM" | "SDE" | "BOSS" | "ADMIN";
  accepted: boolean;
  businessName: string;
  invitedBy: string;
};

function dashboardPathForRole(role: InviteDetails["role"]) {
  if (role === "SDE") {
    return "/sde";
  }

  if (role === "BDM") {
    return "/bdm";
  }

  return "/boss";
}

function AcceptInviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [invite, setInvite] = useState<InviteDetails | null>(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInvite() {
      if (!token) {
        setError("Invite token is missing.");
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/onboarding/invite?token=${token}`);

      if (!response.ok) {
        setError("This invite is invalid or expired.");
        setLoading(false);
        return;
      }

      const data = (await response.json()) as { invite: InviteDetails };
      setInvite(data.invite);
      setName(data.invite.name);
      setLoading(false);
    }

    void loadInvite();
  }, [token]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!invite || !token) {
      setError("Invite details are missing.");
      return;
    }

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    const response = await fetch("/api/onboarding/invite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, name, password }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error || "Unable to accept invite.");
      setSubmitting(false);
      return;
    }

    const signInResult = await signIn("credentials", {
      email: invite.email,
      password,
      redirect: false,
    });

    setSubmitting(false);

    if (signInResult?.error) {
      setError("Account created, but sign in failed. Please log in.");
      return;
    }

    router.push(dashboardPathForRole(invite.role));
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#070709] px-4 py-10 font-sans text-white">
      <section className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#13131c] p-8 shadow-2xl shadow-black/30">
        <div className="text-center font-heading text-4xl font-bold tracking-normal">
          <span className="text-white">B</span>
          <span className="text-[#7C6FFF]">GOS</span>
        </div>

        {loading ? (
          <p className="mt-8 text-center text-sm text-zinc-400">
            Loading invite...
          </p>
        ) : invite ? (
          <>
            <div className="mt-8 space-y-3 text-center">
              <h1 className="font-heading text-2xl font-bold tracking-normal">
                Join {invite.businessName}
              </h1>
              <p className="text-sm leading-6 text-zinc-400">
                {invite.invitedBy} invited you to BGOS as{" "}
                <span className="font-semibold text-[#b8b2ff]">
                  {invite.role}
                </span>
                .
              </p>
            </div>

            {invite.accepted ? (
              <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                This invite has already been accepted.{" "}
                <Link href="/login" className="font-semibold underline">
                  Sign in
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <Input
                  label="Email"
                  name="email"
                  value={invite.email}
                  disabled
                />
                <Input
                  label="Name"
                  name="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
                <Input
                  label="Password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <Input
                  label="Confirm password"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
                {error ? <p className="text-sm text-red-400">{error}</p> : null}
                <Button type="submit" fullWidth loading={submitting}>
                  Accept invite
                </Button>
              </form>
            )}
          </>
        ) : (
          <p className="mt-8 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}
      </section>
    </main>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense>
      <AcceptInviteForm />
    </Suspense>
  );
}
