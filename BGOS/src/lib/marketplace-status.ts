export type MarketplaceLifecycleStatus =
  | "pending"
  | "paid"
  | "activating"
  | "active"
  | "failed";

export function marketplaceLifecycleStatus(status: string): MarketplaceLifecycleStatus {
  switch (status.toUpperCase()) {
    case "PAYMENT_DONE":
      return "paid";
    case "SDE_BUILDING":
      return "activating";
    case "ACTIVE":
      return "active";
    case "FAILED":
    case "CANCELLED":
      return "failed";
    case "PENDING":
    default:
      return "pending";
  }
}

export function marketplaceStatusLabel(status: string) {
  return marketplaceLifecycleStatus(status);
}

export function marketplaceStatusClass(status: string) {
  switch (marketplaceLifecycleStatus(status)) {
    case "active":
      return "border-[#22D9A0]/30 bg-[#22D9A0]/10 text-[#22D9A0]";
    case "paid":
      return "border-blue-400/30 bg-blue-400/10 text-blue-200";
    case "activating":
      return "border-[#7C6FFF]/30 bg-[#7C6FFF]/10 text-[#c8c2ff]";
    case "failed":
      return "border-[#FF6B6B]/30 bg-[#FF6B6B]/10 text-[#FF6B6B]";
    case "pending":
    default:
      return "border-[#F5A623]/30 bg-[#F5A623]/10 text-[#F5A623]";
  }
}
