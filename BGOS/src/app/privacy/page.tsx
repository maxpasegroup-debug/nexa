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
    title: "1. Scope",
    body: [
      `This Privacy Policy explains how ${companyName}, operating ${brandName}, collects, uses, stores, shares, and protects personal data and business information when you use our website, dashboards, onboarding flows, NEXA features, marketplace agents, support channels, and related services.`,
    ],
  },
  {
    title: "2. Information We Collect",
    body: [
      "We may collect account information such as name, email address, phone number, role, business name, billing details, plan information, and login activity.",
      "We may collect business data entered into BGOS, including leads, customer details, team members, tasks, notes, pipeline stages, communications, onboarding summaries, marketplace agent requirements, documents, and operational settings.",
      "We may collect technical information such as device details, IP address, browser type, pages visited, usage logs, cookies, diagnostics, and security events.",
    ],
  },
  {
    title: "3. How We Use Information",
    body: [
      "We use information to provide and improve BGOS, create and manage accounts, configure workspaces, process payments, deliver onboarding, support customers, send notifications, maintain security, analyze product usage, and comply with legal obligations.",
      "NEXA and AI-assisted features may process your business data to generate summaries, recommendations, reminders, insights, drafts, onboarding briefs, and workflow suggestions.",
    ],
  },
  {
    title: "4. Legal Basis and Consent",
    body: [
      "Where required by applicable law, we process personal data based on consent, contractual necessity, legitimate business interests, legal compliance, or protection of rights and security.",
      "By using BGOS or providing data through the platform, you confirm that you have the necessary rights, permissions, and notices to upload and process such data.",
    ],
  },
  {
    title: "5. Sharing and Processors",
    body: [
      "We do not sell personal data. We may share data with trusted service providers who help us operate BGOS, such as hosting providers, payment gateways, email providers, analytics tools, AI infrastructure, communication services, and support systems.",
      "We may disclose information where required by law, legal process, government request, fraud prevention, security investigation, enforcement of our terms, or protection of our rights and users.",
    ],
  },
  {
    title: "6. Payments",
    body: [
      "Payment information may be processed by third-party payment gateways such as Razorpay. BGOS does not store complete card, UPI, banking, or payment instrument details unless expressly shown and permitted through a compliant payment provider.",
    ],
  },
  {
    title: "7. Cookies and Tracking",
    body: [
      "We may use cookies, local storage, and similar technologies for login sessions, security, preferences, analytics, performance, and product improvement.",
      "You may manage cookies through your browser settings, but disabling necessary cookies may affect platform functionality.",
    ],
  },
  {
    title: "8. Data Security",
    body: [
      "We use reasonable technical and organizational safeguards to protect data, including access controls, authentication, monitoring, and secure infrastructure practices.",
      "No system is perfectly secure. You are responsible for using strong passwords, limiting user access, and promptly informing us about suspected unauthorized use.",
    ],
  },
  {
    title: "9. Data Retention",
    body: [
      "We retain data as long as needed to provide BGOS, maintain records, comply with legal obligations, resolve disputes, enforce agreements, support audits, and improve services.",
      "After account closure, some data may remain in backups, logs, invoices, legal records, or anonymized analytics for a reasonable period.",
    ],
  },
  {
    title: "10. Your Rights",
    body: [
      "Subject to applicable law, you may request access, correction, update, deletion, restriction, portability, or withdrawal of consent for personal data.",
      `To make a privacy request, contact us at ${contactEmail}. We may need to verify your identity and authority before acting on a request.`,
    ],
  },
  {
    title: "11. Children's Data",
    body: [
      "BGOS is intended for business use and is not directed to children. Users should not knowingly upload children's personal data unless they have lawful authority and a valid business requirement.",
    ],
  },
  {
    title: "12. International Processing",
    body: [
      "Some service providers may process data outside India. Where this occurs, we take reasonable steps to ensure appropriate contractual, technical, and organizational protections.",
    ],
  },
  {
    title: "13. Changes to This Policy",
    body: [
      "We may update this Privacy Policy from time to time. The updated version will be posted on this page with a revised date. Continued use of BGOS after changes means you accept the updated policy.",
    ],
  },
  {
    title: "14. Contact",
    body: [
      `Privacy questions and requests may be sent to ${contactEmail}. You may also write to ${companyName}, ${registeredAddress}.`,
    ],
  },
];

export const metadata: Metadata = {
  title: "Privacy Policy | BGOS",
  description: "Privacy Policy for BGOS by MIB - MAKE IT BEAUTIFUL LLP.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#070709] px-5 py-10 text-white md:px-10">
      <article className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm font-bold text-[#22D9A0] transition hover:text-white">
          Back to BGOS
        </Link>
        <header className="mt-8 border-b border-white/10 pb-8">
          <p className="text-xs uppercase tracking-[0.24em] text-[#7C6FFF]">Legal</p>
          <h1 className="mt-3 font-heading text-4xl font-extrabold md:text-5xl">
            Privacy Policy
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
