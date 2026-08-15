import type { Account } from "viem";
import { getCardChallenge } from "./mcpCardClient.js";
import { guardPayload } from "./mcpGuard.js";
import { extractPaymentFields, type ExtractedPaymentFields } from "./mcpPaymentExtractor.js";

interface CardIntent {
  merchant: string;
  amount: number;
}

const CARDHOLDER_NAME = "Mandate Agent";
const MIN_AMOUNT_SGD = 5;
const MAX_AMOUNT_SGD = 30;

function clampAmount(amount: number): number {
  const clamped = Math.min(Math.max(amount, MIN_AMOUNT_SGD), MAX_AMOUNT_SGD);
  if (clamped !== amount) {
    console.warn(
      `issueOneTimeCard: amount ${amount} clamped to ${clamped} (allowed range ${MIN_AMOUNT_SGD}-${MAX_AMOUNT_SGD})`
    );
  }
  return clamped;
}

export async function issueOneTimeCard(
  intent: CardIntent,
  account: Account,
  dryRun: boolean
): Promise<
  | { status: "dry_run"; wouldSend: { walletAddress: string; cardholderName: string; amountSgd: number } }
  | { status: "challenge_received"; challenge: unknown }
  | {
      status: "blocked_by_guard";
      patterns: string[];
      excerpts: string[];
      droppedFields: string[];
      extractedPaymentFields: ExtractedPaymentFields;
      paymentValidationStatus: "VALID" | "INVALID";
      paymentValidationErrors: string[];
      reviewStatus: "PENDING_REVIEW";
    }
> {
  const args = {
    walletAddress: account.address,
    cardholderName: CARDHOLDER_NAME,
    amountSgd: clampAmount(intent.amount),
  };

  if (dryRun) {
    return { status: "dry_run", wouldSend: args };
  }

  const challenge = await getCardChallenge(args);
  const guardResult = guardPayload(challenge);

  if (guardResult.verdict === "SUSPICIOUS") {
    const extraction = extractPaymentFields(challenge, {
      amountSgd: args.amountSgd,
      walletAddress: args.walletAddress,
    });

    return {
      status: "blocked_by_guard",
      patterns: guardResult.patterns,
      excerpts: guardResult.excerpts,
      droppedFields: guardResult.dropped,
      extractedPaymentFields: extraction.fields,
      paymentValidationStatus: extraction.validation.status,
      paymentValidationErrors: extraction.validation.errors,
      reviewStatus: "PENDING_REVIEW",
    };
  }

  return { status: "challenge_received", challenge: guardResult.safe };
}
