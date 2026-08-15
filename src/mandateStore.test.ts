import fs from "node:fs";
import path from "node:path";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { addMerchant, removeMerchant, renameMerchant } from "./mandateStore.js";

// mandateStore.ts reads/writes the real mandate.json at process.cwd(). Back up
// whatever is there before each test and restore it after, so this suite never
// leaves the repo's runtime state changed.
const MANDATE_FILE = path.resolve(process.cwd(), "mandate.json");
let backup: string | null = null;

beforeEach(() => {
  backup = fs.existsSync(MANDATE_FILE) ? fs.readFileSync(MANDATE_FILE, "utf-8") : null;
  fs.writeFileSync(
    MANDATE_FILE,
    JSON.stringify(
      {
        capTotal: 25,
        perTransactionLimit: 15,
        merchantAllowlist: ["test-store"],
        expiresAt: Date.now() + 1000 * 60 * 60,
      },
      null,
      2
    )
  );
});

afterEach(() => {
  if (backup === null) {
    fs.rmSync(MANDATE_FILE, { force: true });
  } else {
    fs.writeFileSync(MANDATE_FILE, backup);
  }
});

describe("addMerchant", () => {
  it("adds a new merchant", () => {
    const result = addMerchant("new-store");
    expect(result.merchantAllowlist).toContain("new-store");
  });

  it("rejects a duplicate merchant", () => {
    expect(() => addMerchant("test-store")).toThrow(/already on the allowlist/);
  });

  it("rejects an empty merchant name", () => {
    expect(() => addMerchant("   ")).toThrow(/cannot be empty/);
  });
});

describe("removeMerchant", () => {
  it("removes an existing merchant", () => {
    const result = removeMerchant("test-store");
    expect(result.merchantAllowlist).not.toContain("test-store");
  });

  it("rejects removing a merchant that is not on the list", () => {
    expect(() => removeMerchant("nope")).toThrow(/not on the allowlist/);
  });
});

describe("renameMerchant", () => {
  it("renames an existing merchant", () => {
    const result = renameMerchant("test-store", "renamed-store");
    expect(result.merchantAllowlist).toContain("renamed-store");
    expect(result.merchantAllowlist).not.toContain("test-store");
  });

  it("rejects renaming a merchant that does not exist", () => {
    expect(() => renameMerchant("nope", "whatever")).toThrow(/not on the allowlist/);
  });

  it("rejects renaming to a name that already exists", () => {
    addMerchant("other-store");
    expect(() => renameMerchant("test-store", "other-store")).toThrow(/already on the allowlist/);
  });
});
