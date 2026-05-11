import Link from "next/link";

const items = [
  "Blizzway uses BGOS to manage authentication, workspace data, wallet credits, onboarding, BDP, companions, NEXA guidance, and beta feedback.",
  "Beta users should not store passwords, payment card details, government ID numbers, medical records, or other highly sensitive secrets in free-text fields.",
  "Workspace data is scoped to the signed-in user and Blizzway business context. Internal admin access is limited to authorized BGOS operators.",
  "Support requests may be reviewed by the Blizzway/BGOS team to resolve account, wallet, or product issues during beta.",
];

export default function PrivacyPage() {
  return (
    <main className="c7-shell px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm font-black text-indigo-600">Blizzway</Link>
        <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950">Privacy</h1>
        <p className="mt-4 text-sm leading-7 c7-muted">
          This beta privacy note explains how Blizzway handles launch-stage career pathway data on blizzway.com.
        </p>
        <div className="mt-8 grid gap-4">
          {items.map((item) => (
            <article key={item} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold leading-7 text-slate-700">{item}</p>
            </article>
          ))}
        </div>
        <p className="mt-8 text-sm font-semibold c7-muted">Support: support@blizzway.com</p>
      </section>
    </main>
  );
}
