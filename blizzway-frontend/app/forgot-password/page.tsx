import Link from "next/link";

import { AuthShell, TextField } from "../auth-shared";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Recover your pathway access"
      description="Enter your email to start the beta recovery flow. NEXA keeps this moment calm and clear."
      sideTitle="A calm reset for a trusted career workspace."
      sideDescription="Blizzway and NEXA, the Guardian Angel AI, keep recovery simple, reassuring, and clear so students, parents, and professionals feel safe returning."
      highlights={[
        "Beta recovery flow",
        "NEXA Guardian Angel reassurance",
        "Support-assisted reset ready",
      ]}
      footerNote="For beta, support may verify and assist account recovery if automated email is unavailable."
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
