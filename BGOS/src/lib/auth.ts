import NextAuth from "next-auth";
import type { Adapter } from "next-auth/adapters";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";

import { generateClientId } from "@/lib/client-id";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        if (!user || !user.active || !user.isActive) {
          return null;
        }

        const passwordMatches = await compare(password, user.password);

        if (!passwordMatches) {
          return null;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          businessId: user.businessId,
          companyId: user.businessId,
          theme: user.theme,
          isActive: user.isActive,
          defaultPassword: user.defaultPassword,
          bdmSubType: user.bdmSubType,
          bdmCode: user.bdmCode,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const email = user.email?.toLowerCase();

        if (!email) {
          return false;
        }

        const existing = await prisma.user.findUnique({
          where: { email },
        });

        if (existing && (!existing.active || !existing.isActive)) {
          return false;
        }

        if (!existing) {
          const business = await prisma.business.create({
            data: {
              clientId: await generateClientId(),
              name: `${user.name ?? "New User"}'s Business`,
              type: "Not set",
              teamSize: "Not set",
              goal: "Not set",
              healthScore: 50,
            },
          });

          await prisma.user.create({
            data: {
              name: user.name ?? email,
              email,
              password: "",
              role: "BOSS",
              businessId: business.id,
              defaultPassword: false,
              isActive: true,
              lastLoginAt: new Date(),
            },
          });

          return "/onboarding";
        }

        await prisma.user.update({
          where: { id: existing.id },
          data: { lastLoginAt: new Date() },
        });
      }

      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user || !token.role) {
        const email = (user?.email ?? token.email)?.toLowerCase();
        const userId = user?.id ?? token.id ?? token.sub;
        try {
          const dbUser = userId
            ? await prisma.user.findUnique({
                where: { id: userId },
                select: {
                  id: true,
                  role: true,
                  businessId: true,
                  theme: true,
                  isActive: true,
                  defaultPassword: true,
                  bdmSubType: true,
                  bdmCode: true,
                },
              })
            : email
              ? await prisma.user.findUnique({
                  where: { email },
                  select: {
                    id: true,
                    role: true,
                    businessId: true,
                    theme: true,
                    isActive: true,
                    defaultPassword: true,
                    bdmSubType: true,
                    bdmCode: true,
                  },
                })
              : null;

          token.id = dbUser?.id ?? user?.id ?? token.id ?? token.sub;
          token.role = dbUser?.role ?? user?.role ?? "EMPLOYEE";
          token.companyId = dbUser?.businessId ?? user?.companyId ?? user?.businessId ?? null;
          token.businessId = dbUser?.businessId ?? user?.businessId ?? token.companyId ?? null;
          token.theme = dbUser?.theme ?? user?.theme ?? "dark";
          token.isActive = dbUser?.isActive ?? user?.isActive ?? true;
          token.defaultPassword = dbUser?.defaultPassword ?? user?.defaultPassword ?? false;
          token.bdmSubType = dbUser?.bdmSubType ?? user?.bdmSubType ?? "BDM";
          token.bdmCode = dbUser?.bdmCode ?? user?.bdmCode ?? null;
        } catch (error) {
          console.error("[auth:jwt] Failed to refresh token from database", error);
          token.id = user?.id ?? token.id ?? token.sub;
          token.role = user?.role ?? token.role ?? "EMPLOYEE";
          token.companyId = user?.companyId ?? user?.businessId ?? token.companyId ?? null;
          token.businessId = user?.businessId ?? token.businessId ?? token.companyId ?? null;
          token.theme = user?.theme ?? token.theme ?? "dark";
          token.isActive = user?.isActive ?? token.isActive ?? true;
          token.defaultPassword = user?.defaultPassword ?? token.defaultPassword ?? false;
          token.bdmSubType = user?.bdmSubType ?? token.bdmSubType ?? "BDM";
          token.bdmCode = user?.bdmCode ?? token.bdmCode ?? null;
        }
      }

      if (!token.role) token.role = "EMPLOYEE";
      if (token.companyId === undefined) token.companyId = token.businessId ?? null;
      if (token.businessId === undefined) token.businessId = token.companyId ?? null;
      if (!token.theme) token.theme = "dark";
      if (token.isActive === undefined) token.isActive = true;
      if (!token.bdmSubType) token.bdmSubType = "BDM";
      if (token.bdmCode === undefined) token.bdmCode = null;

      if (trigger === "update" && session?.user) {
        token.defaultPassword = Boolean(session.user.defaultPassword);
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id ?? token.sub ?? "";
        session.user.role = token.role ?? "EMPLOYEE";
        session.user.companyId = token.companyId ?? token.businessId ?? null;
        session.user.businessId = token.businessId ?? null;
        session.user.theme = token.theme ?? "dark";
        session.user.isActive = token.isActive ?? true;
        session.user.defaultPassword = token.defaultPassword ?? false;
        session.user.bdmSubType = token.bdmSubType ?? "BDM";
        session.user.bdmCode = token.bdmCode ?? null;
      }

      return session;
    },
  },
});

export default auth;
