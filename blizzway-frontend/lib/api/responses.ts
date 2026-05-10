import type { ApiError } from "./errors";

export type LoadingState = "idle" | "loading" | "success" | "error";

export type AsyncData<T> = {
  status: LoadingState;
  data: T | null;
  error: ApiError | null;
};

export type ApiListResponse<T> = {
  items: T[];
  total: number;
};

export type ApiMutationResponse<T> = {
  item: T;
};

export function idleData<T>(data: T | null = null): AsyncData<T> {
  return {
    status: "idle",
    data,
    error: null,
  };
}

export function loadingData<T>(data: T | null = null): AsyncData<T> {
  return {
    status: "loading",
    data,
    error: null,
  };
}
