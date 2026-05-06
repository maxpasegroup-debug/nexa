import type { Metadata } from "next";
import Link from "next/link";

const companyName = "MIB - MAKE IT BEAUTIFUL LLP";
const brandName = "BGOS";
const contactEmail = "hello@bgos.online";
const registeredAddress =
  "Registered office details are available on request";
const updatedAt = "May 3, 2026";

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: [
      `These Terms and Conditions govern access to and use of ${brandName}, including our website, dashboards, onboarding services, NEXA assistance, CRM tools, marketplace add-ons, communication features, and related services.`,
      `By creating an account, using ${brandName}, making a payment, or continuing to access the platform, you agree to these Terms on behalf of yourself and, where applicable, the business you represent.`,
    ],
  },
  {
    title: "2. About BGOS",
    body: [
      `${brandName} is operated by ${companyName}. Our registered address is ${registeredAddress}. You may contact us at ${contactEmail}.`,
      `${brandName} provides business operating software for growing businesses, including lead management, team workflows, dashboards, AI-assisted recommendations, onboarding, marketplace agents, and related business automation tools.`,
    ],
  },
  {
    title: "3. Eligibility and Account Responsibility",
    body: [
      "You must be legally capable of entering into a binding agreement and must provide accurate business, billing, and user information.",
      "You are responsible for maintaining the confidentiality of login credentials, controlling access for your team, and all actions performed through your account.",
    ],
  },
  {
    title: "4. Subscription, Setup, and Marketplace Services",
    body: [
      "BGOS may include subscription plans, one-time onboarding or setup fees, trial access, marketplace agent installations, and add-on services.",
      "Pricing, plan features, billing cycles, setup timelines, and add-on availability may be shown on the website, dashboard, invoice, payment page, or commercial proposal. Taxes, including applicable taxes, may be charged in addition to listed prices.",
    ],
  },
  {
    title: "5. Payments",
    body: [
      "Payments may be processed through third-party payment gateways such as Razorpay or other providers. By paying through a gateway, you also agree to that provider's applicable terms.",
      "Access to paid features, workspace activation, agent installation, or renewal may be restricted until payment is successfully received and verified.",
    ],
  },
  {
    title: "6. Customer Data and Lawful Use",
    body: [
      "You remain responsible for the accuracy, legality, ownership, and permitted use of all customer, employee, lead, communication, and business data uploaded to BGOS.",
      "You must not use BGOS for unlawful, misleading, abusive, fraudulent, spam, privacy-invasive, or unauthorized communication activities.",
    ],
  },
  {
    title: "7. AI and NEXA Outputs",
    body: [
      "NEXA and other AI-assisted features may generate recommendations, summaries, reminders, insights, drafts, or onboarding briefs based on available data.",
      "AI outputs are provided to support business decisions and workflows. You should review important outputs before relying on them, sending them externally, or using them for legal, financial, employment, or compliance decisions.",
    ],
  },
  {
    title: "8. Onboarding, Custom Builds, and Implementation",
    body: [
      "Custom workspace setup, onboarding, and marketplace agent integration depend on information provided by your team or BDM. Delays, incomplete information, incorrect requirements, or third-party dependency issues may affect delivery timelines.",
      "Unless expressly agreed otherwise, BGOS may configure, adapt, or improve platform workflows to match your business requirements without transferring ownership of platform source code or underlying intellectual property.",
    ],
  },
  {
    title: "9. Intellectual Property",
    body: [
      "BGOS, NEXA, platform design, software, workflows, trademarks, content, and underlying technology are owned by or licensed to MIB - MAKE IT BEAUTIFUL LLP.",
      "You receive a limited, non-exclusive, non-transferable right to use BGOS for your internal business operations during the active subscription or permitted access period.",
    ],
  },
  {
    title: "10. Service Availability and Changes",
    body: [
      "We aim to keep BGOS reliable, but we do not guarantee uninterrupted, error-free, or permanently available service.",
      "We may update, improve, suspend, restrict, or discontinue parts of the platform for maintenance, security, legal, business, or product reasons.",
    ],
  },
  {
    title: "11. Limitation of Liability",
    body: [
      "To the maximum extent permitted by law, BGOS and MIB - MAKE IT BEAUTIFUL LLP will not be liable for indirect, incidental, special, consequential, punitive, or loss-of-profit damages arising from use of the platform.",
      "Our total liability for any claim related to BGOS will not exceed the amount paid by you to BGOS for the affected service during the three months preceding the claim.",
    ],
  },
  {
    title: "12. Termination",
    body: [
      "We may suspend or terminate access if you breach these Terms, misuse the platform, fail to pay applicable charges, create security risk, or use BGOS in a way that may harm customers, users, partners, or the platform.",
      "You may stop using BGOS at any time. Fees already paid are handled according to our Refund Policy.",
    ],
  },
  {
    title: "13. Governing Law and Jurisdiction",
    body: [
      "These Terms are governed by the applicable laws. Subject to applicable law, courts having jurisdiction over the applicable jurisdiction will have jurisdiction over disputes arising from these Terms or use of BGOS.",
    ],
  },
  {
    title: "14. Contact",
    body: [
      `For questions about these Terms, contact ${companyName} at ${contactEmail} or write to ${registeredAddress}.`,
    ],
  },
];

export const metadata: Metadata = {
  title: "Terms and Conditions | BGOS",
  description: "Terms and Conditions for BGOS by MIB - MAKE IT BEAUTIFUL LLP.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#070709] px-5 py-10 text-white md:px-10">
      <article className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm font-bold text-[#22D9A0] transition hover:text-white">
          Back to BGOS
        </Link>
        <header className="mt-8 border-b border-white/10 pb-8">
          <p className="text-xs uppercase tracking-[0.24em] text-[#7C6FFF]">Legal</p>
          <h1 className="mt-3 font-heading text-4xl font-extrabold md:text-5xl">
            Terms and Conditions
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
