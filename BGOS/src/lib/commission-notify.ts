import {
  calcMonthlyEarnings,
  checkAndAwardSlab,
} from "@/lib/commission";
import { sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

function money(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

export async function notifySlabAchievement(userId: string) {
  const achievement = await checkAndAwardSlab(userId);
  if (!achievement) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      businessId: true,
      business: {
        select: {
          users: {
            where: { role: { in: ["BOSS", "OWNER"] } },
            select: { name: true, email: true },
            take: 1,
          },
        },
      },
    },
  });

  if (!user?.businessId) return achievement;

  const slabLabel = achievement.slabName;
  const bonus = money(achievement.bonusAmt);
  const earnings = await calcMonthlyEarnings(
    userId,
    achievement.month,
    achievement.year,
  );

  await prisma.nexaInsight.create({
    data: {
      businessId: user.businessId,
      type: "opportunity",
      message: `${user.name} just unlocked ${slabLabel} - ${bonus} bonus earned this month`,
      action: "Celebrate win",
    },
  });

  await sendEmail({
    to: user.email,
    toName: user.name,
    subject: `You unlocked ${slabLabel}!`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6">
        <h1>Congratulations, ${user.name}</h1>
        <p>You unlocked the <strong>${slabLabel}</strong> slab.</p>
        <p>Bonus earned this month: <strong>${bonus}</strong></p>
        <p>Current total earnings: <strong>${money(earnings.total)}</strong></p>
      </div>
    `,
  });

  const boss = user.business?.users[0];
  if (boss) {
    await sendEmail({
      to: boss.email,
      toName: boss.name,
      subject: `${user.name} hit ${slabLabel} slab`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6">
          <p><strong>${user.name}</strong> hit the <strong>${slabLabel}</strong> slab this month.</p>
          <p>${bonus} bonus triggered.</p>
        </div>
      `,
    });
  }

  return achievement;
}
