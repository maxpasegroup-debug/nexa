import { api } from "./client";
import type { SoulVaultResponse } from "./types";

const SOUL_VAULT_PATH = "/api/career7/vault";

export const soulVaultApi = {
  getSoulVault: () => api.get<SoulVaultResponse>(SOUL_VAULT_PATH),
  safeGetSoulVault: () => api.safeGet<SoulVaultResponse>(SOUL_VAULT_PATH),
};
