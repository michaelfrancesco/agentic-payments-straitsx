import type { Intent, Mandate, PolicyContext, PolicyResult } from "./types.js";

export function evaluatePolicy(
  mandate: Mandate,
  intent: Intent,
  context: PolicyContext,
): PolicyResult {
  const now = context.now ?? Date.now();

  if (now > mandate.expiresAt) {
    return { verdict: "DECLINE", reason: "MANDATE_EXPIRED" };
  }

  if (!mandate.merchantAllowlist.includes(intent.merchant)) {
    return { verdict: "DECLINE", reason: "MERCHANT_NOT_ALLOWED" };
  }

  if (intent.amount > mandate.perTransactionLimit) {
    return { verdict: "DECLINE", reason: "TXN_LIMIT_EXCEEDED" };
  }

  if (context.spentSoFar + intent.amount > mandate.capTotal) {
    return { verdict: "DECLINE", reason: "CAP_EXCEEDED" };
  }

  if (context.balance !== undefined && intent.amount > context.balance) {
    return { verdict: "DECLINE", reason: "INSUFFICIENT_BALANCE" };
  }

  return { verdict: "APPROVE" };
}
