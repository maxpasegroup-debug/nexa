import { PlaceholderPage } from "../placeholder-page";

export default function WalletPage() {
  return (
    <PlaceholderPage
      activeHref="/wallet"
      eyebrow="Wallet"
      title="Wallet"
      description="Track Career7 credits for boosts, agents, reviews, and premium pathways."
      previewTitle="One credit wallet for the whole ecosystem."
      previewDescription="The wallet will show credit balance, usage history, upcoming spends, and package options when payments are introduced later."
      highlights={["Credits", "History", "Packages"]}
    />
  );
}
