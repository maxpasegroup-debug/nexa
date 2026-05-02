export const PLANS = {
  STARTER: {
    name: "Starter",
    price: 799,
    priceDisplay: "₹799",
    period: "/month",
    gstNote: "+ 18% GST · autopay",
    users: 3,
    usersDisplay: "Up to 3 users",
    description:
      "AI-powered CRM with NEXA as your CEO. One custom pipeline built for your business. Perfect for solo founders and very small teams getting started.",
    features: [
      "AI-powered CRM",
      "NEXA CEO (daily briefings)",
      "1 custom pipeline",
      "Boss + 2 employee dashboards",
      "Email support",
    ],
    cta: "Get your workspace →",
    ctaStyle: "outline",
    color: "#6B6878",
    highlight: false,
  },
  GROWTH: {
    name: "Growth",
    price: 2499,
    priceDisplay: "₹2,499",
    period: "/month",
    gstNote: "+ 18% GST · autopay",
    users: 15,
    usersDisplay: "Up to 15 users",
    badge: "★ Most popular",
    description:
      "Full AI-powered CRM with NEXA CEO running your business. Up to 3 custom pipelines, all role-based dashboards, and access to the BGOS Marketplace. The plan most growing businesses choose.",
    features: [
      "AI-powered CRM",
      "NEXA CEO (full — briefings, alerts, insights)",
      "Up to 3 custom pipelines",
      "All role dashboards (Boss, Manager, Sales, Tech)",
      "Marketplace access",
      "Chat + email support",
    ],
    cta: "Get your workspace →",
    ctaStyle: "primary",
    color: "#7C6FFF",
    highlight: true,
  },
  SCALE: {
    name: "Scale",
    price: 6999,
    priceDisplay: "₹6,999",
    period: "/month",
    gstNote: "+ 18% GST · autopay",
    users: 50,
    usersDisplay: "Up to 50 users",
    description:
      "Everything in Growth, plus unlimited pipelines, advanced NEXA, full marketplace, API access, and priority support. Built for businesses managing multiple products and large teams.",
    features: [
      "AI-powered CRM",
      "NEXA CEO (advanced — custom training)",
      "Unlimited custom pipelines",
      "All role dashboards + API access",
      "Full marketplace access",
      "Priority support (4hr response)",
    ],
    cta: "Get your workspace →",
    ctaStyle: "outline",
    color: "#6B6878",
    highlight: false,
  },
  ENTERPRISE: {
    name: "Enterprise",
    price: null,
    priceDisplay: "Custom",
    period: "",
    gstNote: "Annual contract",
    users: null,
    usersDisplay: "Unlimited users",
    description:
      "Everything in Scale, plus dedicated success manager, white label option, SLA guarantee, and all marketplace agents included free.",
    features: [
      "Everything in Scale",
      "Dedicated success manager",
      "White label option",
      "SLA 99.9% uptime guarantee",
      "All marketplace agents free",
    ],
    cta: "Talk to our team →",
    ctaStyle: "outline-green",
    color: "#22D9A0",
    highlight: false,
  },
} as const;

export type PlanKey = keyof typeof PLANS;
export type Plan = typeof PLANS[PlanKey];

export const PLAN_ORDER: PlanKey[] = ["STARTER", "GROWTH", "SCALE", "ENTERPRISE"];

export const BOTTOM_NOTE =
  "Every plan includes a custom workspace built by our team — pipelines, role dashboards, and NEXA configured for your specific business. Not a self-serve tool. 7-day free trial on all plans.";

export const GST_NOTE = "All prices + 18% GST · Autopay · Cancel anytime";
