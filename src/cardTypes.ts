export type CardChallenge = {
  action: string;
  url: string;
  method: string;
  body: { amount_sgd: number; cardholder_name: string };
  environment: Record<string, unknown>;
  steps: string[];
};

export type X402Requirement = {
  scheme: string;
  network: string;
  amount: string;
  asset: string;
  payTo: string;
  maxTimeoutSeconds: number;
  chainId: number;
  extra: { assetTransferMethod: string; name: string; version: string };
};

export type X402Challenge = {
  x402Version: number;
  error: string;
  accepts: X402Requirement[];
};

export type CardIssueResult = {
  card_opaque_id: string;
  card_html?: string;
  settlement_tx: string;
};
