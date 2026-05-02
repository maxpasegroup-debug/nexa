import { prisma } from "@/lib/prisma";

export async function generateClientId(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.business.count();
  const padded = String(count + 1).padStart(3, "0");
  return `CLT-${year}-${padded}`;
}
