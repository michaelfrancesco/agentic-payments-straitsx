import { randomBytes } from "node:crypto";
import type { Account } from "viem";
import type { CardIssueResult, X402Challenge, X402Requirement } from "./cardTypes.js";

export async function requestX402Challenge(
  url: string,
  body: unknown,
): Promise<X402Challenge> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (res.status !== 402) {
    throw new Error(`Expected HTTP 402 payment challenge, got ${res.status}`);
  }
  return (await res.json()) as X402Challenge;
}

export async function signPaymentAuthorization(
  account: Account,
  requirement: X402Requirement,
): Promise<{ paymentSignatureHeader: string }> {
  if (!account.signTypedData) {
    throw new Error("Account does not support signTypedData");
  }

  const nonce = `0x${randomBytes(32).toString("hex")}` as `0x${string}`;
  const validAfter = 0n;
  const validBefore = BigInt(Math.floor(Date.now() / 1000) + requirement.maxTimeoutSeconds);
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

  const paymentSignatureHeader = Buffer.from(JSON.stringify(paymentPayload)).toString("base64");
  return { paymentSignatureHeader };
}

export async function submitPayment(
  url: string,
  body: unknown,
  paymentSignatureHeader: string,
): Promise<CardIssueResult> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "PAYMENT-SIGNATURE": paymentSignatureHeader,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Card issuance failed: HTTP ${res.status} ${text}`);
  }
  return (await res.json()) as CardIssueResult;
}
