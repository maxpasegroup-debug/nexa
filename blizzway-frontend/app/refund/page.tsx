import Link from "next/link";

const items = [
  "For beta, Blizzway payments should remain in manual or test mode unless live gateways are explicitly approved.",
  "If a live payment is enabled for a beta user, refund requests should be reviewed by the Blizzway/BGOS team against the payment record and wallet ledger.",
  "Duplicate credits, failed payment credits, or accidental beta charges should be escalated immediately and resolved through admin audit notes.",
  "Support target for beta refund/payment help: support@career7.in.",
];

export default function RefundPage() {
  return (
    <main className="c7-shell px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm font-black text-indigo-600">Blizzway</Link>
        <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950">Refunds</h1>
        <p className="mt-4 text-sm leading-7 c7-muted">
          This beta refund note is designed for controlled launch testing with wallet and payment safety first.
        </p>
        <div className="mt-8 grid gap-4">
          {items.map((item) => (
            <article key={item} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold leading-7 text-slate-700">{item}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
