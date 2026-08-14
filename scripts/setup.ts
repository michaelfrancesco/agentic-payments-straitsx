import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

const ENV_PATH = ".env";
const EXAMPLE_PATH = ".env.example";

if (existsSync(ENV_PATH)) {
  const existing = readFileSync(ENV_PATH, "utf8");
  const match = existing.match(/^AGENT_ADDRESS=(0x[a-fA-F0-9]{40})$/m);
  if (match) {
    console.log("Wallet already set up.");
    console.log(`Address: ${match[1]}`);
    process.exit(0);
  }
}

const privateKey = generatePrivateKey();
const account = privateKeyToAccount(privateKey);

const template = readFileSync(EXAMPLE_PATH, "utf8");
const env = template
  .replace(/^AGENT_PRIVATE_KEY=.*$/m, `AGENT_PRIVATE_KEY=${privateKey}`)
  .replace(/^AGENT_ADDRESS=.*$/m, `AGENT_ADDRESS=${account.address}`);

writeFileSync(ENV_PATH, env);

console.log("Wallet generated. This is a throwaway hackathon wallet, do not reuse it.");
console.log(`Address: ${account.address}`);
console.log("Send this address to the organisers to be funded with sandbox XSGD.");
