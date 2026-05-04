export const BOSS_DOMAIN = "bgos.online";

export function getLogoutCallbackUrl(role?: string, host?: string): string {
  const currentHost = host ?? "";

  if (role) return `https://${BOSS_DOMAIN}`;
  if (currentHost.includes(BOSS_DOMAIN)) return `https://${BOSS_DOMAIN}`;

  return "/";
}
