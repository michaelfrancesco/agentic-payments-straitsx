import { describe, expect, it } from "vitest";
import { amountToXsgdUnits, assertRequirementMatches } from "./x402.js";
import type { X402Requirement } from "./cardTypes.js";

describe("x402 amount conversion", () => {
  it("converts XSGD to 6-decimal token units", () => {
    expect(amountToXsgdUnits(6)).toBe("6000000");
    expect(amountToXsgdUnits(5.25)).toBe("5250000");
  });
});

const validRequirement: X402Requirement = {
  scheme: "exact",
  network: "eip155:43113",
  amount: "6000000",
  asset: "0xd769410dc8772695a7f55a304d2125320a65c2a5",
  payTo: "0x99a2B2962a6AC463FBe04664027Fdb3F68bd4Cc8",
  maxTimeoutSeconds: 300,
  chainId: 43113,
  extra: {
    assetTransferMethod: "eip3009",
    name: "XSGD",
    version: "2",
  },
};

describe("assertRequirementMatches", () => {
  it("does not throw for a fully valid requirement", () => {
    expect(() => assertRequirementMatches(validRequirement, 6)).not.toThrow();
  });

  it("rejects the wrong chainId", () => {
    expect(() => assertRequirementMatches({ ...validRequirement, chainId: 1 }, 6)).toThrow(
      /chainId/
    );
  });

  it("rejects the wrong asset contract", () => {
    expect(() =>
      assertRequirementMatches({ ...validRequirement, asset: "0xdeadbeef" }, 6)
    ).toThrow(/asset/);
  });

  it("accepts an uppercase-hex asset that matches case-insensitively", () => {
    expect(() =>
      assertRequirementMatches(
        { ...validRequirement, asset: validRequirement.asset.toUpperCase() },
        6
      )
    ).not.toThrow();
  });

  it("rejects a mismatched amount", () => {
    expect(() => assertRequirementMatches(validRequirement, 10)).toThrow(/amount/);
  });

  it("rejects a non-eip3009 transfer method", () => {
    expect(() =>
      assertRequirementMatches(
        { ...validRequirement, extra: { ...validRequirement.extra, assetTransferMethod: "other" } },
        6
      )
    ).toThrow(/eip3009/);
  });

  it("rejects a token name that is not XSGD", () => {
    expect(() =>
      assertRequirementMatches(
        { ...validRequirement, extra: { ...validRequirement.extra, name: "USDC" } },
        6
      )
    ).toThrow(/XSGD/);
  });

  it("combines multiple violations into one error", () => {
    expect(() =>
      assertRequirementMatches({ ...validRequirement, chainId: 1, asset: "0xdeadbeef" }, 6)
    ).toThrow(/chainId.*asset|asset.*chainId/s);
  });
});
