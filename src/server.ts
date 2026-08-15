process.loadEnvFile();

import express from "express";
import { privateKeyToAccount } from "viem/accounts";
import { mandate } from "./mandate.config.js";
import { evaluatePolicy } from "./policy.js";
import { issueOneTimeCard } from "./cardIssuance.js";
import { getXsgdBalance } from "./xsgd.js";
import { appendDecision, getDecisionsNewestFirst } from "./decisionLog.js";

const app = express();
app.use(express.json());
app.use(express.static("public"));

const account = privateKeyToAccount(process.env.AGENT_PRIVATE_KEY as `0x${string}`);

let spentSoFar = 0;
let dryRunMode = process.env.DRY_RUN !== "false";

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
