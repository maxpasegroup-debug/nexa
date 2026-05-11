import { BlizzwayAdminPage } from "@/components/internal/blizzway-admin-page";
import { requireInternalOwner } from "@/lib/internal-owner";

export const dynamic = "force-dynamic";

export default async function InternalBlizzwayContentPage() {
  const { owner } = await requireInternalOwner();
  return <BlizzwayAdminPage user={{ id: owner.id, name: owner.name, email: owner.email, role: owner.role }} initialSection="content" />;
}
