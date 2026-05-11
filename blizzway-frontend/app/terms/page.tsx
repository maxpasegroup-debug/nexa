import Link from "next/link";

const items = [
  "Blizzway beta access is provided for guided testing, feedback, and controlled launch validation.",
  "NEXA, companions, assessments, admissions guidance, and wallet flows provide preparation support. They do not guarantee jobs, admissions, scholarships, visas, income, or financial outcomes.",
  "Users are responsible for verifying admissions, migration, financial, legal, or career decisions with qualified experts or official sources.",
  "Blizzway may pause beta access, payment flows, or selected features to protect user data, wallet integrity, or platform stability.",
];

export default function TermsPage() {
  return (
    <main className="c7-shell px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm font-black text-indigo-600">Blizzway</Link>
        <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950">Terms</h1>
        <p className="mt-4 text-sm leading-7 c7-muted">
          These beta terms keep expectations clear while Blizzway is tested with a controlled user group.
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
