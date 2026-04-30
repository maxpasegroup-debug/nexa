import { WorkspacePreviewClient } from "@/components/trial/workspace-preview-client";

export default function WorkspacePreviewPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  return <WorkspacePreviewClient token={searchParams.token ?? ""} />;
}
