import { api } from "./client";
import type {
  Career7WalletResponse,
  Career7WalletTopUpRequest,
  Career7WalletTopUpResponse,
} from "./types";

const WALLET_PATH = "/api/career7/wallet";

export const walletApi = {
  getWallet: () => api.get<Career7WalletResponse>(WALLET_PATH),
  safeGetWallet: () => api.safeGet<Career7WalletResponse>(WALLET_PATH),
  topUpWallet: (body: Career7WalletTopUpRequest) =>
    api.post<Career7WalletTopUpResponse>(WALLET_PATH, body),
  safeTopUpWallet: (body: Career7WalletTopUpRequest) =>
    api.safePost<Career7WalletTopUpResponse>(WALLET_PATH, body),
};
