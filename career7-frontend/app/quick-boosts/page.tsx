import { PlaceholderPage } from "../placeholder-page";

export default function QuickBoostsPage() {
  return (
    <PlaceholderPage
      activeHref="/quick-boosts"
      eyebrow="Quick Boosts"
      title="Quick Boosts"
      description="Fast, credit-powered tools for small but meaningful career wins."
      previewTitle="One focused boost at a time."
      previewDescription="Quick Boosts will help you scan a resume, test role fit, practice interviews, map skills, and sharpen portfolio assets."
      highlights={["Resume scan", "Role fit", "Mock drill"]}
    />
  );
}
