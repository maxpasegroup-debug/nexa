import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

import { BLIZZWAY_AUTH_MODEL, getAuthBusinessModel, isCareer7Auth } from "@/lib/auth-business-model";
import { BLIZZWAY_BUSINESS_MODEL, CAREER7_BUSINESS_MODEL } from "@/lib/career7-wallet";
import { generateClientId } from "@/lib/client-id";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const limited = rateLimit(request, {
    key: "register",
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });
  if (limited) return limited;

  try {
    const { name, email, password, businessModel: rawBusinessModel } = await request.json();
    const userName = String(name ?? "").trim();
    const businessModel = getAuthBusinessModel(rawBusinessModel);
    const isCareer7 = isCareer7Auth(businessModel);
    const ventureBusinessModel =
      businessModel === BLIZZWAY_AUTH_MODEL ? BLIZZWAY_BUSINESS_MODEL : CAREER7_BUSINESS_MODEL;

    if (!userName || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 },
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists." },
        { status: 409 },
      );
    }

    const hashedPassword = await hash(String(password), 12);
    const clientId = await generateClientId();
    const user = await prisma.$transaction(async (tx) => {
      const business = await tx.business.create({
        data: {
          clientId,
          name: isCareer7 ? `${userName}'s Blizzway Workspace` : `${userName}'s Business`,
          type: isCareer7 ? ventureBusinessModel : "Not set",
          teamSize: isCareer7 ? "1" : "Not set",
          goal: isCareer7 ? "Career growth" : "Not set",
          healthScore: 50,
          plan: isCareer7
            ? ventureBusinessModel === BLIZZWAY_BUSINESS_MODEL
              ? "BLIZZWAY_STARTER"
              : "CAREER7_STARTER"
            : "STARTER",
        },
        select: { id: true },
      });

      const createdUser = await tx.user.create({
        data: {
          name: userName,
          email: normalizedEmail,
          password: hashedPassword,
          role: "BOSS",
          businessId: business.id,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          businessId: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (isCareer7) {
        await tx.businessPaymentConfig.upsert({
          where: {
            businessModel_businessId: {
              businessModel: ventureBusinessModel,
              businessId: business.id,
            },
          },
          create: {
            businessModel: ventureBusinessModel,
            businessId: business.id,
            enabledGateways: ["MANUAL"],
            defaultGateway: "MANUAL",
            currency: "INR",
            successCallback: `${ventureBusinessModel}.payment.success`,
            failureCallback: `${ventureBusinessModel}.payment.failure`,
          },
          update: {},
        });

        await tx.career7CreditWallet.create({
          data: {
            businessId: business.id,
            userId: createdUser.id,
            balance: 0,
          },
        });
      }

      return createdUser;
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Unable to register user." },
      { status: 500 },
    );
  }
}
