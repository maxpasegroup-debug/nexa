import { api } from "./client";
import type {
  BlizzwayDocumentApplyResponse,
  BlizzwayDocumentResponse,
  BlizzwayDocumentsResponse,
  BlizzwayVaultPayload,
  SoulVaultResponse,
} from "./types";

// Legacy BGOS compatibility: Blizzway endpoints are still exposed under /api/career7/*.
const SOUL_VAULT_PATH = "/api/career7/vault";
const DOCUMENTS_PATH = "/api/career7/documents";

export const soulVaultApi = {
  getSoulVault: () => api.get<SoulVaultResponse>(SOUL_VAULT_PATH),
  safeGetSoulVault: () => api.safeGet<SoulVaultResponse>(SOUL_VAULT_PATH),
  saveSoulVault: (body: BlizzwayVaultPayload) =>
    api.put<{ ok: boolean; vault: BlizzwayVaultPayload }>(SOUL_VAULT_PATH, body),
  getDocuments: () => api.get<BlizzwayDocumentsResponse>(DOCUMENTS_PATH),
  uploadDocument: (body: FormData) =>
    api.post<BlizzwayDocumentResponse>(`${DOCUMENTS_PATH}/upload`, body),
  getDocument: (id: string) =>
    api.get<BlizzwayDocumentResponse>(`${DOCUMENTS_PATH}/${id}`),
  parseDocument: (id: string) =>
    api.post<BlizzwayDocumentResponse>(`${DOCUMENTS_PATH}/${id}/parse`),
  applyDocumentToBdp: (id: string) =>
    api.post<BlizzwayDocumentApplyResponse>(`${DOCUMENTS_PATH}/${id}/apply-to-bdp`),
  deleteDocument: (id: string) =>
    api.delete<{ ok: boolean }>(`${DOCUMENTS_PATH}/${id}`),
};
