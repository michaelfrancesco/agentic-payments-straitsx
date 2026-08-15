import type { Mandate } from "./types.js";

export const mandate: Mandate = {
  capTotal: 25,
  perTransactionLimit: 15,
  merchantAllowlist: ["mikes-store", "daily-groceries", "bros-bros"],
  expiresAt: Date.now() + 48 * 60 * 60 * 1000,
};
