"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Loader2, X } from "lucide-react";

import type { MarketplaceAgentView } from "./types";
import { money } from "./marketplace-utils";

type RazorpayPaymentResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayConstructor = new (options: Record<string, unknown>) => {
  open: () => void;
};

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

function firstPaymentTotal(agent: MarketplaceAgentView) {
  return Math.round(agent.onboardingFee * 1.18);
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

export function InstallModal({
  agent,
  businessId,
  onClose,
  onInstalled,
}: {
  agent: MarketplaceAgentView;
  businessId?: string | null;
  onClose: () => void;
  onInstalled: (status: string, installationId?: string) => void;
}) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successInstallationId, setSuccessInstallationId] = useState<string | null>(null);
  const gst = Math.round(agent.onboardingFee * 0.18);
  const total = firstPaymentTotal(agent);

  async function startPayment() {
    setError("");
    if (!businessId) {
      setError("Please sign in as a BOSS or OWNER to install this agent.");
      return;
    }

    setLoading(true);
    const response = await fetch("/api/marketplace/install", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentId: agent.id, businessId }),
    });
    const data = (await response.json().catch(() => ({}))) as {
      error?: string;
      order?: { id: string; amount: number; currency: string };
      keyId?: string | null;
    };

    if (!response.ok || !data.order || !data.keyId) {
      setLoading(false);
      setError(data.error ?? "Unable to start Razorpay payment.");
      return;
    }

    const loaded = await loadRazorpay();
    if (!loaded || !window.Razorpay) {
      setLoading(false);
      setError("Unable to load Razorpay Checkout.");
      return;
    }

    setStep(2);
    setLoading(false);

    const checkout = new window.Razorpay({
      key: data.keyId,
      amount: data.order.amount,
      currency: data.order.currency,
      name: "BGOS Marketplace",
      description: `${agent.name} onboarding fee`,
      order_id: data.order.id,
      theme: { color: agent.colorPrimary },
      handler: (payment: RazorpayPaymentResponse) => {
        void confirmPayment(payment);
      },
    });
    checkout.open();
  }

  async function confirmPayment(payment: RazorpayPaymentResponse) {
    if (!businessId) return;
    setStep(3);
    setLoading(true);
    setError("");

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
    const data = (await response.json().catch(() => ({}))) as {
      error?: string;
      installationId?: string;
    };
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? "Payment confirmed, but installation setup failed.");
      return;
    }

    setSuccessInstallationId(data.installationId ?? null);
    setStep(4);
    onInstalled("PENDING", data.installationId);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#101016] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: agent.colorPrimary }}>
              Step {step} of 4
            </p>
            <h2 className="mt-1 font-heading text-xl font-extrabold text-white">Install {agent.name}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-white/10 p-2 text-zinc-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5">
          {step === 1 ? (
            <div>
              <h3 className="font-heading text-2xl font-extrabold text-white">Confirm installation</h3>
              <div className="mt-5 space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm">
                <div className="flex justify-between"><span className="text-zinc-400">Setup fee</span><span>{money(agent.onboardingFee)}</span></div>
                <div className="flex justify-between"><span className="text-zinc-400">GST 18%</span><span>{money(gst)}</span></div>
                <div className="flex justify-between border-t border-white/10 pt-3 font-heading text-lg font-extrabold"><span>Total today</span><span style={{ color: agent.colorPrimary }}>{money(total)}</span></div>
                <div className="flex justify-between"><span className="text-zinc-400">Monthly autopay</span><span>{money(agent.monthlyFee)} + GST</span></div>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div>
              <h3 className="font-heading text-2xl font-extrabold text-white">Payment</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-400">Complete the Razorpay onboarding payment. The checkout window should be open.</p>
            </div>
          ) : null}

          {step === 3 ? (
            <div>
              <h3 className="font-heading text-2xl font-extrabold text-white">Autopay setup</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-400">Your card will be charged {money(agent.monthlyFee)} + GST every month. Cancel anytime from your dashboard.</p>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#22D9A0]/15 text-[#22D9A0]">
                <Check className="h-7 w-7" />
              </div>
              <h3 className="mt-5 font-heading text-2xl font-extrabold text-white">Agent installed successfully</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                {agent.type === "UI"
                  ? "You can open the agent page now. Our team will finish setup and activation from there."
                  : "We are setting this up for you. You can track progress from your Apps page."}
              </p>
            </div>
          ) : null}

          {error ? <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p> : null}

          <div className="mt-6 flex gap-3">
            {step === 1 ? (
              <button
                type="button"
                onClick={() => void startPayment()}
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-extrabold text-black disabled:opacity-60"
                style={{ background: `linear-gradient(135deg, ${agent.colorPrimary}, ${agent.colorSecondary})` }}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Pay {money(total)}
              </button>
            ) : null}
            {step === 4 ? (
              <>
                {agent.type === "UI" && successInstallationId ? (
                  <Link
                    href={`/boss/agents/${successInstallationId}`}
                    className="flex-1 rounded-full bg-white px-5 py-3 text-center text-sm font-extrabold text-black"
                  >
                    Open agent
                  </Link>
                ) : null}
                <Link
                  href="/boss/apps"
                  className="flex-1 rounded-full border border-white/10 px-5 py-3 text-center text-sm font-extrabold text-white"
                >
                  Go to Apps
                </Link>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-white/10 px-5 py-3 text-sm font-extrabold text-zinc-300"
                >
                  Close
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
