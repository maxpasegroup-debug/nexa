export const CAREER7_AUTH_MODEL = "career7";

export type AuthBusinessModel = typeof CAREER7_AUTH_MODEL | "bgos";

export function getAuthBusinessModel(value: unknown): AuthBusinessModel {
  return typeof value === "string" && value.toLowerCase() === CAREER7_AUTH_MODEL
    ? CAREER7_AUTH_MODEL
    : "bgos";
}

export function isCareer7Auth(value: unknown) {
  return getAuthBusinessModel(value) === CAREER7_AUTH_MODEL;
}

export function getAuthRedirect({
  businessModel,
  callbackUrl,
  roleRedirect,
}: {
  businessModel: AuthBusinessModel;
  callbackUrl?: string;
  roleRedirect: string;
}) {
  if (callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//")) {
    return callbackUrl;
  }

  if (businessModel === CAREER7_AUTH_MODEL) {
    return "/career7/dashboard";
  }

  return roleRedirect;
}
