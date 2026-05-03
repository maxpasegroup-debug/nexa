import { PrismaClient } from "@prisma/client";

import { updateWallet } from "../lib/commission-engine";

const prisma = new PrismaClient();

async function main() {
  const bdms = await prisma.user.findMany({ where: { role: "BDM" } });
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  for (const bdm of bdms) {
    const existing = await prisma.target.findFirst({
      where: { userId: bdm.id, month, year },
    });

    if (!existing) {
      await prisma.target.create({
        data: {
          userId: bdm.id,
          month,
          year,
          wonTarget: 6,
          revenueTarget: 30000,
          fixedSalary: 0,
          maxIncentive: 30000,
        },
      });
      console.log(`Target created for ${bdm.name}`);
    }

    await updateWallet(bdm.id);
    console.log(`Wallet updated for ${bdm.name}`);
  }

  console.log("Done");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
