import type { DefaultSession } from "next-auth";
import NextAuth from "next-auth";
import type { Adapter } from "next-auth/adapters";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import type { Role } from "@prisma/client";

import { prisma } from "@/lib/prisma";

declare module "next-auth" {
  interface User {
    role?: Role;
    defaultPassword?: boolean;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
      defaultPassword: boolean;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
    defaultPassword?: boolean;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
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

        if (!user) {
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
          defaultPassword: user.defaultPassword,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.defaultPassword = user.defaultPassword ?? false;
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
        session.user.defaultPassword = token.defaultPassword ?? false;
      }

      return session;
    },
  },
});

export default auth;
