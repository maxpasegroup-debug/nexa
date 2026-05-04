import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRaw`
    UPDATE "User"
    SET role = 'EMPLOYEE'::"Role", theme = 'light', "isActive" = true
    WHERE role IS NULL
  `;

  await prisma.user.updateMany({
    where: { email: { contains: ".bdm@" } },
    data: { role: "BDM", theme: "dark", isActive: true },
  });

  await prisma.user.updateMany({
    where: { email: { contains: ".sde@" } },
    data: { role: "SDE", theme: "dark", isActive: true },
  });

  await prisma.user.updateMany({
    where: { email: "boss@bgos.online" },
    data: { role: "OWNER", theme: "dark", isActive: true },
  });

  await prisma.$executeRaw`
    UPDATE "User"
    SET role = 'EMPLOYEE'::"Role", theme = 'light', "isActive" = true
    WHERE role::text NOT IN ('OWNER', 'BDM', 'SDE', 'BOSS', 'EMPLOYEE', 'ADMIN')
  `;

  const counts = await prisma.user.groupBy({ by: ["role"], _count: true });
  console.log("Fixed:", counts);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
