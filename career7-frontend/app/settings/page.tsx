import { PlaceholderPage } from "../placeholder-page";

export default function SettingsPage() {
  return (
    <PlaceholderPage
      activeHref="/settings"
      eyebrow="Settings"
      title="Settings"
      description="Future controls for profile, notifications, privacy, credits, and NEXA preferences."
      previewTitle="Control the calm around your pathway."
      previewDescription="Dummy settings cards preview the account controls that will arrive in later phases."
      highlights={["Profile", "Privacy", "NEXA tone"]}
      emptyTitle="No settings changed yet"
      emptyDescription="Settings are visual placeholders only and do not save changes yet."
      nexaSuggestion="Keep notifications gentle, guidance clear, and privacy controls easy to understand."
    />
  );
}
