import { AssessmentRunner } from "./runner";

export default async function AssessmentDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <AssessmentRunner slug={slug} />;
}
