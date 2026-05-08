import Link from "next/link";

import { AuthShell, TextField } from "../auth-shared";

export default function SignupPage() {
  return (
    <AuthShell
      eyebrow="Begin with NEXA"
      title="Create your Blizzway pathway"
      description="Step into a premium AI career ecosystem. This signup is a placeholder preview, with real auth arriving later."
      sideTitle="Meet NEXA before your first career move."
      sideDescription="NEXA is the Guardian Angel AI who learns your dream, understands your stage, and helps shape your magical career pathway."
      highlights={[
        "Personal pathway preview",
        "Learning Garden and Earning Universe guidance",
        "Soul Vault for confidence, proof, and reflection",
      ]}
    >
      <form action="/onboarding" className="mt-6 space-y-4">
        <TextField label="Full name" placeholder="Your name" />
        <TextField label="Email address" type="email" placeholder="you@example.com" />
        <TextField label="Password" type="password" placeholder="Create a password" />

        <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
          <p className="text-sm font-black text-indigo-700">NEXA onboarding preview</p>
          <p className="mt-1 text-sm leading-6 text-indigo-700/75">
            After this preview, NEXA will ask about your current stage, dream goal, and long-term vision.
          </p>
        </div>

        <button type="submit" className="c7-button-primary w-full">
          Begin My Pathway
        </button>
      </form>

      <p className="mt-6 text-center text-sm c7-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-indigo-600 hover:text-indigo-700">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
