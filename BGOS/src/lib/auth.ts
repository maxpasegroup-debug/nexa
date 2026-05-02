import type { DefaultSession } from "next-auth";
import NextAuth from "next-auth";
import type { Adapter } from "next-auth/adapters";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import type { Role } from "@prisma/client";

import { generateClientId } from "@/lib/client-id";
import { prisma } from "@/lib/prisma";

declare module "next-auth" {
  interface User {
    role?: Role;
    businessId?: string | null;
    defaultPassword?: boolean;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
      businessId: string | null;
      defaultPassword: boolean;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
    businessId?: string | null;
    defaultPassword?: boolean;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: "jwt",
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

        if (!user || !user.active) {
          return null;
        }

        const passwordMatches = await compare(password, user.password);

        if (!passwordMatches) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          businessId: user.businessId,
          defaultPassword: user.defaultPassword,
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
            },
          });

          return "/onboarding";
        }
      }

      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const email = user.email?.toLowerCase();
        const dbUser = email
          ? await prisma.user.findUnique({ where: { email } })
          : null;

        token.id = dbUser?.id ?? user.id;
        token.role = dbUser?.role ?? user.role;
        token.businessId = dbUser?.businessId ?? user.businessId ?? null;
        token.defaultPassword =
          dbUser?.defaultPassword ?? user.defaultPassword ?? false;
      }

      if (trigger === "update" && session?.user) {
        token.defaultPassword = Boolean(session.user.defaultPassword);
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id ?? "";
        session.user.role = token.role ?? "BDM";
        session.user.businessId = token.businessId ?? null;
        session.user.defaultPassword = token.defaultPassword ?? false;
      }

      return session;
    },
  },
});

export default auth;
