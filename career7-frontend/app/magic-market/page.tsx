import { PlaceholderPage } from "../placeholder-page";

export default function MagicMarketPage() {
  return (
    <PlaceholderPage
      activeHref="/magic-market"
      eyebrow="Magic Market"
      title="Magic Market"
      description="A premium market for Blizzway boosts, tools, companions, and guided career utilities."
      previewTitle="Browse magical tools for serious growth."
      previewDescription="Dummy shelves preview resume, interview, communication, exam, migration, and launch support."
      highlights={["Boosts", "Companions", "Reviews"]}
      emptyTitle="No market tools installed yet"
      emptyDescription="Magic Market inventory is dummy-only until future product data is connected."
      nexaSuggestion="Pick the tool that removes the biggest blocker: clarity, confidence, communication, or proof."
    />
  );
}
