import { PlaceholderPage } from "../placeholder-page";

export default function MyPathwayPage() {
  return (
    <PlaceholderPage
      activeHref="/my-pathway"
      eyebrow="My Pathway"
      title="My Pathway"
      description="A visual command board for career clarity, milestones, proof, and confidence."
      previewTitle="Your magical career pathway will live here."
      previewDescription="Dummy milestones show how NEXA will turn ambition into calm weekly actions."
      highlights={["Dream map", "Proof sprint", "Launch rhythm"]}
      emptyTitle="No pathway milestones yet"
      emptyDescription="Future pathway data will appear here after onboarding and assessment are connected."
      nexaSuggestion="Start with one dream goal, one learning action, and one proof note. Momentum grows from small visible wins."
    />
  );
}
