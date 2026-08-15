import { randomBytes } from "node:crypto";
import type { Account } from "viem";
import type { CardIssueResult, X402Challenge, X402Requirement } from "./cardTypes.js";

const XSGD_FUJI_CONTRACT = "0xd769410dc8772695a7f55a304d2125320a65c2a5";
const FUJI_CHAIN_ID = 43113;
const XSGD_DECIMALS = 6;

interface IssueCardBody {
  amount_sgd: number;
  cardholder_name: string;
}

export interface X402Receipt {
  cardApiUrl: string;
  x402Version: number;
  scheme: string;
  network: string;
  chainId: number;
  asset: string;
  payTo: string;
  amount: string;
  settlementTx?: string;
}

function base64DecodeJson<T>(value: string): T {
  return JSON.parse(Buffer.from(value, "base64").toString("utf-8")) as T;
}

export function amountToXsgdUnits(amountSgd: number): string {
  return String(Math.round(amountSgd * 10 ** XSGD_DECIMALS));
}

function assertRequirementMatches(requirement: X402Requirement, amountSgd: number): void {
  const errors: string[] = [];

  if (requirement.chainId !== FUJI_CHAIN_ID) {
    errors.push(`chainId ${requirement.chainId} is not Fuji ${FUJI_CHAIN_ID}`);
  }
  if (requirement.asset.toLowerCase() !== XSGD_FUJI_CONTRACT) {
    errors.push("asset is not Fuji XSGD");
  }
  if (requirement.amount !== amountToXsgdUnits(amountSgd)) {
    errors.push(`amount ${requirement.amount} does not match approved amount ${amountSgd}`);
  }
  if (requirement.extra.assetTransferMethod.toLowerCase() !== "eip3009") {
    errors.push("asset transfer method is not eip3009");
  }
  if (requirement.extra.name !== "XSGD") {
    errors.push("EIP-712 token name is not XSGD");
  }

  if (errors.length > 0) {
    throw new Error(`x402 requirement rejected: ${errors.join("; ")}`);
  }
}

export async function requestX402Challenge(
  url: string,
  body: IssueCardBody
): Promise<{ challenge: X402Challenge; requirement: X402Requirement }> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (response.status !== 402) {
    throw new Error(`Expected HTTP 402 payment challenge, got ${response.status}`);
  }

  const paymentRequired = response.headers.get("payment-required");
  const challenge = paymentRequired
    ? base64DecodeJson<X402Challenge>(paymentRequired)
    : ((await response.json()) as X402Challenge);
  const requirement = challenge.accepts.find(
    (candidate) =>
      candidate.scheme === "exact" &&
      candidate.chainId === FUJI_CHAIN_ID &&
      candidate.extra.assetTransferMethod.toLowerCase() === "eip3009"
  );

  if (!requirement) {
    throw new Error("No acceptable x402 EIP-3009 requirement found");
  }

  return { challenge, requirement };
}

export async function signPaymentAuthorization(
  account: Account,
  requirement: X402Requirement
): Promise<string> {
  if (!account.signTypedData) {
    throw new Error("Account does not support signTypedData");
  }

  const validAfter = 0n;
  const validBefore = BigInt(
    Math.floor(Date.now() / 1000) + Math.min(requirement.maxTimeoutSeconds, 300)
  );
  const nonce = `0x${randomBytes(32).toString("hex")}` as `0x${string}`;
  const value = BigInt(requirement.amount);

  const signature = await account.signTypedData({
    domain: {
      name: requirement.extra.name,
      version: requirement.extra.version,
      chainId: requirement.chainId,
      verifyingContract: requirement.asset as `0x${string}`,
    },
    types: {
      TransferWithAuthorization: [
        { name: "from", type: "address" },
        { name: "to", type: "address" },
        { name: "value", type: "uint256" },
        { name: "validAfter", type: "uint256" },
        { name: "validBefore", type: "uint256" },
        { name: "nonce", type: "bytes32" },
      ],
    },
    primaryType: "TransferWithAuthorization",
    message: {
      from: account.address,
      to: requirement.payTo as `0x${string}`,
      value,
      validAfter,
      validBefore,
      nonce,
    },
  });

  const paymentPayload = {
    x402Version: 1,
    accepted: {
      ...requirement,
      maxAmountRequired: requirement.amount,
    },
    scheme: requirement.scheme,
    network: requirement.network,
    payload: {
      signature,
      authorization: {
        from: account.address,
        to: requirement.payTo,
        value: requirement.amount,
        validAfter: validAfter.toString(),
        validBefore: validBefore.toString(),
        nonce,
      },
    },
  };

  return Buffer.from(JSON.stringify(paymentPayload)).toString("base64");
}

export async function submitSignedCardRequest(
  url: string,
  body: IssueCardBody,
  paymentSignatureHeader: string
): Promise<CardIssueResult> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "PAYMENT-SIGNATURE": paymentSignatureHeader,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Card issuance failed: HTTP ${response.status} ${text}`);
  }

  return (await response.json()) as CardIssueResult;
}

export async function issueCardWithX402({
  account,
  cardApiUrl,
  amountSgd,
  cardholderName,
}: {
  account: Account;
  cardApiUrl: string;
  amountSgd: number;
  cardholderName: string;
}): Promise<{ card: CardIssueResult; receipt: X402Receipt }> {
  const body = { amount_sgd: amountSgd, cardholder_name: cardholderName };
  const { challenge, requirement } = await requestX402Challenge(cardApiUrl, body);
  assertRequirementMatches(requirement, amountSgd);
  const paymentSignatureHeader = await signPaymentAuthorization(account, requirement);
  const card = await submitSignedCardRequest(cardApiUrl, body, paymentSignatureHeader);

  return {
    card,
    receipt: {
      cardApiUrl,
      x402Version: challenge.x402Version,
      scheme: requirement.scheme,
      network: requirement.network,
      chainId: requirement.chainId,
      asset: requirement.asset,
      payTo: requirement.payTo,
      amount: requirement.amount,
      settlementTx: typeof card.settlement_tx === "string" ? card.settlement_tx : undefined,
    },
  };
}
