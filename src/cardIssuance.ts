import type { Account } from "viem";
import { getCardChallenge } from "./mcpCardClient.js";
import { guardPayload } from "./mcpGuard.js";

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
  | { status: "blocked_by_guard"; patterns: string[]; excerpts: string[] }
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
    return {
      status: "blocked_by_guard",
      patterns: guardResult.patterns,
      excerpts: guardResult.excerpts,
    };
  }

  return { status: "challenge_received", challenge: guardResult.safe };
}
