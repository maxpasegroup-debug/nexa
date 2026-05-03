import type { Metadata } from "next";
import Link from "next/link";

const companyName = "MIB - MAKE IT BEAUTIFUL LLP";
const brandName = "BGOS";
const contactEmail = "hello@bgos.online";
const registeredAddress =
  "Suite No. A74, Door No. 63/700, D Space, 6th Floor, Sky Tower, Mavoor Road Junction, Bank Road, Kozhikode-673001, Kerala, India";
const updatedAt = "May 3, 2026";

const sections = [
  {
    title: "1. Purpose",
    body: [
      `This Refund Policy explains how refunds, cancellations, trial conversions, onboarding fees, subscription fees, marketplace agent fees, and payment disputes are handled for ${brandName}, operated by ${companyName}.`,
    ],
  },
  {
    title: "2. General Refund Position",
    body: [
      "BGOS is a digital software and services platform. Fees paid for activated subscriptions, completed onboarding work, configured workspaces, marketplace agent setup, and consumed services are generally non-refundable except as expressly stated in this policy or required by law.",
      "Refund decisions may depend on service status, payment date, usage, configuration work performed, third-party costs, taxes, and whether the issue was caused by BGOS.",
    ],
  },
  {
    title: "3. Free Trials and Early Access",
    body: [
      "If BGOS offers a free trial or early access period, you may stop using the service before paid activation without being charged unless you separately purchase a paid plan, setup, add-on, or marketplace service.",
      "Trial features, duration, and conversion rules may vary by plan or offer.",
    ],
  },
  {
    title: "4. Subscription Fees",
    body: [
      "Subscription fees are billed in advance for the selected period. Once a billing period starts and access is made available, subscription fees are generally non-refundable.",
      "You may request cancellation of future renewals. Cancellation stops future billing but does not automatically refund the current active billing period.",
    ],
  },
  {
    title: "5. Onboarding and Setup Fees",
    body: [
      "One-time onboarding, workspace setup, implementation, customization, or marketplace agent setup fees are charged for planning, configuration, technical work, team effort, and delivery.",
      "These fees are non-refundable once onboarding, configuration, requirements analysis, workspace creation, agent integration, or implementation work has started.",
    ],
  },
  {
    title: "6. Marketplace Agent Installations",
    body: [
      "Marketplace agent payments may include a setup/onboarding component and a first-month subscription component. The setup/onboarding component is non-refundable once the integration process begins.",
      "If BGOS is unable to start or deliver a paid marketplace agent due solely to a BGOS-side issue, we may offer correction, replacement, account credit, or refund at our discretion.",
    ],
  },
  {
    title: "7. Duplicate, Failed, or Incorrect Payments",
    body: [
      "If you are charged twice for the same transaction, charged incorrectly, or money is debited for a failed payment that is not automatically reversed by the payment provider, contact us with payment proof.",
      "Valid duplicate or erroneous payments will be refunded to the original payment method where feasible, subject to payment gateway timelines and deductions required by law or payment providers.",
    ],
  },
  {
    title: "8. Refund Request Window",
    body: [
      `Refund requests should be emailed to ${contactEmail} within 7 days of the transaction date, unless a longer period is required by applicable law.`,
      "Your request should include business name, registered email or phone number, invoice or order ID, payment date, amount, reason for refund, and supporting screenshots or documents.",
    ],
  },
  {
    title: "9. Processing Timelines",
    body: [
      "Approved refunds are normally initiated within 7 to 10 business days after verification. The time for the amount to reflect in your account depends on your bank, card issuer, UPI provider, or payment gateway.",
      "Gateway charges, taxes, bank charges, or already-incurred third-party costs may be deducted where applicable and lawful.",
    ],
  },
  {
    title: "10. Non-Refundable Situations",
    body: [
      "Refunds will generally not be issued for change of mind, non-use after activation, incomplete information provided by the customer, delays caused by customer-side dependencies, third-party tool limitations, misuse, breach of terms, or features that were delivered as described.",
      "Refunds are also not guaranteed for custom requests, implementation work, or configuration already performed based on approved requirements.",
    ],
  },
  {
    title: "11. Service Credits and Corrections",
    body: [
      "Where appropriate, BGOS may offer service correction, additional support, replacement configuration, extension of access, or account credit instead of a cash refund.",
    ],
  },
  {
    title: "12. Contact",
    body: [
      `For refund or billing questions, contact ${contactEmail}. You may also write to ${companyName}, ${registeredAddress}.`,
    ],
  },
];

export const metadata: Metadata = {
  title: "Refund Policy | BGOS",
  description: "Refund Policy for BGOS by MIB - MAKE IT BEAUTIFUL LLP.",
};

export default function RefundPage() {
  return (
    <main className="min-h-screen bg-[#070709] px-5 py-10 text-white md:px-10">
      <article className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm font-bold text-[#22D9A0] transition hover:text-white">
          Back to BGOS
        </Link>
        <header className="mt-8 border-b border-white/10 pb-8">
          <p className="text-xs uppercase tracking-[0.24em] text-[#7C6FFF]">Legal</p>
          <h1 className="mt-3 font-heading text-4xl font-extrabold md:text-5xl">
            Refund Policy
          </h1>
          <p className="mt-4 text-sm text-[#A5A1B3]">Last updated: {updatedAt}</p>
        </header>

        <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-6 text-[#D8D5E2]">
          <p>
            Operator: <strong className="text-white">{companyName}</strong>
          </p>
          <p className="mt-2">Registered address: {registeredAddress}</p>
          <p className="mt-2">
            Email:{" "}
            <a className="text-[#22D9A0]" href={`mailto:${contactEmail}`}>
              {contactEmail}
            </a>
          </p>
        </div>

        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="font-heading text-xl font-bold text-white">{section.title}</h2>
              <div className="mt-3 space-y-3 text-sm leading-7 text-[#C9C5D8]">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
