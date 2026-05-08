import { PlaceholderPage } from "../placeholder-page";

export default function CompanionsPage() {
  return (
    <PlaceholderPage
      activeHref="/companions"
      eyebrow="Companions"
      title="Companions"
      description="Focused AI-native helpers for students, professionals, and aspirants."
      previewTitle="Build your personal career support team."
      previewDescription="Dummy companion cards preview guides for resumes, interviews, learning, earning, and confidence."
      highlights={["Resume guide", "Interview guide", "Opportunity guide"]}
      emptyTitle="No companions selected yet"
      emptyDescription="Companion selection and personalization will be connected in a later phase."
      nexaSuggestion="Begin with one companion that supports your current bottleneck, not every possible goal."
    />
  );
}
