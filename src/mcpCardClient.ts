import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import type { CardChallenge } from "./cardTypes.js";

let clientPromise: Promise<Client> | null = null;

function getClient(): Promise<Client> {
  if (!clientPromise) {
    clientPromise = (async () => {
      const endpoint = process.env.MCP_SSE_ENDPOINT;
      if (!endpoint) throw new Error("MCP_SSE_ENDPOINT is not set");
      const client = new Client({ name: "mandate", version: "1.0.0" });
      const transport = new SSEClientTransport(new URL(endpoint));
      await client.connect(transport);
      return client;
    })();
  }
  return clientPromise;
}

export async function getCardChallenge(
  walletAddress: string,
  cardholderName: string,
  amountSgd: number,
): Promise<CardChallenge> {
  const client = await getClient();
  const result = await client.callTool({
    name: "get_card_sandbox",
    arguments: {
      wallet_address: walletAddress,
      cardholder_name: cardholderName,
      amount_sgd: amountSgd,
    },
  });
  const content = result.content as Array<{ type: string; text?: string }>;
  const text = content.find((c) => c.type === "text")?.text;
  if (!text) throw new Error("get_card_sandbox returned no text content");
  return JSON.parse(text) as CardChallenge;
}
