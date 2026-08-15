import { describe, it, expect } from "vitest";
import { evaluatePolicy } from "./policy.js";
import type { Mandate } from "./types.js";

const mandate: Mandate = {
  capTotal: 25,
  perTransactionLimit: 15,
  merchantAllowlist: ["mikes-store", "daily-groceries", "bros-bros"],
  expiresAt: Date.now() + 48 * 60 * 60 * 1000,
};

describe("evaluatePolicy", () => {
  it("approves an intent that passes all rules", () => {
    const result = evaluatePolicy(
      mandate,
      { merchant: "mikes-store", amount: 10, item: "widget" },
      { spentSoFar: 0 }
    );
    expect(result).toEqual({ verdict: "APPROVE" });
  });

  it("declines with MANDATE_EXPIRED when past expiry", () => {
    const expiredMandate: Mandate = { ...mandate, expiresAt: Date.now() - 1000 };
    const result = evaluatePolicy(
      expiredMandate,
      { merchant: "mikes-store", amount: 10, item: "widget" },
      { spentSoFar: 0 }
    );
    expect(result).toEqual({ verdict: "DECLINE", reason: "MANDATE_EXPIRED" });
  });

  it("declines with MERCHANT_NOT_ALLOWED when merchant is not on the allowlist", () => {
    const result = evaluatePolicy(
      mandate,
      { merchant: "sketchy-store", amount: 10, item: "widget" },
      { spentSoFar: 0 }
    );
    expect(result).toEqual({ verdict: "DECLINE", reason: "MERCHANT_NOT_ALLOWED" });
  });

  it("declines with TXN_LIMIT_EXCEEDED when amount exceeds per-transaction limit", () => {
    const result = evaluatePolicy(
      mandate,
      { merchant: "mikes-store", amount: 20, item: "widget" },
      { spentSoFar: 0 }
    );
    expect(result).toEqual({ verdict: "DECLINE", reason: "TXN_LIMIT_EXCEEDED" });
  });

  it("declines with CAP_EXCEEDED when spend would breach the total cap", () => {
    const result = evaluatePolicy(
      mandate,
      { merchant: "mikes-store", amount: 10, item: "widget" },
      { spentSoFar: 20 }
    );
    expect(result).toEqual({ verdict: "DECLINE", reason: "CAP_EXCEEDED" });
  });

  it("declines with INSUFFICIENT_BALANCE when amount exceeds on-chain balance", () => {
    const result = evaluatePolicy(
      mandate,
      { merchant: "mikes-store", amount: 10, item: "widget" },
      { spentSoFar: 0, balance: 5 }
    );
    expect(result).toEqual({ verdict: "DECLINE", reason: "INSUFFICIENT_BALANCE" });
  });
});
