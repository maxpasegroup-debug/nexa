import Link from "next/link";

import { AuthShell, TextField } from "../auth-shared";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Recover your pathway access"
      description="Enter your email to preview the password recovery flow. NEXA keeps this moment calm, and no real reset email is sent yet."
      sideTitle="A calm reset for a trusted career workspace."
      sideDescription="Blizzway and NEXA, the Guardian Angel AI, keep recovery simple, reassuring, and clear so students, parents, and professionals feel safe returning."
      highlights={[
        "Placeholder recovery only",
        "NEXA Guardian Angel reassurance",
        "No backend email delivery yet",
      ]}
      footerNote="Recovery preview only. Real auth and email delivery arrive later."
    >
      <form action="/login" className="mt-6 space-y-4">
        <TextField label="Email address" type="email" placeholder="you@example.com" />
        <button type="submit" className="c7-button-primary w-full">
          Show recovery preview
        </button>
      </form>

      <div className="mt-6 flex flex-col gap-2 text-center text-sm sm:flex-row sm:justify-center">
        <Link href="/login" className="font-bold text-indigo-600 hover:text-indigo-700">
          Back to login
        </Link>
        <span className="hidden c7-muted sm:inline">/</span>
        <Link href="/signup" className="font-bold text-indigo-600 hover:text-indigo-700">
          Begin My Pathway
        </Link>
      </div>
    </AuthShell>
  );
}
