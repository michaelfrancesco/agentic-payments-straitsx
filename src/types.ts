export type Mandate = {
  capTotal: number;
  perTransactionLimit: number;
  merchantAllowlist: string[];
  expiresAt: number;
};

export type Intent = {
  merchant: string;
  amount: number;
  item: string;
};

export type PolicyContext = {
  spentSoFar: number;
  balance?: number;
  now?: number;
};

export type ReasonCode =
  | "CAP_EXCEEDED"
  | "TXN_LIMIT_EXCEEDED"
  | "MERCHANT_NOT_ALLOWED"
  | "MANDATE_EXPIRED"
  | "INSUFFICIENT_BALANCE"
  | "MANDATE_REVOKED";

export type PolicyResult =
  | { verdict: "APPROVE" }
  | { verdict: "DECLINE"; reason: ReasonCode };
