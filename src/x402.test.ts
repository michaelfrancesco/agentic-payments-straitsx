import { describe, expect, it } from "vitest";
import { amountToXsgdUnits } from "./x402.js";

describe("x402 amount conversion", () => {
  it("converts XSGD to 6-decimal token units", () => {
    expect(amountToXsgdUnits(6)).toBe("6000000");
    expect(amountToXsgdUnits(5.25)).toBe("5250000");
  });
});
