import { describe, expect, it } from "vitest";
import { evaluatePolicy } from "./policy.js";
import type { Mandate } from "./types.js";

const baseMandate: Mandate = {
  capTotal: 100,
  perTransactionLimit: 30,
  merchantAllowlist: ["acme-store", "globex-goods"],
  expiresAt: Date.now() + 1000 * 60 * 60,
};

describe("evaluatePolicy", () => {
  it("approves an intent within cap, limit, allowlist, and expiry", () => {
    const result = evaluatePolicy(
      baseMandate,
      { merchant: "acme-store", amount: 10, item: "widget" },
      { spentSoFar: 0 },
    );
    expect(result).toEqual({ verdict: "APPROVE" });
  });

  it("declines MANDATE_EXPIRED when now is past expiry", () => {
    const result = evaluatePolicy(
      baseMandate,
      { merchant: "acme-store", amount: 10, item: "widget" },
      { spentSoFar: 0, now: baseMandate.expiresAt + 1 },
    );
    expect(result).toEqual({ verdict: "DECLINE", reason: "MANDATE_EXPIRED" });
  });

  it("approves exactly at the expiry instant (not yet expired)", () => {
    const result = evaluatePolicy(
      baseMandate,
      { merchant: "acme-store", amount: 10, item: "widget" },
      { spentSoFar: 0, now: baseMandate.expiresAt },
    );
    expect(result).toEqual({ verdict: "APPROVE" });
  });

  it("declines MERCHANT_NOT_ALLOWED for a merchant not on the allowlist", () => {
    const result = evaluatePolicy(
      baseMandate,
      { merchant: "shady-store", amount: 10, item: "widget" },
      { spentSoFar: 0 },
    );
    expect(result).toEqual({ verdict: "DECLINE", reason: "MERCHANT_NOT_ALLOWED" });
  });

  it("declines TXN_LIMIT_EXCEEDED when amount is over the per-transaction limit", () => {
    const result = evaluatePolicy(
      baseMandate,
      { merchant: "acme-store", amount: 31, item: "widget" },
      { spentSoFar: 0 },
    );
    expect(result).toEqual({ verdict: "DECLINE", reason: "TXN_LIMIT_EXCEEDED" });
  });

  it("approves exactly at the per-transaction limit", () => {
    const result = evaluatePolicy(
      baseMandate,
      { merchant: "acme-store", amount: 30, item: "widget" },
      { spentSoFar: 0 },
    );
    expect(result).toEqual({ verdict: "APPROVE" });
  });

  it("declines CAP_EXCEEDED when spent so far plus amount exceeds the cap", () => {
    const result = evaluatePolicy(
      baseMandate,
      { merchant: "acme-store", amount: 10, item: "widget" },
      { spentSoFar: 95 },
    );
    expect(result).toEqual({ verdict: "DECLINE", reason: "CAP_EXCEEDED" });
  });

  it("approves exactly at the cap", () => {
    const result = evaluatePolicy(
      baseMandate,
      { merchant: "acme-store", amount: 10, item: "widget" },
      { spentSoFar: 90 },
    );
    expect(result).toEqual({ verdict: "APPROVE" });
  });

  it("declines INSUFFICIENT_BALANCE when on-chain balance is below the requested amount", () => {
    const result = evaluatePolicy(
      baseMandate,
      { merchant: "acme-store", amount: 10, item: "widget" },
      { spentSoFar: 0, balance: 5 },
    );
    expect(result).toEqual({ verdict: "DECLINE", reason: "INSUFFICIENT_BALANCE" });
  });

  it("approves when balance exactly covers the amount", () => {
    const result = evaluatePolicy(
      baseMandate,
      { merchant: "acme-store", amount: 10, item: "widget" },
      { spentSoFar: 0, balance: 10 },
    );
    expect(result).toEqual({ verdict: "APPROVE" });
  });

  it("skips the balance check when balance is not provided", () => {
    const result = evaluatePolicy(
      baseMandate,
      { merchant: "acme-store", amount: 10, item: "widget" },
      { spentSoFar: 0 },
    );
    expect(result).toEqual({ verdict: "APPROVE" });
  });
});
