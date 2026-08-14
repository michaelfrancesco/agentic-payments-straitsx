import { existsSync, readFileSync, writeFileSync } from "node:fs";

export type Decision = {
  timestamp: string;
  merchant: string;
  amount: number;
  item: string;
  verdict: "APPROVE" | "DECLINE";
  reasonCode?: string;
  cardReference?: string;
  balanceAtDecision?: number;
};

const LOG_PATH = "decisions.json";

function readAll(): Decision[] {
  if (!existsSync(LOG_PATH)) return [];
  return JSON.parse(readFileSync(LOG_PATH, "utf8")) as Decision[];
}

export function appendDecision(decision: Decision): void {
  const all = readAll();
  all.push(decision);
  writeFileSync(LOG_PATH, JSON.stringify(all, null, 2));
}

export function getDecisionsNewestFirst(): Decision[] {
  return readAll().slice().reverse();
}
