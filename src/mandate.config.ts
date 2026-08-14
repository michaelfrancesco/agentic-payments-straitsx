import type { Mandate } from "./types.js";

export const mandate: Mandate = {
  capTotal: 100,
  perTransactionLimit: 30,
  merchantAllowlist: ["acme-store", "globex-goods"],
  expiresAt: Date.now() + 48 * 60 * 60 * 1000,
};
