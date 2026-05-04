export function getRoleRedirect(role: string): string {
  const redirects: Record<string, string> = {
    OWNER: "/internal",
    BDM: "/bdm",
    SDE: "/sde",
    BOSS: "/boss",
    EMPLOYEE: "/app",
    ADMIN: "/internal",
  };

  return redirects[role] || "/login";
}
