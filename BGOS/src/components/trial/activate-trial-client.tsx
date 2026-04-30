"use client";

import { signIn } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

type PreviewPayload = {
  workspaceConfig: {
    companyName: string;
  };
  business: {
    id: string;
    name: string;
  };
  lead?: {
    name: string;
    email: string;
    selectedPlan: string | null;
  };
};

const plans = {
  STARTER: { name: "Starter", monthly: 499, features: ["Lead tracking", "NEXA daily brief", "Basic team access"] },
  GROWTH: { name: "Growth", monthly: 1500, features: ["AI lead scoring", "Team targets", "Email alerts"] },
  SCALE: { name: "Scale", monthly: 5000, features: ["Custom pipelines", "Advanced NEXA", "Priority support"] },
  ENTERPRISE: { name: "Enterprise", monthly: 15000, features: ["Dedicated setup", "Custom workflows", "Executive support"] },
};

function addDays(days: number) {
  const value = new Date();
  value.setDate(value.getDate() + days);
  return value;
}

function formatINR(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

export function ActivateTrialClient({
  businessId: initialBusinessId,
  token,
}: {
  businessId?: string;
  token?: string;
}) {
  const [step, setStep] = useState(0);
  const [preview, setPreview] = useState<PreviewPayload | null>(null);
  const [businessId, setBusinessId] = useState(initialBusinessId ?? "");
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [planType, setPlanType] = useState<keyof typeof plans>("GROWTH");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ dashboardUrl: string; trialEndsAt: string; amount: number } | null>(null);

  const chargeDate = useMemo(() => addDays(7), []);
  const selectedPlan = plans[planType];
  const amount = billing === "annual" ? selectedPlan.monthly * 10 : selectedPlan.monthly;

  useEffect(() => {
    if (!token) return;

    async function loadPreview() {
      const response = await fetch(`/api/onboarding/preview?token=${encodeURIComponent(token ?? "")}`, {
        cache: "no-store",
      });
      if (!response.ok) return;
      const data = (await response.json()) as PreviewPayload;
      setPreview(data);
      setBusinessId(data.business.id);
      setName((current) => current || data.lead?.name || data.business.name);
      setEmail((current) => current || data.lead?.email || "");
      if (data.lead?.selectedPlan && data.lead.selectedPlan in plans) {
        setPlanType(data.lead.selectedPlan as keyof typeof plans);
      }
    }

    void loadPreview();
  }, [token]);

  useEffect(() => {
    if (document.querySelector("script[data-razorpay-checkout]")) return;
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.dataset.razorpayCheckout = "true";
    document.body.appendChild(script);
  }, []);

  function validatePasswordStep() {
    if (!email.trim() || !name.trim()) {
      setError("Name and email are required.");
      return false;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    setError("");
    return true;
  }

  function setupPayment() {
    setError("");
    const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

    if (key && window.Razorpay) {
      const razorpay = new window.Razorpay({
        key,
        name: "BGOS",
        description: "7-day free trial autopay setup",
        prefill: { name, email },
        handler: (response: Record<string, unknown>) => {
          void activateTrial(
            String(response.razorpay_payment_id ?? `rzp_mandate_${Date.now()}`),
            String(response.razorpay_customer_id ?? `customer_${Date.now()}`),
          );
        },
        modal: {
          ondismiss: () => setError("Payment setup was cancelled."),
        },
        notes: { businessId, planType, billing, paymentMethod },
        theme: { color: "#2ECC8A" },
      });
      razorpay.open();
      return;
    }

    void activateTrial(`mandate_${paymentMethod}_${Date.now()}`, `customer_${Date.now()}`);
  }

  async function activateTrial(razorpayMandateId: string, razorpayCustomerId: string) {
    setLoading(true);
    setError("");
    const response = await fetch("/api/trial/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessId,
        planType,
        billingCycle: billing,
        razorpayMandateId,
        razorpayCustomerId,
        name,
        email,
        password,
      }),
    });
    const data = (await response.json().catch(() => ({}))) as {
      error?: string;
      dashboardUrl?: string;
      trialEndsAt?: string;
      monthlyAmount?: number;
    };
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? "Unable to activate trial.");
      return;
    }

    setSuccess({
      dashboardUrl: data.dashboardUrl ?? "/boss",
      trialEndsAt: data.trialEndsAt ?? chargeDate.toISOString(),
      amount: data.monthlyAmount ?? amount,
    });
    setStep(3);
  }

  async function goToDashboard() {
    if (email && password) {
      await signIn("credentials", {
        email,
        password,
        callbackUrl: "/boss",
      });
      return;
    }

    window.location.href = "/boss";
  }

  return (
    <main className="min-h-screen bg-[#070709] px-5 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.25em] text-[#2ECC8A]">BGOS trial activation</p>
          <h1 className="mt-3 font-heading text-3xl font-bold">
            Start {preview?.workspaceConfig.companyName ?? "your"} 7-day free trial
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Your card or UPI mandate is saved today. You are not charged until{" "}
            {chargeDate.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-4 gap-2">
          {["Plan", "Password", "Autopay", "Success"].map((label, index) => (
            <div
              key={label}
              className={`rounded-full px-3 py-2 text-center text-xs font-semibold ${
                index <= step ? "bg-[#2ECC8A] text-[#07100b]" : "bg-white/5 text-zinc-500"
              }`}
            >
              {label}
            </div>
          ))}
        </div>

        <section className="rounded-2xl border border-white/10 bg-[#13131c] p-6">
          {step === 0 ? (
            <div>
              <h2 className="font-heading text-xl font-bold">Confirm your plan</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {(Object.keys(plans) as Array<keyof typeof plans>).map((key) => {
                  const plan = plans[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setPlanType(key)}
                      className={`rounded-2xl border p-5 text-left transition ${
                        planType === key ? "border-[#2ECC8A] bg-[#2ECC8A]/10" : "border-white/10 bg-[#0d0d12]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-heading text-lg font-bold">{plan.name}</h3>
                        <span className="text-sm font-bold text-[#2ECC8A]">{formatINR(plan.monthly)}/mo</span>
                      </div>
                      <ul className="mt-4 space-y-2 text-sm text-zinc-400">
                        {plan.features.map((feature) => (
                          <li key={feature}>• {feature}</li>
                        ))}
                      </ul>
                    </button>
                  );
                })}
              </div>
              <div className="mt-5 flex rounded-xl border border-white/10 bg-[#0d0d12] p-1">
                {(["monthly", "annual"] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setBilling(item)}
                    className={`flex-1 rounded-lg px-4 py-3 text-sm font-semibold capitalize ${
                      billing === item ? "bg-white text-black" : "text-zinc-400"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <p className="mt-4 text-sm text-zinc-400">
                Your card will not be charged until{" "}
                {chargeDate.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}.
              </p>
              <button onClick={() => setStep(1)} className="mt-6 rounded-xl bg-[#2ECC8A] px-5 py-3 text-sm font-bold text-[#07100b]">
                Continue →
              </button>
            </div>
          ) : null}

          {step === 1 ? (
            <div>
              <h2 className="font-heading text-xl font-bold">Set your password</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="text-sm font-medium text-zinc-300">
                  Name
                  <input value={name} onChange={(event) => setName(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#0d0d12] px-4 py-3 text-white outline-none focus:border-[#2ECC8A]" />
                </label>
                <label className="text-sm font-medium text-zinc-300">
                  Email
                  <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#0d0d12] px-4 py-3 text-white outline-none focus:border-[#2ECC8A]" />
                </label>
                <label className="text-sm font-medium text-zinc-300">
                  Password
                  <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#0d0d12] px-4 py-3 text-white outline-none focus:border-[#2ECC8A]" />
                </label>
                <label className="text-sm font-medium text-zinc-300">
                  Confirm password
                  <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#0d0d12] px-4 py-3 text-white outline-none focus:border-[#2ECC8A]" />
                </label>
              </div>
              {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
              <button
                onClick={() => {
                  if (validatePasswordStep()) setStep(2);
                }}
                className="mt-6 rounded-xl bg-[#2ECC8A] px-5 py-3 text-sm font-bold text-[#07100b]"
              >
                Continue to autopay →
              </button>
            </div>
          ) : null}

          {step === 2 ? (
            <div>
              <h2 className="font-heading text-xl font-bold">Set up autopay - you will not be charged for 7 days</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                We set up a payment mandate today. Think of it like giving permission to charge your card after the
                trial. If you cancel before{" "}
                {chargeDate.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}, we charge
                nothing. Ever.
              </p>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {[
                  ["upi", "UPI Autopay", "Most popular"],
                  ["card", "Credit/Debit card", "Saved for recurring"],
                  ["netbanking", "Net banking", "Bank mandate"],
                ].map(([key, title, subtitle]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPaymentMethod(key)}
                    className={`rounded-2xl border p-5 text-left ${
                      paymentMethod === key ? "border-[#2ECC8A] bg-[#2ECC8A]/10" : "border-white/10 bg-[#0d0d12]"
                    }`}
                  >
                    <p className="font-heading text-base font-bold">{title}</p>
                    <p className="mt-2 text-xs text-zinc-500">{subtitle}</p>
                  </button>
                ))}
              </div>
              {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
              <button
                onClick={setupPayment}
                disabled={loading}
                className="mt-6 rounded-xl bg-[#2ECC8A] px-5 py-3 text-sm font-bold text-[#07100b] disabled:opacity-60"
              >
                {loading ? "Saving autopay..." : "Save payment method →"}
              </button>
            </div>
          ) : null}

          {step === 3 && success ? (
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#2ECC8A] text-3xl text-[#07100b]">✓</div>
              <h2 className="mt-5 font-heading text-2xl font-bold">Your 7-day free trial is active!</h2>
              <div className="mx-auto mt-6 max-w-lg space-y-3 rounded-2xl border border-white/10 bg-[#0d0d12] p-5 text-left text-sm text-zinc-300">
                <p>Your team can now log in at iceconnect.in</p>
                <p>
                  You will be charged {formatINR(success.amount)} on{" "}
                  {new Date(success.trialEndsAt).toLocaleDateString("en-IN")} unless you cancel
                </p>
                <p>Cancel anytime from your dashboard - no questions asked</p>
              </div>
              <button onClick={() => void goToDashboard()} className="mt-6 rounded-xl bg-[#2ECC8A] px-5 py-3 text-sm font-bold text-[#07100b]">
                Go to your dashboard →
              </button>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
