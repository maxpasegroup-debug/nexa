import { apiConfig } from "./config";
import { ApiError, type ApiErrorPayload } from "./errors";
import { safeApiCall } from "./errors";
import { getApiAuthToken } from "./auth";

type QueryValue = string | number | boolean | null | undefined;

export type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  query?: Record<string, QueryValue>;
  authToken?: string | null;
};

function buildUrl(path: string, query?: Record<string, QueryValue>) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${apiConfig.baseUrl}${normalizedPath}`);

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

async function readErrorPayload(response: Response): Promise<ApiErrorPayload | null> {
  try {
    return (await response.json()) as ApiErrorPayload;
  } catch {
    return null;
  }
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const token = options.authToken === undefined ? await getApiAuthToken() : options.authToken;
  const headers = new Headers(options.headers);

  if (options.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path, options.query), {
    ...options,
    headers,
    credentials: options.credentials ?? "include",
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (!response.ok) {
    const payload = await readErrorPayload(response);
    throw new ApiError({
      status: response.status,
      payload,
      message: payload?.error || payload?.message || `Request failed with status ${response.status}`,
    });
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const api = {
  get: <T>(path: string, options?: ApiRequestOptions) =>
    apiRequest<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    apiRequest<T>(path, { ...options, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    apiRequest<T>(path, { ...options, method: "PATCH", body }),
  put: <T>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    apiRequest<T>(path, { ...options, method: "PUT", body }),
  delete: <T>(path: string, options?: ApiRequestOptions) =>
    apiRequest<T>(path, { ...options, method: "DELETE" }),
  safeGet: <T>(path: string, options?: ApiRequestOptions) =>
    safeApiCall(apiRequest<T>(path, { ...options, method: "GET" })),
  safePost: <T>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    safeApiCall(apiRequest<T>(path, { ...options, method: "POST", body })),
  safePatch: <T>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    safeApiCall(apiRequest<T>(path, { ...options, method: "PATCH", body })),
  safeDelete: <T>(path: string, options?: ApiRequestOptions) =>
    safeApiCall(apiRequest<T>(path, { ...options, method: "DELETE" })),
};
