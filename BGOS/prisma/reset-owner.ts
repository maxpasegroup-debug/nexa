import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const email = "boss@bgos.online"
  const newPassword = "@Supremacy#2055"

  // Find the user
  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    console.log("❌ User not found — running full seed instead")
    
    // Create business first
    const business = await prisma.business.create({
      data: {
        name: "BGOS",
        type: "SaaS / AI Platform",
        teamSize: "2-10",
        goal: "Build and grow the BGOS platform",
        healthScore: 80,
      }
    })

    // Create owner
    const hashed = await bcrypt.hash(newPassword, 12)
    await prisma.user.create({
      data: {
        name: "BGOS Owner",
        email,
        password: hashed,
        role: "OWNER",
        businessId: business.id,
        defaultPassword: false,
      }
    })

    // Create completed onboarding
    const newUser = await prisma.user.findUnique({ where: { email } })
    if (newUser) {
      await prisma.onboardingSession.create({
        data: {
          userId: newUser.id,
          step: 5,
          completed: true,
          answers: {}
        }
      })
    }

    console.log("✅ Owner account created from scratch")
    console.log(`Email: ${email}`)
    console.log(`Password: ${newPassword}`)
    return
  }

  // User exists — reset password
  const hashed = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({
    where: { email },
    data: {
      password: hashed,
      role: "OWNER",
      defaultPassword: false,
    }
  })

  // Make sure onboarding is marked complete
  const existing = await prisma.onboardingSession.findUnique({
    where: { userId: user.id }
  })

  if (!existing) {
    await prisma.onboardingSession.create({
      data: {
        userId: user.id,
        step: 5,
        completed: true,
        answers: {}
      }
    })
  } else {
    await prisma.onboardingSession.update({
      where: { userId: user.id },
      data: { step: 5, completed: true }
    })
  }

  console.log("✅ Owner password reset successfully")
  console.log(`Email: ${email}`)
  console.log(`Password: ${newPassword}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
