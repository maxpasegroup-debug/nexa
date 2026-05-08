import { PlaceholderPage } from "../placeholder-page";

export default function SettingsPage() {
  return (
    <PlaceholderPage
      activeHref="/settings"
      eyebrow="Settings"
      title="Settings"
      description="Manage profile preferences, workspace defaults, notifications, and future account controls."
      previewTitle="Simple controls for a premium career workspace."
      previewDescription="Settings will eventually hold profile, notification, privacy, billing, Guardian Angel AI preferences, and connected account controls."
      highlights={["Profile", "Alerts", "Preferences"]}
    />
  );
}
