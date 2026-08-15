process.loadEnvFile();

import express from "express";
import { privateKeyToAccount } from "viem/accounts";
import { mandate } from "./mandate.config.js";
import { evaluatePolicy } from "./policy.js";
import { issueOneTimeCard } from "./cardIssuance.js";
import { getXsgdBalance } from "./xsgd.js";
import {
  appendDecision,
  getDecisionsNewestFirst,
  updateCardIssued,
  updateReviewStatus,
} from "./decisionLog.js";
import { issueCardWithX402 } from "./x402.js";
import type { ExtractedPaymentFields } from "./mcpPaymentExtractor.js";

const app = express();
app.use(express.json());
app.use(express.static("public"));

const account = privateKeyToAccount(process.env.AGENT_PRIVATE_KEY as `0x${string}`);

let spentSoFar = 0;
let dryRunMode = process.env.DRY_RUN !== "false";
const CARDHOLDER_NAME = "Mandate Agent";

function cardReferenceFor(
  card: Exclude<Awaited<ReturnType<typeof issueOneTimeCard>>, { status: "blocked_by_guard" }>
): string | null {
  if (card.status === "dry_run") {
    return "dry_run";
  }
  const challenge = card.challenge as { card_opaque_id?: string } | undefined;
  return challenge?.card_opaque_id ?? null;
}

app.get("/status", async (req, res) => {
  const balance = await getXsgdBalance(account.address);
  res.json({
    address: account.address,
    balance,
    spentSoFar,
    mandate,
    dryRun: dryRunMode,
  });
});

app.post("/dry-run", (req, res) => {
  const { dryRun } = req.body;

  if (typeof dryRun !== "boolean") {
    res.status(400).json({ error: "dryRun must be true or false" });
    return;
  }

  dryRunMode = dryRun;
  process.env.DRY_RUN = String(dryRun);
  res.json({ dryRun: dryRunMode });
});

app.get("/decisions", (req, res) => {
  res.json(getDecisionsNewestFirst());
});

function findDecision(decisionId: string) {
  return getDecisionsNewestFirst().find(
    (entry) =>
      entry.id === decisionId ||
      encodeURIComponent(entry.timestamp) === decisionId ||
      entry.timestamp === decisionId
  );
}

function getExtractedPaymentFields(value: unknown): ExtractedPaymentFields | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  return value as ExtractedPaymentFields;
}

app.post("/review/:decisionId/approve", async (req, res) => {
  const decision = findDecision(req.params.decisionId);

  if (!decision) {
    res.status(404).json({ error: "Decision not found" });
    return;
  }

  if (decision.reviewStatus !== "PENDING_REVIEW") {
    res.status(409).json({ error: "Decision is not pending review" });
    return;
  }

  if (decision.paymentValidationStatus !== "VALID") {
    res.status(409).json({ error: "Cannot approve invalid extracted payment fields" });
    return;
  }

  if (!dryRunMode) {
    const fields = getExtractedPaymentFields(decision.extractedPaymentFields);

    if (!fields?.cardApiUrl || fields.amountSgd === undefined) {
      res.status(409).json({ error: "Validated payment fields are incomplete" });
      return;
    }

    try {
      const issued = await issueCardWithX402({
        account,
        cardApiUrl: fields.cardApiUrl,
        amountSgd: fields.amountSgd,
        cardholderName: CARDHOLDER_NAME,
      });
      const cardReference =
        typeof issued.card.card_opaque_id === "string" ? issued.card.card_opaque_id : null;
      const updated = updateCardIssued(
        req.params.decisionId,
        cardReference,
        issued.receipt,
        "Human reviewed validated fields. Mandate signed one x402 payment and issued a sandbox card."
      );
      spentSoFar += decision.amount;
      res.json({
        status: "CARD_ISSUED",
        message: "Human review approved. Mandate signed one validated x402 payment.",
        cardReference,
        receipt: issued.receipt,
        decision: updated,
      });
      return;
    } catch (error) {
      res.status(502).json({
        status: "CARD_ISSUE_FAILED",
        error: error instanceof Error ? error.message : String(error),
      });
      return;
    }
  }

  const updated = updateReviewStatus(
    req.params.decisionId,
    "APPROVED",
    "Human reviewed extracted fields. Signing remains disabled in this checkpoint."
  );
  res.json({
    status: "APPROVED_NO_SIGNING",
    message: "Review approved. No card was minted and no wallet signature was produced.",
    decision: updated,
  });
});

app.post("/review/:decisionId/decline", (req, res) => {
  const decision = findDecision(req.params.decisionId);

  if (!decision) {
    res.status(404).json({ error: "Decision not found" });
    return;
  }

  if (decision.reviewStatus !== "PENDING_REVIEW") {
    res.status(409).json({ error: "Decision is not pending review" });
    return;
  }

  const updated = updateReviewStatus(
    req.params.decisionId,
    "DECLINED",
    "Human declined suspicious MCP response."
  );

  res.json({ status: "DECLINED_BY_REVIEW", decision: updated });
});

app.post("/intent", async (req, res) => {
  const { merchant, amount, item } = req.body;
  const balance = account ? await getXsgdBalance(account.address) : undefined;
  const result = evaluatePolicy(mandate, { merchant, amount, item }, { spentSoFar, balance });

  if (result.verdict === "APPROVE") {
    const card = await issueOneTimeCard({ merchant, amount }, account, dryRunMode);

    if (card.status === "blocked_by_guard") {
      appendDecision({
        timestamp: new Date().toISOString(),
        merchant,
        amount,
        item,
        verdict: "DECLINE",
        reasonCode: "SUSPICIOUS_MCP_RESPONSE",
        cardReference: null,
        balanceAtDecision: balance ?? null,
        guardPatterns: card.patterns,
        guardExcerpts: card.excerpts,
        droppedFields: card.droppedFields,
        extractedPaymentFields: card.extractedPaymentFields,
        paymentValidationStatus: card.paymentValidationStatus,
        paymentValidationErrors: card.paymentValidationErrors,
        reviewStatus: card.reviewStatus,
      });

      res.json({ verdict: "DECLINE", reason: "SUSPICIOUS_MCP_RESPONSE", card });
      return;
    }

    spentSoFar += amount;

    appendDecision({
      timestamp: new Date().toISOString(),
      merchant,
      amount,
      item,
      verdict: "APPROVE",
      reasonCode: null,
      cardReference: cardReferenceFor(card),
      balanceAtDecision: balance ?? null,
    });

    res.json({ verdict: result.verdict, card });
    return;
  }

  appendDecision({
    timestamp: new Date().toISOString(),
    merchant,
    amount,
    item,
    verdict: "DECLINE",
    reasonCode: result.reason,
    cardReference: null,
    balanceAtDecision: balance ?? null,
  });

  res.json(result);
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 4020;

app.listen(PORT, () => {
  console.log(`Mandate server listening on port ${PORT}`);
});
