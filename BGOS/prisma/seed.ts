import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // Check if owner already exists
  const existing = await prisma.user.findUnique({
    where: { email: "boss@bgos.online" },
  })

  if (existing) {
    console.log("Owner account already exists - skipping seed")
    return
  }

  const ownerPassword = process.env.SEED_OWNER_PASSWORD
  if (!ownerPassword) {
    throw new Error("SEED_OWNER_PASSWORD is required to seed the owner account")
  }

  // Create BGOS internal business
  const business = await prisma.business.create({
    data: {
      name: "BGOS",
      type: "SaaS / AI Platform",
      teamSize: "2-10",
      goal: "Build and grow the BGOS platform",
      healthScore: 80,
    },
  })

  // Create owner account
  const hashedPassword = await bcrypt.hash(ownerPassword, 12)
  const owner = await prisma.user.create({
    data: {
      name: "BGOS Owner",
      email: "boss@bgos.online",
      password: hashedPassword,
      role: "OWNER",
      businessId: business.id,
      defaultPassword: false,
    },
  })

  // Create onboarding session as completed
  await prisma.onboardingSession.create({
    data: {
      userId: owner.id,
      step: 5,
      completed: true,
      answers: {
        "0": "AI SaaS Platform",
        "1": "2-5 people",
        "2": "Growing customer base",
        "3": "Kochi, Kerala",
        "4": "Setup complete",
      },
    },
  })

  console.log("BGOS owner account created")
  console.log("Email: boss@bgos.online")
  console.log("Business: BGOS Internal")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
