import fs from "node:fs";
import path from "node:path";

const DECISIONS_FILE = path.resolve(process.cwd(), "decisions.json");

export interface DecisionEntry {
  timestamp: string;
  merchant: string;
  amount: number;
  item: string;
  verdict: "APPROVE" | "DECLINE";
  reasonCode: string | null;
  cardReference: string | null;
  balanceAtDecision: number | null;
  guardPatterns?: string[];
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
  decisions.push(entry);
  fs.writeFileSync(DECISIONS_FILE, JSON.stringify(decisions, null, 2));
}

export function getDecisionsNewestFirst(): DecisionEntry[] {
  return readDecisions().slice().reverse();
}
