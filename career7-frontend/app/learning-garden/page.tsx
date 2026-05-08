import { PlaceholderPage } from "../placeholder-page";

export default function LearningGardenPage() {
  return (
    <PlaceholderPage
      activeHref="/learning-garden"
      eyebrow="Learning Garden"
      title="Learning Garden"
      description="A calm space for skills, communication, exam readiness, and project growth."
      previewTitle="Grow the skills that make your future easier."
      previewDescription="Dummy learning tracks preview how Blizzway will organize practice without pressure."
      highlights={["Skill map", "Daily practice", "Proof project"]}
      emptyTitle="No learning tracks planted yet"
      emptyDescription="Learning tracks will appear here when the real onboarding and learning engine are connected."
      nexaSuggestion="Choose one skill that improves your confidence this week, then practice it for fifteen focused minutes."
    />
  );
}
