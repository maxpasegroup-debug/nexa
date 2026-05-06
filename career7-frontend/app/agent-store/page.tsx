import { PlaceholderPage } from "../placeholder-page";

export default function AgentStorePage() {
  return (
    <PlaceholderPage
      activeHref="/agent-store"
      eyebrow="Agent Store"
      title="Agent Store"
      description="A premium app-store style marketplace for AI career agents."
      previewTitle="Install focused agents for every career job."
      previewDescription="Career7 agents will help with resumes, interviews, portfolio proof, opportunity discovery, and growth strategy."
      highlights={["Resume", "Interview", "Scout"]}
    />
  );
}
