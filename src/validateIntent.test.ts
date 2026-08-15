import { describe, it, expect } from "vitest";
import { validateIntent } from "./validateIntent.js";

const valid = { merchant: "mikes-store", amount: 10, item: "widget" };

describe("validateIntent", () => {
  it("accepts a valid intent", () => {
    const result = validateIntent(valid);
    expect(result).toEqual({ ok: true, value: valid });
  });

  it("rejects a missing amount", () => {
    const { amount, ...rest } = valid;
    const result = validateIntent(rest);
    expect(result.ok).toBe(false);
  });

  it("rejects a string amount", () => {
    const result = validateIntent({ ...valid, amount: "10" });
    expect(result.ok).toBe(false);
  });

  it("rejects a NaN amount", () => {
    const result = validateIntent({ ...valid, amount: NaN });
    expect(result.ok).toBe(false);
  });

  it("rejects an Infinity amount", () => {
    const result = validateIntent({ ...valid, amount: Infinity });
    expect(result.ok).toBe(false);
  });

  it("rejects a negative amount", () => {
    const result = validateIntent({ ...valid, amount: -5 });
    expect(result.ok).toBe(false);
  });

  it("rejects a zero amount", () => {
    const result = validateIntent({ ...valid, amount: 0 });
    expect(result.ok).toBe(false);
  });

  it("rejects an amount over the sanity ceiling", () => {
    const result = validateIntent({ ...valid, amount: 10001 });
    expect(result.ok).toBe(false);
  });

  it("rejects a missing merchant", () => {
    const { merchant, ...rest } = valid;
    const result = validateIntent(rest);
    expect(result.ok).toBe(false);
  });

  it("rejects an empty-string merchant", () => {
    const result = validateIntent({ ...valid, merchant: "   " });
    expect(result.ok).toBe(false);
  });

  it("rejects a missing item", () => {
    const { item, ...rest } = valid;
    const result = validateIntent(rest);
    expect(result.ok).toBe(false);
  });

  it("rejects a non-string item", () => {
    const result = validateIntent({ ...valid, item: 123 });
    expect(result.ok).toBe(false);
  });

  it("rejects a non-object body", () => {
    expect(validateIntent(null).ok).toBe(false);
    expect(validateIntent("nope").ok).toBe(false);
    expect(validateIntent([1, 2, 3]).ok).toBe(false);
  });
});
