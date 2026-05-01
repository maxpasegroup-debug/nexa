import { NextResponse } from "next/server";

import {
  verifyRazorpayWebhookSignature,
  settleMarketplaceOnboardingPayment,
} from "@/lib/marketplace";
import { prisma } from "@/lib/prisma";

type RazorpayWebhookPayload = {
  event?: string;
  payload?: {
    payment?: {
      entity?: {
        order_id?: string;
      };
    };
    subscription?: {
      entity?: {
        id?: string;
      };
    };
  };
};

function getWebhookSignature(request: Request) {
  return (
    request.headers.get("x-razorpay-signature") ??
    request.headers.get("X-Razorpay-Signature") ??
    ""
  );
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = getWebhookSignature(request);

  try {
    if (!signature || !verifyRazorpayWebhookSignature(body, signature)) {
      return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
    }
  } catch (error) {
    console.error("[marketplace:webhook:verify]", error);
    return NextResponse.json({ error: "Webhook verification failed." }, { status: 500 });
  }

  let payload: RazorpayWebhookPayload;
  try {
    payload = JSON.parse(body) as RazorpayWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
  }

  try {
    if (payload.event === "payment.captured") {
      const orderId = payload.payload?.payment?.entity?.order_id;
      if (!orderId) {
        return NextResponse.json({ error: "Payment order id missing." }, { status: 400 });
      }

      const installation = await prisma.agentInstallation.findFirst({
        where: { razorpaySetupId: orderId },
        select: { id: true },
      });

      if (!installation) {
        return NextResponse.json({ received: true, ignored: "installation_not_found" });
      }

      const result = await settleMarketplaceOnboardingPayment(installation.id);
      return NextResponse.json({
        received: true,
        event: payload.event,
        installationId: result.installation.id,
        settled: result.settled,
      });
    }

    if (payload.event === "payment.failed") {
      const orderId = payload.payload?.payment?.entity?.order_id;
      if (orderId) {
        await prisma.agentInstallation.updateMany({
          where: {
            razorpaySetupId: orderId,
            onboardingFeePaid: false,
          },
          data: { status: "PENDING" },
        });
      }

      return NextResponse.json({ received: true, event: payload.event });
    }

    if (
      payload.event === "subscription.activated" ||
      payload.event === "subscription.charged"
    ) {
      const subscriptionId = payload.payload?.subscription?.entity?.id;
      if (subscriptionId) {
        await prisma.agentInstallation.updateMany({
          where: { razorpayMandateId: subscriptionId },
          data: { monthlyFeePaid: true },
        });
      }

      return NextResponse.json({ received: true, event: payload.event });
    }

    if (payload.event === "subscription.cancelled") {
      const subscriptionId = payload.payload?.subscription?.entity?.id;
      if (subscriptionId) {
        await prisma.agentInstallation.updateMany({
          where: { razorpayMandateId: subscriptionId },
          data: {
            status: "CANCELLED",
            cancelledAt: new Date(),
            cancelReason: "Razorpay subscription cancelled",
          },
        });
      }

      return NextResponse.json({ received: true, event: payload.event });
    }

    return NextResponse.json({ received: true, ignored: payload.event ?? "unknown" });
  } catch (error) {
    console.error("[marketplace:webhook]", error);
    return NextResponse.json(
      { error: "Unable to process marketplace webhook." },
      { status: 500 },
    );
  }
}
