import Link from "next/link";
import { getApiBaseUrl } from "@/lib/api";

import { AuthShell, TextField } from "../auth-shared";

export default function SignupPage() {
  const signupUrl = new URL("/register", getApiBaseUrl());
  signupUrl.searchParams.set("businessModel", "career7");

  return (
    <AuthShell
      eyebrow="NEXA onboarding"
      title="Create your Career7 account"
      description="Create your Career7 account through BGOS authentication."
      sideTitle="Meet NEXA before your first career move."
      sideDescription="NEXA will learn your goals, recommend your first Growth Board, and introduce the best agents for your path."
      highlights={["Career profile setup", "Growth Board personalization", "Starter credits walkthrough"]}
    >
      <div className="mt-6 space-y-4">
        <TextField label="Full name" placeholder="Your name" />
        <TextField label="Email address" type="email" placeholder="you@example.com" />
        <TextField label="Password" type="password" placeholder="Create a password" />

        <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
          <p className="text-sm font-black text-indigo-700">NEXA onboarding preview</p>
          <p className="mt-1 text-sm leading-6 text-indigo-700/75">
            After signup, NEXA will ask about your goals, current stage, skills, and preferred growth path.
          </p>
        </div>

        <Link href={signupUrl.toString()} className="c7-button-primary block w-full text-center">
          Create preview account
        </Link>
      </div>

      <p className="mt-6 text-center text-sm c7-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-indigo-600 hover:text-indigo-700">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
