import fs from "node:fs";
import path from "node:path";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  appendDecision,
  getDecisionsNewestFirst,
  updateReviewStatus,
  updateCardIssued,
} from "./decisionLog.js";

// decisionLog.ts reads/writes the real decisions.json at process.cwd(). Back up
// whatever is there before each test and restore it after.
const DECISIONS_FILE = path.resolve(process.cwd(), "decisions.json");
let backup: string | null = null;

function baseEntry(overrides: Partial<Parameters<typeof appendDecision>[0]> = {}) {
  return {
    timestamp: new Date().toISOString(),
    merchant: "test-store",
    amount: 5,
    item: "widget",
    verdict: "APPROVE" as const,
    reasonCode: null,
    cardReference: null,
    balanceAtDecision: 10,
    ...overrides,
  };
}

beforeEach(() => {
  backup = fs.existsSync(DECISIONS_FILE) ? fs.readFileSync(DECISIONS_FILE, "utf-8") : null;
  fs.writeFileSync(DECISIONS_FILE, "[]");
});

afterEach(() => {
  if (backup === null) {
    fs.rmSync(DECISIONS_FILE, { force: true });
  } else {
    fs.writeFileSync(DECISIONS_FILE, backup);
  }
});

describe("appendDecision", () => {
  it("assigns an id when none is provided", () => {
    appendDecision(baseEntry());
    const [entry] = getDecisionsNewestFirst();
    expect(entry.id).toBeTruthy();
  });

  it("keeps a provided id", () => {
    appendDecision(baseEntry({ id: "fixed-id" }));
    const [entry] = getDecisionsNewestFirst();
    expect(entry.id).toBe("fixed-id");
  });
});

describe("getDecisionsNewestFirst", () => {
  it("returns entries in reverse insertion order", () => {
    appendDecision(baseEntry({ item: "first" }));
    appendDecision(baseEntry({ item: "second" }));
    const decisions = getDecisionsNewestFirst();
    expect(decisions[0].item).toBe("second");
    expect(decisions[1].item).toBe("first");
  });
});

describe("updateReviewStatus", () => {
  it("updates an existing decision", () => {
    appendDecision(baseEntry({ id: "abc", reviewStatus: "PENDING_REVIEW" }));
    const updated = updateReviewStatus("abc", "APPROVED", "reviewed");
    expect(updated?.reviewStatus).toBe("APPROVED");
    expect(updated?.reviewNote).toBe("reviewed");
  });

  it("returns null for a missing id", () => {
    const updated = updateReviewStatus("missing", "DECLINED", "n/a");
    expect(updated).toBeNull();
  });
});

describe("updateCardIssued", () => {
  it("sets verdict, card reference, and receipt", () => {
    appendDecision(baseEntry({ id: "xyz", verdict: "DECLINE" }));
    const updated = updateCardIssued("xyz", "card-123", { settlementTx: "0xabc" }, "issued");
    expect(updated?.verdict).toBe("APPROVE");
    expect(updated?.cardReference).toBe("card-123");
    expect(updated?.issueReceipt).toEqual({ settlementTx: "0xabc" });
  });

  it("returns null for a missing id", () => {
    const updated = updateCardIssued("missing", null, {}, "n/a");
    expect(updated).toBeNull();
  });
});
