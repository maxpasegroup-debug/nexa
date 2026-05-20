import {
  BLIZZWAY_BUSINESS_MODEL,
  CAREER7_BUSINESS_MODEL,
  normalizeBlizzwayBusinessModel,
} from "@/lib/career7-wallet";

export const BLIZZWAY_AUTH_MODEL = BLIZZWAY_BUSINESS_MODEL;
export const CAREER7_AUTH_MODEL = CAREER7_BUSINESS_MODEL;

export type AuthBusinessModel =
  | typeof BLIZZWAY_AUTH_MODEL
  | typeof CAREER7_AUTH_MODEL
  | "nicejobs"
  | "bgos";

export function getAuthBusinessModel(value: unknown): AuthBusinessModel {
  if (value === "nicejobs") return "nicejobs";
  return normalizeBlizzwayBusinessModel(value) ?? "bgos";
}

export function isCareer7Auth(value: unknown) {
  const businessModel = getAuthBusinessModel(value);
  return businessModel === BLIZZWAY_AUTH_MODEL || businessModel === CAREER7_AUTH_MODEL;
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

  if (businessModel === BLIZZWAY_AUTH_MODEL || businessModel === CAREER7_AUTH_MODEL) {
    return "/career7/dashboard";
  }

  if (businessModel === "nicejobs") {
    return "/nicejobs/dashboard";
  }

  return roleRedirect;
}
