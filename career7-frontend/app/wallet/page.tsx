import { PlaceholderPage } from "../placeholder-page";

export default function WalletPage() {
  return (
    <PlaceholderPage
      activeHref="/wallet"
      eyebrow="Wallet"
      title="Wallet"
      description="A simple credits space for boosts, companions, reviews, and premium pathway upgrades."
      previewTitle="Your Blizzway credits stay easy to understand."
      previewDescription="Dummy wallet cards preview balances, usage, and future payment-safe controls."
      highlights={["2,400 credits", "3 recent actions", "Payments off"]}
      emptyTitle="No wallet activity yet"
      emptyDescription="Wallet history and checkout flows are intentionally not connected in this frontend phase."
      nexaSuggestion="Spend credits only where they reduce friction: proof, confidence, practice, or opportunity clarity."
    />
  );
}
