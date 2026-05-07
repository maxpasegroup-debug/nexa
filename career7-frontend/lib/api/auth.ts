export type ApiAuthTokenProvider = () => string | null | undefined | Promise<string | null | undefined>;

let authTokenProvider: ApiAuthTokenProvider | null = null;

export function setApiAuthTokenProvider(provider: ApiAuthTokenProvider | null) {
  authTokenProvider = provider;
}

export async function getApiAuthToken() {
  return authTokenProvider ? await authTokenProvider() : null;
}

export function getSessionEndpoint() {
  return "/api/auth/session";
}
