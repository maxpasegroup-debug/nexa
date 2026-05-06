"use client";

import { useState } from "react";

type RazorpayPaymentResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayConstructor = new (options: Record<string, unknown>) => { open: () => void };

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

async function loadRazorpay() {
  if (window.Razorpay) return true;
  return new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function money(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

export function AgentPaymentCard({
  agent,
  businessId,
  orderId,
  keyId,
}: {
  agent: {
    id: string;
    name: string;
    icon: string;
    colorPrimary: string;
    onboardingFee: number;
    monthlyFee: number;
  };
  businessId: string;
  orderId?: string | null;
  keyId?: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");
  const setup = Math.round(agent.onboardingFee);
  const monthly = Math.round(agent.monthlyFee);
  const gst = Math.round((setup + monthly) * 0.18);
  const total = setup + monthly + gst;
  const monthlyWithGst = monthly + Math.round(monthly * 0.18);

  async function pay() {
    setError("");
    if (!orderId || !keyId) {
      setError("Payment is not ready yet. Please contact your BDM.");
      return;
    }
    setLoading(true);
    const loaded = await loadRazorpay();
    setLoading(false);
    if (!loaded || !window.Razorpay) {
      setError("Unable to load Razorpay Checkout.");
      return;
    }

    new window.Razorpay({
      key: keyId,
      amount: total * 100,
      currency: "INR",
      name: "BGOS Marketplace",
      description: `${agent.name} setup + first month`,
      order_id: orderId,
      theme: { color: agent.colorPrimary },
      handler: (payment: RazorpayPaymentResponse) => {
        void confirm(payment);
      },
    }).open();
  }

  async function confirm(payment: RazorpayPaymentResponse) {
    setLoading(true);
    const response = await fetch("/api/marketplace/install/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agentId: agent.id,
        businessId,
        razorpayPaymentId: payment.razorpay_payment_id,
        razorpayOrderId: payment.razorpay_order_id,
        razorpaySignature: payment.razorpay_signature,
      }),
    });
    setLoading(false);
    if (!response.ok) {
      setError("Payment was received, but confirmation is still processing.");
      return;
    }
    setConfirmed(true);
  }

  if (confirmed) {
    return (
      <section className="rounded-2xl border border-[#22D9A0]/30 bg-[#22D9A0]/10 p-6">
        <h2 className="font-heading text-xl font-extrabold text-white">Payment confirmed.</h2>
        <p className="mt-2 text-sm text-zinc-300">Our team will integrate {agent.name} within 24 hours.</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-[#F5A623]/30 bg-[#13131c] p-6">
      <div className="flex items-center gap-4">
        <div className="text-5xl">{agent.icon}</div>
        <div>
          <h1 className="font-heading text-3xl font-extrabold text-white">{agent.name}</h1>
          <p className="mt-2 text-sm text-zinc-400">Pay to unlock this agent in your BGOS workspace.</p>
        </div>
      </div>
      <div className="mt-6 rounded-2xl border border-white/10 bg-[#0e0e13] p-5 text-sm">
        <div className="flex justify-between py-2"><span>Onboarding fee (one-time):</span><span>{money(setup)}</span></div>
        <div className="flex justify-between py-2"><span>First month subscription:</span><span>{money(monthly)}</span></div>
        <div className="flex justify-between py-2"><span>Tax:</span><span>{money(gst)}</span></div>
        <div className="mt-2 flex justify-between border-t border-white/10 pt-4 font-heading text-lg font-extrabold">
          <span>Total today:</span><span className="text-[#F5A623]">{money(total)}</span>
        </div>
      </div>
      <p className="mt-4 text-sm text-zinc-400">Then {money(monthlyWithGst)}/month ({money(monthly)} + applicable taxes) via autopay</p>
      {error ? <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p> : null}
      <button
        type="button"
        onClick={() => void pay()}
        disabled={loading}
        className="mt-6 w-full rounded-xl bg-[#F5A623] px-5 py-4 text-sm font-extrabold text-black disabled:opacity-60"
      >
        {loading ? "Opening payment..." : `Pay ${money(total)} and activate →`}
      </button>
    </section>
  );
}
