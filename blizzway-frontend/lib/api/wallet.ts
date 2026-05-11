import { api } from "./client";
import type {
  BlizzwayWalletResponse,
  BlizzwayWalletTopUpRequest,
  BlizzwayWalletTopUpResponse,
} from "./types";

// Legacy BGOS compatibility: Blizzway endpoints are still exposed under /api/career7/*.
const WALLET_PATH = "/api/career7/wallet";

export const walletApi = {
  getWallet: () => api.get<BlizzwayWalletResponse>(WALLET_PATH),
  safeGetWallet: () => api.safeGet<BlizzwayWalletResponse>(WALLET_PATH),
  topUpWallet: (body: BlizzwayWalletTopUpRequest) =>
    api.post<BlizzwayWalletTopUpResponse>(`${WALLET_PATH}/top-up-orders`, body),
  safeTopUpWallet: (body: BlizzwayWalletTopUpRequest) =>
    api.safePost<BlizzwayWalletTopUpResponse>(`${WALLET_PATH}/top-up-orders`, body),
};
