import { PlaceholderPage } from "../placeholder-page";

export default function QuickBoostsPage() {
  return (
    <PlaceholderPage
      activeHref="/quick-boosts"
      eyebrow="Quick Boosts"
      title="Quick Boosts"
      description="Small premium tools for fast wins across resumes, interviews, language, and clarity."
      previewTitle="Tiny actions that create real confidence."
      previewDescription="Dummy boost cards preview fast, focused tools without connecting any backend workflow."
      highlights={["Resume scan", "Mock interview", "Role fit"]}
      emptyTitle="No boosts running yet"
      emptyDescription="Quick Boost actions will appear here once the real boost system is connected."
      nexaSuggestion="Use a boost when one small improvement would make your next step easier today."
    />
  );
}
