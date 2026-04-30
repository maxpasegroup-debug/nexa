"use client";

import { signIn } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";

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

type PlanKey = "STARTER" | "GROWTH" | "SCALE" | "ENTERPRISE";
type PaymentMethod = "upi" | "card" | "netbanking";

const plans: Record<PlanKey, { name: string; monthly: number; features: string[] }> = {
  STARTER: {
    name: "Starter",
    monthly: 799,
    features: ["Lead tracking", "Daily NEXA brief", "Basic team access"],
  },
  GROWTH: {
    name: "Growth",
    monthly: 2499,
    features: ["AI lead scoring", "Team targets", "Call logging", "NEXA alerts"],
  },
  SCALE: {
    name: "Scale",
    monthly: 6999,
    features: ["Custom pipelines", "Advanced NEXA", "Automation setup", "Priority support"],
  },
  ENTERPRISE: {
    name: "Enterprise",
    monthly: 15000,
    features: ["Dedicated setup", "Custom workflows", "Executive reporting", "Premium support"],
  },
};

function addDays(days: number) {
  const value = new Date();
  value.setDate(value.getDate() + days);
  return value;
}

function formatAmount(value: number) {
  return `Rs. ${value.toLocaleString("en-IN")}`;
}

function formatDate(value: Date | string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
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
  const [plan, setPlan] = useState<PlanKey>("GROWTH");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ dashboardUrl: string; trialEndsAt: string; amount: number } | null>(null);

  const chargeDate = useMemo(() => addDays(7), []);
  const selectedPlan = plans[plan];

  useEffect(() => {
    if (!token) return;

    async function loadPreview() {
      const response = await fetch(`/api/onboarding/preview?token=${encodeURIComponent(token ?? "")}`, {
        cache: "no-store",
      });
      if (!response.ok) {
        setError("We could not load this preview link. Please contact the BGOS team.");
        return;
      }
      const data = (await response.json()) as PreviewPayload;
      setPreview(data);
      setBusinessId(data.business.id);
      setName((current) => current || data.lead?.name || data.business.name);
      setEmail((current) => current || data.lead?.email || "");
      if (data.lead?.selectedPlan && data.lead.selectedPlan in plans) {
        setPlan(data.lead.selectedPlan as PlanKey);
      }
    }

    void loadPreview();
  }, [token]);

  function validatePasswordStep() {
    if (!businessId) {
      setError("Business details are missing. Please open activation from your preview link.");
      return false;
    }
    if (!name.trim() || !email.trim()) {
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

  function validateAutopayStep() {
    if (paymentMethod === "upi" && !upiId.trim()) {
      setError("Enter your UPI ID to send the mandate request.");
      return false;
    }
    if (paymentMethod === "card" && (!cardNumber.trim() || !cardExpiry.trim() || !cardCvv.trim())) {
      setError("Enter card number, expiry, and CVV.");
      return false;
    }
    setError("");
    return true;
  }

  async function activateTrial() {
    if (!validateAutopayStep()) return;

    setLoading(true);
    const response = await fetch("/api/trial/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessId,
        plan,
        razorpayMandateId: `mandate_${paymentMethod}_${Date.now()}`,
        razorpayCustomerId: `customer_${Date.now()}`,
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
      setError(data.error ?? "Unable to activate your trial.");
      return;
    }

    setSuccess({
      dashboardUrl: data.dashboardUrl ?? "/boss",
      trialEndsAt: data.trialEndsAt ?? chargeDate.toISOString(),
      amount: data.monthlyAmount ?? selectedPlan.monthly,
    });
    setStep(3);
  }

  async function goToDashboard() {
    await signIn("credentials", {
      email,
      password,
      callbackUrl: success?.dashboardUrl ?? "/boss",
    });
  }

  const companyName = preview?.workspaceConfig.companyName ?? preview?.business.name ?? "your company";

  return (
    <main className="min-h-screen bg-[#070709] px-5 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.25em] text-[#2ECC8A]">BGOS trial activation</p>
          <h1 className="mt-3 font-heading text-3xl font-bold">Activate {companyName}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Set your password, review your plan, and authorise autopay. Your first charge happens on{" "}
            <span className="text-zinc-200">{formatDate(chargeDate)}</span>.
          </p>
        </div>

        <div className="mb-8 grid gap-2 md:grid-cols-3">
          {["Set password", "Review plan", "Autopay"].map((label, index) => (
            <div
              key={label}
              className={`rounded-full px-4 py-2 text-center text-xs font-bold ${
                index <= Math.min(step, 2) ? "bg-[#2ECC8A] text-[#07100b]" : "bg-white/5 text-zinc-500"
              }`}
            >
              {label}
            </div>
          ))}
        </div>

        <section className="rounded-2xl border border-white/10 bg-[#13131c] p-6 shadow-2xl shadow-black/30">
          {step === 0 ? (
            <div>
              <h2 className="font-heading text-xl font-bold">Set your password</h2>
              <p className="mt-2 text-sm text-zinc-400">
                This creates your boss login. Employee accounts unlock after activation.
              </p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="text-sm font-medium text-zinc-300">
                  Name
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#0d0d12] px-4 py-3 text-white outline-none focus:border-[#2ECC8A]"
                  />
                </label>
                <label className="text-sm font-medium text-zinc-300">
                  Email
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#0d0d12] px-4 py-3 text-white outline-none focus:border-[#2ECC8A]"
                  />
                </label>
                <label className="text-sm font-medium text-zinc-300">
                  Password
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#0d0d12] px-4 py-3 text-white outline-none focus:border-[#2ECC8A]"
                  />
                </label>
                <label className="text-sm font-medium text-zinc-300">
                  Confirm password
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#0d0d12] px-4 py-3 text-white outline-none focus:border-[#2ECC8A]"
                  />
                </label>
              </div>
              {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
              <button
                type="button"
                onClick={() => {
                  if (validatePasswordStep()) setStep(1);
                }}
                className="mt-6 rounded-xl bg-[#2ECC8A] px-5 py-3 text-sm font-bold text-[#07100b] transition hover:brightness-110"
              >
                Continue to plan review
              </button>
            </div>
          ) : null}

          {step === 1 ? (
            <div>
              <h2 className="font-heading text-xl font-bold">Review your plan</h2>
              <div className="mt-5 rounded-2xl border border-[#2ECC8A]/30 bg-[#2ECC8A]/10 p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#2ECC8A]">Recommended plan</p>
                    <h3 className="mt-2 font-heading text-3xl font-bold">{selectedPlan.name}</h3>
                    <ul className="mt-4 grid gap-2 text-sm text-zinc-300 md:grid-cols-2">
                      {selectedPlan.features.map((feature) => (
                        <li key={feature}>- {feature}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-right">
                    <p className="font-heading text-3xl font-bold text-[#2ECC8A]">
                      {formatAmount(selectedPlan.monthly)}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">per month</p>
                  </div>
                </div>
              </div>
              <div className="mt-5 rounded-xl border border-[#2ECC8A]/20 bg-[#2ECC8A]/5 p-4 text-sm leading-6 text-emerald-100">
                Your first charge will be on {formatDate(chargeDate)}. Cancel before {formatDate(chargeDate)} and pay
                nothing. Cancel anytime after and we stop the next charge.
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="rounded-xl border border-white/10 px-5 py-3 text-sm font-bold text-zinc-300 hover:bg-white/5"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded-xl bg-[#2ECC8A] px-5 py-3 text-sm font-bold text-[#07100b] transition hover:brightness-110"
                >
                  Continue to autopay
                </button>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div>
              <h2 className="font-heading text-xl font-bold">Authorise payment - charged only after 7 days</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                Set up your payment method now. We will only charge you {formatAmount(selectedPlan.monthly)} on{" "}
                {formatDate(chargeDate)}. Think of this like saving your card at Amazon: no charge until your trial ends.
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {[
                  { key: "upi" as const, title: "UPI Autopay", subtitle: "Most popular in India" },
                  { key: "card" as const, title: "Credit or Debit card", subtitle: "Saved for recurring billing" },
                  { key: "netbanking" as const, title: "Net Banking", subtitle: "Bank mandate approval" },
                ].map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setPaymentMethod(option.key)}
                    className={`rounded-2xl border p-5 text-left transition ${
                      paymentMethod === option.key
                        ? "border-[#2ECC8A] bg-[#2ECC8A]/10"
                        : "border-white/10 bg-[#0d0d12] hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-heading text-base font-bold">{option.title}</p>
                      {option.key === "upi" ? (
                        <span className="rounded-full bg-[#2ECC8A] px-2 py-1 text-[10px] font-bold text-[#07100b]">
                          Recommended
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-xs text-zinc-500">{option.subtitle}</p>
                  </button>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-[#0d0d12] p-5">
                {paymentMethod === "upi" ? (
                  <label className="text-sm font-medium text-zinc-300">
                    UPI ID
                    <input
                      value={upiId}
                      onChange={(event) => setUpiId(event.target.value)}
                      placeholder="name@upi"
                      className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[#2ECC8A]"
                    />
                    <span className="mt-3 block text-xs leading-5 text-zinc-500">
                      Open your UPI app and approve the mandate request. It will appear as BGOS -{" "}
                      {formatAmount(selectedPlan.monthly)} autopay mandate.
                    </span>
                  </label>
                ) : null}

                {paymentMethod === "card" ? (
                  <div className="grid gap-4 md:grid-cols-[2fr_1fr_1fr]">
                    <input
                      value={cardNumber}
                      onChange={(event) => setCardNumber(event.target.value)}
                      placeholder="Card number"
                      className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[#2ECC8A]"
                    />
                    <input
                      value={cardExpiry}
                      onChange={(event) => setCardExpiry(event.target.value)}
                      placeholder="MM/YY"
                      className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[#2ECC8A]"
                    />
                    <input
                      value={cardCvv}
                      onChange={(event) => setCardCvv(event.target.value)}
                      placeholder="CVV"
                      className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[#2ECC8A]"
                    />
                  </div>
                ) : null}

                {paymentMethod === "netbanking" ? (
                  <p className="text-sm leading-6 text-zinc-400">
                    Click continue and BGOS will create a bank mandate request for your account. No money moves today.
                  </p>
                ) : null}
              </div>

              {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-xl border border-white/10 px-5 py-3 text-sm font-bold text-zinc-300 hover:bg-white/5"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => void activateTrial()}
                  disabled={loading}
                  className="rounded-xl bg-[#2ECC8A] px-5 py-3 text-sm font-bold text-[#07100b] transition hover:brightness-110 disabled:opacity-60"
                >
                  {loading ? "Activating..." : paymentMethod === "upi" ? "Send payment request" : "Activate trial"}
                </button>
              </div>
            </div>
          ) : null}

          {step === 3 && success ? (
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-[#2ECC8A] text-3xl font-bold text-[#07100b]">
                ✓
              </div>
              <h2 className="mt-5 font-heading text-2xl font-bold">Your trial is active!</h2>
              <div className="mx-auto mt-6 max-w-lg space-y-3 rounded-2xl border border-white/10 bg-[#0d0d12] p-5 text-left text-sm text-zinc-300">
                <p>- Your team will receive login emails in the next 5 minutes</p>
                <p>- Your first charge of {formatAmount(success.amount)} will happen on {formatDate(success.trialEndsAt)}</p>
                <p>- Cancel anytime from Settings - Subscription</p>
              </div>
              <button
                type="button"
                onClick={() => void goToDashboard()}
                className="mt-6 rounded-xl bg-[#2ECC8A] px-5 py-3 text-sm font-bold text-[#07100b] transition hover:brightness-110"
              >
                Go to your dashboard
              </button>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
