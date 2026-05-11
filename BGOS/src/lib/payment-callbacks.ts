import { topUpCareer7Credits } from "@/lib/career7-wallet";
import { recordGamificationEvent } from "@/lib/blizzway-gamification";
import { registerPaymentCallback, type PaymentCallbackContext } from "@/lib/payments";

async function topUpBlizzwayCredits({ payment }: PaymentCallbackContext) {
  const credits = payment.credits ?? 0;
  if (credits <= 0) return;

  await topUpCareer7Credits({
    businessId: payment.businessId,
    userId: payment.userId,
    amount: credits,
    businessModel: payment.businessModel === "blizzway" ? "blizzway" : "career7",
    description: `Blizzway credit top-up via ${payment.gateway.toLowerCase()}`,
    source: "payment_top_up",
    idempotencyKey: `payment-success:${payment.id}`,
    metadata: {
      paymentGateway: payment.gateway,
      bgosPaymentIntentId: payment.id,
      providerOrderId: payment.providerOrderId,
      providerPaymentId: payment.providerPaymentId,
    },
  });
  await recordGamificationEvent(
    {
      businessModel: payment.businessModel === "blizzway" ? "blizzway" : "career7",
      businessId: payment.businessId,
      userId: payment.userId,
    },
    "wallet_top_up",
    { source: "payment_top_up", paymentId: payment.id },
  ).catch(() => {
    return;
  });
}

registerPaymentCallback("blizzway.payment.success", topUpBlizzwayCredits);
registerPaymentCallback("career7.payment.success", topUpBlizzwayCredits);

registerPaymentCallback("career7.payment.failure", async () => {
  return;
});

registerPaymentCallback("blizzway.payment.failure", async () => {
  return;
});
