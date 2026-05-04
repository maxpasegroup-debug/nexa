import { topUpCareer7Credits } from "@/lib/career7-wallet";
import { registerPaymentCallback } from "@/lib/payments";

registerPaymentCallback("career7.payment.success", async ({ payment }) => {
  const credits = payment.credits ?? 0;
  if (credits <= 0) return;

  await topUpCareer7Credits({
    businessId: payment.businessId,
    userId: payment.userId,
    amount: credits,
    description: `Career7 credit top-up via ${payment.gateway.toLowerCase()}`,
    metadata: {
      paymentGateway: payment.gateway,
      bgosPaymentIntentId: payment.id,
      providerOrderId: payment.providerOrderId,
      providerPaymentId: payment.providerPaymentId,
    },
  });
});

registerPaymentCallback("career7.payment.failure", async () => {
  return;
});
