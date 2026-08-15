import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

interface GetCardChallengeArgs {
  walletAddress: string;
  cardholderName: string;
  amountSgd: number;
}

interface TextContentBlock {
  type: "text";
  text: string;
}

interface ToolResultWithContent {
  structuredContent?: unknown;
  content?: unknown;
}

let clientPromise: Promise<Client> | null = null;

function connect(): Promise<Client> {
  if (!clientPromise) {
    clientPromise = (async () => {
      const endpoint = process.env.MCP_SSE_ENDPOINT;
      if (!endpoint) {
        throw new Error("MCP_SSE_ENDPOINT is not set in .env");
      }
      const client = new Client({ name: "mandate-card-client", version: "0.1.0" });
      const transport = new SSEClientTransport(new URL(endpoint));
      try {
        await client.connect(transport);
      } catch (error) {
        clientPromise = null;
        throw new Error(
          `MCP card gateway connection failed: ${error instanceof Error ? error.message : String(error)}`
        );
      }
      return client;
    })();
  }
  return clientPromise;
}

export async function getCardChallenge({
  walletAddress,
  cardholderName,
  amountSgd,
}: GetCardChallengeArgs): Promise<unknown> {
  const client = await connect();

  let result: unknown;
  try {
    result = await client.callTool({
      name: "get_card_sandbox",
      arguments: {
        wallet_address: walletAddress,
        cardholder_name: cardholderName,
        amount_sgd: amountSgd,
      },
    });
  } catch (error) {
    throw new Error(
      `MCP card gateway tool call failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  const toolResult = result as ToolResultWithContent;

  if (toolResult.structuredContent) {
    return toolResult.structuredContent;
  }

  const content = Array.isArray(toolResult.content) ? toolResult.content : [];
  const textBlock = content.find((block): block is TextContentBlock => {
    return (
      typeof block === "object" &&
      block !== null &&
      (block as { type?: unknown }).type === "text" &&
      typeof (block as { text?: unknown }).text === "string"
    );
  });

  if (!textBlock) {
    throw new Error("get_card_sandbox returned no text content");
  }

  return JSON.parse(textBlock.text);
}
