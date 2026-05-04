import { prisma } from "@/lib/prisma";

export async function generateClientId(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.business.count();
  const padded = String(count + 1).padStart(3, "0");
  return `CLT-${year}-${padded}`;
}

export async function generateBdmCode(subType: "BDM" | "MF"): Promise<string> {
  const prefix = subType === "MF" ? "BGOSMF" : "BDM";
  const count = await prisma.user.count({
    where: {
      role: "BDM",
      bdmSubType: subType,
    },
  });
  const padded = String(count + 1).padStart(3, "0");
  return `${prefix}${padded}`;
}
