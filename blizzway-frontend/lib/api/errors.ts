export type ApiErrorPayload = {
  error?: string;
  message?: string;
  code?: string;
  details?: unknown;
};

export type ApiResult<T> =
  | {
      ok: true;
      data: T;
      error: null;
    }
  | {
      ok: false;
      data: null;
      error: ApiError;
    };

export class ApiError extends Error {
  status: number;
  payload: ApiErrorPayload | null;
  code?: string;
  details?: unknown;

  constructor({
    message,
    status,
    payload,
  }: {
    message: string;
    status: number;
    payload?: ApiErrorPayload | null;
  }) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload ?? null;
    this.code = payload?.code;
    this.details = payload?.details;
  }
}

export function getApiErrorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

export function toApiError(error: unknown) {
  if (error instanceof ApiError) return error;
  return new ApiError({
    status: 0,
    message: getApiErrorMessage(error),
    payload: null,
  });
}

export async function safeApiCall<T>(request: Promise<T>): Promise<ApiResult<T>> {
  try {
    return {
      ok: true,
      data: await request,
      error: null,
    };
  } catch (error) {
    return {
      ok: false,
      data: null,
      error: toApiError(error),
    };
  }
}
