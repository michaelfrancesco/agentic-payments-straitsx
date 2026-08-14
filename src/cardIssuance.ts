import type { Account } from "viem";
import { getCardChallenge } from "./mcpCardClient.js";
import { requestX402Challenge, signPaymentAuthorization, submitPayment } from "./x402.js";
import type { CardIssueResult } from "./cardTypes.js";

export type IssueCardOutcome =
  | { status: "dry_run"; url: string; body: unknown; paymentSignatureHeader: string }
  | { status: "issued"; card: CardIssueResult }
  | { status: "error"; message: string };

export async function issueOneTimeCard(
  intent: { merchant: string; amount: number; item: string },
  account: Account,
  dryRun: boolean,
): Promise<IssueCardOutcome> {
  try {
    const cardholderName = "Mandate Agent";
    const challenge = await getCardChallenge(account.address, cardholderName, intent.amount);
    const x402Challenge = await requestX402Challenge(challenge.url, challenge.body);
    const requirement = x402Challenge.accepts[0];
    if (!requirement) throw new Error("x402 challenge had no acceptable payment methods");

    const { paymentSignatureHeader } = await signPaymentAuthorization(account, requirement);

    if (dryRun) {
      return { status: "dry_run", url: challenge.url, body: challenge.body, paymentSignatureHeader };
    }

    const card = await submitPayment(challenge.url, challenge.body, paymentSignatureHeader);
    return { status: "issued", card };
  } catch (err) {
    return { status: "error", message: err instanceof Error ? err.message : String(err) };
  }
}
