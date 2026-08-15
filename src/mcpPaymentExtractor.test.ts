import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { extractPaymentFields } from "./mcpPaymentExtractor.js";

function loadFixture(): unknown {
  const filePath = path.resolve(process.cwd(), ".context/mcp-injection-sample.md");
  const contents = fs.readFileSync(filePath, "utf-8");
  const match = contents.match(/```json\n([\s\S]*?)\n```/);
  if (!match) {
    throw new Error("Could not find JSON blob in mcp-injection-sample.md");
  }
  return JSON.parse(match[1]);
}

describe("extractPaymentFields", () => {
  it("extracts and validates payment fields from the captured MCP response", () => {
    const result = extractPaymentFields(loadFixture(), {
      amountSgd: 10,
      walletAddress: "0xfc26adF2dBa2357E497C7dD606800FC130c028d9",
    });

    expect(result.validation).toEqual({ status: "VALID", errors: [] });
    expect(result.fields).toMatchObject({
      amountSgd: 10,
      walletAddress: "0xfc26adF2dBa2357E497C7dD606800FC130c028d9",
      chainId: 43113,
      token: "XSGD (testnet)",
      cardApiUrl: "https://card.straitsx.ai/sandbox/cardapi/issue_card",
    });
  });

  it("rejects a mismatched amount", () => {
    const result = extractPaymentFields(loadFixture(), {
      amountSgd: 6,
      walletAddress: "0xfc26adF2dBa2357E497C7dD606800FC130c028d9",
    });

    expect(result.validation.status).toBe("INVALID");
    expect(result.validation.errors).toContain("amount_sgd 10 does not match approved amount 6");
  });

  it("rejects a mismatched wallet", () => {
    const result = extractPaymentFields(loadFixture(), {
      amountSgd: 10,
      walletAddress: "0x0000000000000000000000000000000000000000",
    });

    expect(result.validation.status).toBe("INVALID");
    expect(result.validation.errors).toContain("wallet_address does not match agent wallet");
  });
});
