export const BOSS_DOMAIN = "bgos.online";
export const EMPLOYEE_DOMAIN = "iceconnect.in";
export const LOCAL_DEV = "localhost:3000";

export type DomainType = "boss" | "employee" | "dev";

export function getDomainType(host: string): DomainType {
  if (host.includes(BOSS_DOMAIN)) return "boss";
  if (host.includes(EMPLOYEE_DOMAIN)) return "employee";
  return "dev";
}

export function isBossRole(role: string): boolean {
  return role === "OWNER" || role === "BOSS";
}

export function isEmployeeRole(role: string): boolean {
  return role === "BDM" || role === "SDE";
}

export function getRedirectForRole(role: string): string {
  if (role === "OWNER") return "/internal";
  if (role === "BOSS") return "/boss";
  if (role === "BDM") return "/bdm";
  if (role === "SDE") return "/sde";
  if (role === "EMPLOYEE") return "/app";
  return "/login";
}

export function getDashboardDomain(role: string): string {
  const isProd = process.env.NODE_ENV === "production";
  if (!isProd) return "";
  if (isBossRole(role)) return `https://${BOSS_DOMAIN}`;
  if (isEmployeeRole(role)) return `https://${EMPLOYEE_DOMAIN}`;
  return "";
}

export function getLogoutCallbackUrl(role?: string, host?: string): string {
  const currentHost = host ?? "";

  if (role && isEmployeeRole(role)) return `https://${EMPLOYEE_DOMAIN}`;
  if (role && isBossRole(role)) return `https://${BOSS_DOMAIN}`;
  if (currentHost.includes(EMPLOYEE_DOMAIN)) return `https://${EMPLOYEE_DOMAIN}`;
  if (currentHost.includes(BOSS_DOMAIN)) return `https://${BOSS_DOMAIN}`;

  return "/";
}
