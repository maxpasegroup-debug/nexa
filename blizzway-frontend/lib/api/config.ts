const DEFAULT_API_BASE_URL = "/api/bgos";

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export function getApiBaseUrl() {
  return trimTrailingSlash(
    process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_BASE_URL,
  );
}

export const apiConfig = {
  baseUrl: getApiBaseUrl(),
};
