import { api } from "./client";
import type { BlizzwayVaultPayload, SoulVaultResponse } from "./types";

const SOUL_VAULT_PATH = "/api/career7/vault";

export const soulVaultApi = {
  getSoulVault: () => api.get<SoulVaultResponse>(SOUL_VAULT_PATH),
  safeGetSoulVault: () => api.safeGet<SoulVaultResponse>(SOUL_VAULT_PATH),
  saveSoulVault: (body: BlizzwayVaultPayload) =>
    api.put<{ ok: boolean; vault: BlizzwayVaultPayload }>(SOUL_VAULT_PATH, body),
};
