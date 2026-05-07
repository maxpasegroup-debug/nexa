export type ApiErrorPayload = {
  error?: string;
  message?: string;
  code?: string;
  details?: unknown;
};

export class ApiError extends Error {
  status: number;
  payload: ApiErrorPayload | null;

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
  }
}

export function getApiErrorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}
