export interface X402Requirement {
  scheme: string;
  network: string;
  amount: string;
  asset: string;
  payTo: string;
  maxTimeoutSeconds: number;
  chainId: number;
  extra: {
    assetTransferMethod: string;
    name: string;
    version: string;
  };
}

export interface X402Challenge {
  x402Version: number;
  error: string;
  accepts: X402Requirement[];
}

export interface CardIssueResult {
  card_opaque_id?: string;
  card_html?: string;
  settlement_tx?: string;
  [key: string]: unknown;
}
