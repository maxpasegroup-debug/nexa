import { PlaceholderPage } from "../placeholder-page";

export default function SoulVaultPage() {
  return (
    <PlaceholderPage
      activeHref="/soul-vault"
      eyebrow="Soul Vault"
      title="Soul Vault"
      description="A private-feeling space for achievements, reflections, proof notes, and confidence wins."
      previewTitle="Keep the story of your becoming."
      previewDescription="Dummy vault cards preview how Blizzway will preserve growth memory for future NEXA guidance."
      highlights={["Achievements", "Reflections", "Proof notes"]}
      emptyTitle="Soul Vault is empty for now"
      emptyDescription="Your future wins, reflections, and confidence notes will appear here."
      nexaSuggestion="Save one moment from today that proves you are becoming more capable."
    />
  );
}
