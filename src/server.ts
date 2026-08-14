import "dotenv/config";
import express from "express";
import { privateKeyToAccount } from "viem/accounts";
import { mandate } from "./mandate.config.js";
import { evaluatePolicy } from "./policy.js";
import { issueOneTimeCard, type IssueCardOutcome } from "./cardIssuance.js";
import { getXsgdBalance } from "./xsgd.js";
import { appendDecision, getDecisionsNewestFirst } from "./decisionLog.js";

const app = express();
app.use(express.json());
app.use(express.static("public"));

const dryRun = (process.env.DRY_RUN ?? "true") !== "false";
const account = process.env.AGENT_PRIVATE_KEY
  ? privateKeyToAccount(process.env.AGENT_PRIVATE_KEY as `0x${string}`)
  : undefined;

let spentSoFar = 0;

function cardReferenceOf(card: IssueCardOutcome | undefined): string | undefined {
  if (!card) return undefined;
  if (card.status === "issued") return card.card.card_opaque_id;
  if (card.status === "dry_run") return "dry_run";
  return undefined;
}

app.post("/intent", async (req, res) => {
  const { merchant, amount, item } = req.body;
  const balance = account ? await getXsgdBalance(account.address) : undefined;
  const result = evaluatePolicy(mandate, { merchant, amount, item }, { spentSoFar, balance });

  if (result.verdict !== "APPROVE") {
    appendDecision({
      timestamp: new Date().toISOString(),
      merchant,
      amount,
      item,
      verdict: "DECLINE",
      reasonCode: result.reason,
      balanceAtDecision: balance,
    });
    res.json(result);
    return;
  }

  if (!account) {
    res.json({ ...result, card: { status: "error", message: "AGENT_PRIVATE_KEY not set" } });
    return;
  }

  spentSoFar += amount;
  const card = await issueOneTimeCard({ merchant, amount, item }, account, dryRun);

  appendDecision({
    timestamp: new Date().toISOString(),
    merchant,
    amount,
    item,
    verdict: "APPROVE",
    cardReference: cardReferenceOf(card),
    balanceAtDecision: balance,
  });

  res.json({ ...result, card });
});

app.get("/decisions", (_req, res) => {
  res.json(getDecisionsNewestFirst());
});

app.get("/status", async (_req, res) => {
  const balance = account ? await getXsgdBalance(account.address) : undefined;
  res.json({
    address: account?.address,
    balance,
    spentSoFar,
    headroom: mandate.capTotal - spentSoFar,
    mandate,
  });
});

const port = Number(process.env.PORT ?? 4010);
app.listen(port, () => {
  console.log(`Mandate server listening on http://localhost:${port}`);
});
