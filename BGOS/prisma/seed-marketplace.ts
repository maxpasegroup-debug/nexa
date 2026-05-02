import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const agents = [
    {
      slug: "sales-booster",
      name: "Sales Booster",
      tagline: "Every lead. One dashboard.",
      description: "WhatsApp, Instagram, Facebook, Email, and SMS - all managed by NEXA in one place. Never miss a lead from any channel again.",
      category: "UNIVERSAL",
      type: "BACKGROUND",
      icon: "⚡",
      colorPrimary: "#7C6FFF",
      colorSecondary: "#22D9A0",
      gradient: "linear-gradient(135deg,#0d0820,#050d15)",
      onboardingFee: 5999,
      monthlyFee: 1499,
      isFeatured: true,
      sortOrder: 1,
      features: ["WhatsApp Business API", "Instagram DM automation", "Facebook lead forms", "Email inbox aggregation", "SMS campaigns", "NEXA lead scoring", "Outbound campaign manager", "Source analytics", "Auto-reply templates", "One CRM pipeline"],
      benefits: [
        { icon: "🚫", title: "Zero missed leads", desc: "Every enquiry from every platform captured automatically." },
        { icon: "⏰", title: "Instant response", desc: "NEXA auto-replies within seconds. Leads get acknowledged immediately." },
        { icon: "📈", title: "Source analytics", desc: "Know which channel brings your best leads. Spend smarter on ads." },
        { icon: "🤖", title: "NEXA manages campaigns", desc: "Broadcast on WhatsApp, run Instagram DM campaigns, send email sequences." },
        { icon: "🔗", title: "One pipeline", desc: "All leads flow into your BGOS CRM regardless of source." },
        { icon: "🛠️", title: "Set up by our team", desc: "Our SDE team handles all API connections. Ready in 24 hours." }
      ],
      howItWorks: [
        { step: "01", icon: "🔌", title: "We connect your channels", desc: "Our SDE team connects WhatsApp Business, Instagram, Facebook, email, and SMS. All authorised and tested." },
        { step: "02", icon: "⚡", title: "NEXA aggregates all leads", desc: "Every enquiry from every channel flows into your Sales Booster dashboard automatically." },
        { step: "03", icon: "🎯", title: "NEXA scores and assigns", desc: "NEXA scores every lead by quality, assigns them to your team, and sends follow-up reminders." },
        { step: "04", icon: "📊", title: "Track everything", desc: "See which channel brings the best leads, response times, and conversion by source." }
      ]
    },
    {
      slug: "wazzup",
      name: "Wazzup",
      tagline: "Run your business on WhatsApp.",
      description: "NEXA lives in your WhatsApp. Manage your team, track leads, get daily briefings, and approve tasks - all without opening a laptop.",
      category: "UNIVERSAL",
      type: "BACKGROUND",
      icon: "💬",
      colorPrimary: "#25D366",
      colorSecondary: "#128C7E",
      gradient: "linear-gradient(135deg,#0d1a0f,#050a08)",
      onboardingFee: 3999,
      monthlyFee: 999,
      isFeatured: false,
      sortOrder: 2,
      features: ["NEXA on WhatsApp 24/7", "Daily morning briefing", "Lead updates and alerts", "Task approval over WhatsApp", "Team performance updates", "Send follow-ups by asking NEXA", "Health score updates", "Instant escalation alerts"]
    },
    {
      slug: "taxmate",
      name: "TaxMate",
      tagline: "GST, TDS, invoices - all on autopilot.",
      description: "Every Indian compliance requirement automated and never missed. TaxMate handles GST filing reminders, TDS alerts, invoice generation, and payment tracking.",
      category: "FINANCE",
      type: "BACKGROUND",
      icon: "🧾",
      colorPrimary: "#F5A623",
      colorSecondary: "#22D9A0",
      gradient: "linear-gradient(135deg,#1a1205,#120f00)",
      onboardingFee: 1999,
      monthlyFee: 799,
      sortOrder: 3,
      features: ["GST filing reminders", "TDS alerts", "Automated invoice generation", "Payment tracking", "Outstanding follow-ups", "India-specific compliance", "Tally integration", "Monthly tax summary"]
    },
    {
      slug: "peopledesk",
      name: "PeopleDesk",
      tagline: "Your HR department - automated.",
      description: "Attendance tracking, leave management, payroll reminders, employee onboarding, and performance reviews - all handled by NEXA.",
      category: "UNIVERSAL",
      type: "BACKGROUND",
      icon: "👥",
      colorPrimary: "#7C6FFF",
      colorSecondary: "#FF6B6B",
      gradient: "linear-gradient(135deg,#0a0a1a,#120a1a)",
      onboardingFee: 3999,
      monthlyFee: 799,
      sortOrder: 4,
      features: ["Attendance tracking", "Leave management", "Payroll reminders", "Employee onboarding", "Performance reviews", "Offer letter generation", "Holiday calendar", "HR reports"]
    },
    {
      slug: "sitesync",
      name: "SiteSync",
      tagline: "From blueprint to handover.",
      description: "Built for builders, construction companies, and solar installers. Drawing management, site visits, contractor coordination, and project milestone tracking.",
      category: "CONSTRUCTION",
      type: "BACKGROUND",
      icon: "🏗️",
      colorPrimary: "#4CAF50",
      colorSecondary: "#8BC34A",
      gradient: "linear-gradient(135deg,#0f1a00,#1a1200)",
      onboardingFee: 5999,
      monthlyFee: 1499,
      sortOrder: 5,
      features: ["Drawing management", "Site visit scheduling", "Contractor coordination", "Approval workflows", "Material tracking", "Project milestones", "Delay alerts", "Client updates"]
    },
    {
      slug: "careloop",
      name: "CareLoop",
      tagline: "Patients never fall through the cracks.",
      description: "For clinics and hospitals. Appointment reminders via WhatsApp and SMS, prescription follow-ups, lab report tracking, and patient satisfaction automation.",
      category: "HEALTHCARE",
      type: "BACKGROUND",
      icon: "🏥",
      colorPrimary: "#00BCD4",
      colorSecondary: "#2196F3",
      gradient: "linear-gradient(135deg,#0a1520,#00101a)",
      onboardingFee: 4999,
      monthlyFee: 1299,
      sortOrder: 6,
      features: ["Appointment reminders", "Prescription follow-ups", "Lab report tracking", "Patient satisfaction surveys", "Doctor availability", "Billing alerts", "Patient history", "Referral tracking"]
    },
    {
      slug: "eduflow",
      name: "EduFlow",
      tagline: "Every student journey tracked.",
      description: "For coaching academies and training centres. Student progress, batch management, fee collection automation, parent communication, and exam scheduling.",
      category: "EDUCATION",
      type: "BACKGROUND",
      icon: "🎓",
      colorPrimary: "#FF9800",
      colorSecondary: "#FF5722",
      gradient: "linear-gradient(135deg,#1a0f00,#1a0a00)",
      onboardingFee: 3999,
      monthlyFee: 999,
      sortOrder: 7,
      features: ["Student progress tracking", "Batch management", "Fee collection automation", "Parent communication", "Exam scheduling", "Attendance alerts", "Performance reports", "Admission pipeline"]
    },
    {
      slug: "classmate",
      name: "ClassMate",
      tagline: "Teachers teach. ClassMate handles the rest.",
      description: "For schools. Lesson plan management, student attendance, homework tracking, parent communication portal, PTM scheduling, and report card generation.",
      category: "EDUCATION",
      type: "BACKGROUND",
      icon: "🏫",
      colorPrimary: "#9C27B0",
      colorSecondary: "#673AB7",
      gradient: "linear-gradient(135deg,#150a1a,#0f0a20)",
      onboardingFee: 4999,
      monthlyFee: 1299,
      sortOrder: 8,
      features: ["Lesson plan management", "Student attendance", "Homework tracking", "Parent communication portal", "PTM scheduling", "Report card generation", "Teacher workload", "School announcements"]
    },
    {
      slug: "proppilot",
      name: "PropPilot",
      tagline: "Close more properties.",
      description: "For real estate agencies. Site visit scheduling, broker network management, property matching for leads, token and agreement tracking, and referral management.",
      category: "REAL_ESTATE",
      type: "BACKGROUND",
      icon: "🏢",
      colorPrimary: "#009688",
      colorSecondary: "#4CAF50",
      gradient: "linear-gradient(135deg,#001a0f,#001510)",
      onboardingFee: 3999,
      monthlyFee: 1299,
      sortOrder: 9,
      features: ["Site visit scheduling", "Broker network management", "Property matching", "Token tracking", "Agreement alerts", "Post-sale follow-up", "Referral management", "Commission tracking"]
    },
    {
      slug: "stocksense",
      name: "StockSense",
      tagline: "Orders, dealers, payments - all flowing.",
      description: "For retail and distribution businesses. Dealer network management, order tracking, dispatch alerts, payment follow-ups, and reorder reminders.",
      category: "RETAIL",
      type: "BACKGROUND",
      icon: "🏪",
      colorPrimary: "#FF5722",
      colorSecondary: "#FF9800",
      gradient: "linear-gradient(135deg,#1a0a05,#1a0500)",
      onboardingFee: 3999,
      monthlyFee: 999,
      sortOrder: 10,
      features: ["Dealer network management", "Order tracking", "Dispatch alerts", "Payment follow-ups", "Reorder reminders", "Sales rep performance", "Distributor communication", "Inventory alerts"]
    }
  ]

  for (const agent of agents) {
    await prisma.marketplaceAgent.upsert({
      where: { slug: agent.slug },
      create: agent as any,
      update: agent as any
    })
  }

  console.log("Marketplace agents seeded successfully")
}

main().catch(console.error).finally(() => prisma.$disconnect())
