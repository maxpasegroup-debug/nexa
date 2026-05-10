import { api } from "./client";
import type { Career7NexaRequest, Career7NexaResponse } from "./types";

const NEXA_PATH = "/api/career7/nexa";

export const nexaApi = {
  askNexa: (body: Career7NexaRequest) => api.post<Career7NexaResponse>(NEXA_PATH, body),
  safeAskNexa: (body: Career7NexaRequest) =>
    api.safePost<Career7NexaResponse>(NEXA_PATH, body),
};
