import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const due = await prisma.user.findMany({
    where: {
      status: "DELETED",
      purgeAfter: { lte: new Date() },
    },
    select: { id: true, email: true },
  });

  for (const user of due) {
    await prisma.user.delete({ where: { id: user.id } });
    console.log(`Purged ${user.email}`);
  }

  console.log(`Purged ${due.length} deleted employees.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
