process.loadEnvFile();

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

const endpoint = process.env.MCP_SSE_ENDPOINT;
if (!endpoint) {
  throw new Error("MCP_SSE_ENDPOINT is not set in .env");
}

const client = new Client({ name: "mandate-probe", version: "0.1.0" });
const transport = new SSEClientTransport(new URL(endpoint));

await client.connect(transport);

const { tools } = await client.listTools();

console.log(`Found ${tools.length} tool(s):\n`);
for (const tool of tools) {
  console.log(`Tool: ${tool.name}`);
  console.log(`Description: ${tool.description ?? "(none)"}`);
  console.log(`Input schema: ${JSON.stringify(tool.inputSchema, null, 2)}`);
  console.log("---");
}

await client.close();
process.exit(0);
