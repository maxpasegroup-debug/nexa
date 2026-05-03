import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.updateMany({
    where: { email: { contains: "boss@bgos.online" } },
    data: { role: "OWNER", theme: "dark", isActive: true },
  });

  await prisma.user.updateMany({
    where: {
      OR: [
        { email: { contains: ".bdm@" } },
        { role: { equals: "BDM" } },
      ],
    },
    data: { role: "BDM", theme: "dark", isActive: true },
  });

  await prisma.user.updateMany({
    where: {
      OR: [
        { email: { contains: ".sde@" } },
        { role: { equals: "SDE" } },
      ],
    },
    data: { role: "SDE", theme: "dark", isActive: true },
  });

  await prisma.user.updateMany({
    where: { role: { equals: "BOSS" } },
    data: { role: "BOSS", theme: "dark", isActive: true },
  });

  const internalBusinessId = process.env.BGOS_INTERNAL_BUSINESS_ID;
  if (internalBusinessId) {
    await prisma.user.updateMany({
      where: {
        businessId: { not: internalBusinessId },
        role: { notIn: ["OWNER", "BDM", "SDE", "BOSS", "ADMIN"] },
      },
      data: {
        role: "EMPLOYEE",
        theme: "light",
        isLegacyIceconnect: true,
        isActive: true,
      },
    });
  } else {
    console.warn("BGOS_INTERNAL_BUSINESS_ID is not set. Skipped legacy employee classification.");
  }

  const counts = await prisma.user.groupBy({ by: ["role"], _count: true });
  console.log("Migration complete:", counts);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
