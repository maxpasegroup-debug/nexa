import type { DefaultSession } from "next-auth";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface User {
    role?: Role | string;
    businessId?: string | null;
    companyId?: string | null;
    theme?: string;
    isActive?: boolean;
    defaultPassword?: boolean;
    bdmSubType?: string;
    bdmCode?: string | null;
  }

  interface Session {
    user: {
      id: string;
      role: Role | string;
      companyId: string | null;
      businessId: string | null;
      theme: string;
      isActive: boolean;
      defaultPassword: boolean;
      bdmSubType: string;
      bdmCode: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: Role | string;
    companyId?: string | null;
    businessId?: string | null;
    theme?: string;
    isActive?: boolean;
    defaultPassword?: boolean;
    bdmSubType?: string;
    bdmCode?: string | null;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    role?: Role | string;
    companyId?: string | null;
    businessId?: string | null;
    theme?: string;
    isActive?: boolean;
    defaultPassword?: boolean;
    bdmSubType?: string;
    bdmCode?: string | null;
  }
}
