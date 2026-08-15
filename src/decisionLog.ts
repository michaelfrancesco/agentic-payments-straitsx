import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

const DECISIONS_FILE = path.resolve(process.cwd(), "decisions.json");

export interface DecisionEntry {
  id?: string;
  timestamp: string;
  merchant: string;
  amount: number;
  item: string;
  verdict: "APPROVE" | "DECLINE";
  reasonCode: string | null;
  cardReference: string | null;
  balanceAtDecision: number | null;
  guardPatterns?: string[];
  guardExcerpts?: string[];
  droppedFields?: string[];
  extractedPaymentFields?: unknown;
  paymentValidationStatus?: "VALID" | "INVALID";
  paymentValidationErrors?: string[];
  reviewStatus?: "PENDING_REVIEW" | "APPROVED" | "DECLINED";
  reviewedAt?: string;
  reviewNote?: string;
  issueReceipt?: unknown;
}

function readDecisions(): DecisionEntry[] {
  if (!fs.existsSync(DECISIONS_FILE)) {
    fs.writeFileSync(DECISIONS_FILE, "[]");
    return [];
  }
  const raw = fs.readFileSync(DECISIONS_FILE, "utf-8");
  return JSON.parse(raw) as DecisionEntry[];
}

export function appendDecision(entry: DecisionEntry): void {
  const decisions = readDecisions();
  decisions.push({ ...entry, id: entry.id ?? randomUUID() });
  fs.writeFileSync(DECISIONS_FILE, JSON.stringify(decisions, null, 2));
}

export function getDecisionsNewestFirst(): DecisionEntry[] {
  return readDecisions().slice().reverse();
}

function matchesDecisionId(entry: DecisionEntry, id: string): boolean {
  return entry.id === id || encodeURIComponent(entry.timestamp) === id || entry.timestamp === id;
}

export function updateReviewStatus(
  id: string,
  reviewStatus: "APPROVED" | "DECLINED",
  reviewNote: string
): DecisionEntry | null {
  const decisions = readDecisions();
  const index = decisions.findIndex((entry) => matchesDecisionId(entry, id));

  if (index === -1) {
    return null;
  }

  const updated: DecisionEntry = {
    ...decisions[index],
    reviewStatus,
    reviewedAt: new Date().toISOString(),
    reviewNote,
  };

  decisions[index] = updated;
  fs.writeFileSync(DECISIONS_FILE, JSON.stringify(decisions, null, 2));
  return updated;
}

export function updateCardIssued(
  id: string,
  cardReference: string | null,
  issueReceipt: unknown,
  reviewNote: string
): DecisionEntry | null {
  const decisions = readDecisions();
  const index = decisions.findIndex((entry) => matchesDecisionId(entry, id));

  if (index === -1) {
    return null;
  }

  const updated: DecisionEntry = {
    ...decisions[index],
    verdict: "APPROVE",
    cardReference,
    reviewStatus: "APPROVED",
    reviewedAt: new Date().toISOString(),
    reviewNote,
    issueReceipt,
  };

  decisions[index] = updated;
  fs.writeFileSync(DECISIONS_FILE, JSON.stringify(decisions, null, 2));
  return updated;
}
