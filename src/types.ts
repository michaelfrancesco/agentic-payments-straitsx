export interface Mandate {
  capTotal: number;
  perTransactionLimit: number;
  merchantAllowlist: string[];
  expiresAt: number;
}

export interface Intent {
  merchant: string;
  amount: number;
  item: string;
}

export interface PolicyContext {
  spentSoFar: number;
  balance?: number;
  now?: number;
}

export type DeclineReason =
  | "CAP_EXCEEDED"
  | "TXN_LIMIT_EXCEEDED"
  | "MERCHANT_NOT_ALLOWED"
  | "MANDATE_EXPIRED"
  | "INSUFFICIENT_BALANCE"
  | "MANDATE_REVOKED"
  | "SUSPICIOUS_MCP_RESPONSE";

export type PolicyResult =
  | { verdict: "APPROVE" }
  | { verdict: "DECLINE"; reason: DeclineReason };
